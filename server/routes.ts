import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { db } from "@db";
import { 
  toolUsageStats,
  visitorStats,
  errorLogs,
  achievements,
  userAchievements
} from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import { ampRouter } from './amp';
import { log } from './vite';
import path from "path";

// 內存中的緩存，用於降級服務
const inMemoryCache = {
  visitorStats: { totalVisits: 0, dailyVisits: {} },
  toolStats: new Map(),
  rankings: []
};

// 擴展 Express Request 類型以包含用戶信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
      };
    }
  }
}

export function registerRoutes(app: Express): Server {
  // Important: Register API routes before static file serving
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    // 為不同類型的 API 設置合適的快取策略
    if (path.startsWith("/api")) {
      if (req.method === "GET") {
        if (path.includes("/stats/") || path.includes("/rankings")) {
          // 高頻變更的統計數據 - 短時間快取
          res.setHeader("Cache-Control", "public, max-age=30");
        } else {
          // 其他 GET 請求 - 短時間快取，確保頻繁更新
          res.setHeader("Cache-Control", "public, max-age=60");
        }
      } else {
        // 寫入操作不應該被快取
        res.setHeader("Cache-Control", "no-store");
      }
    }

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  // 訪問計數器相關路由
  app.get("/api/stats/visitors", async (_req, res) => {
    try {
      const stats = await db.query.visitorStats.findFirst({
        orderBy: desc(visitorStats.id),
      });

      if (!stats) {
        // 如果沒有記錄，創建初始記錄
        const [newStats] = await db.insert(visitorStats).values({
          totalVisits: 0,
          dailyVisits: {},
        }).returning();
        return res.json(newStats);
      }

      res.json(stats);
    } catch (error) {
      console.error("Error fetching visitor stats:", error);
      res.status(500).json({ message: "獲取訪問統計時發生錯誤" });
    }
  });

  app.post("/api/stats/visitors/increment", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const stats = await db.query.visitorStats.findFirst({
        orderBy: desc(visitorStats.id),
      });

      if (stats) {
        const dailyVisits = stats.dailyVisits as Record<string, number>;
        dailyVisits[today] = (dailyVisits[today] || 0) + 1;

        const [updated] = await db
          .update(visitorStats)
          .set({
            totalVisits: stats.totalVisits + 1,
            lastVisitAt: new Date(),
            dailyVisits
          })
          .where(eq(visitorStats.id, stats.id))
          .returning();

        res.json({
          totalVisits: updated.totalVisits,
          dailyVisits: updated.dailyVisits,
          lastVisitAt: updated.lastVisitAt
        });
      } else {
        // 如果沒有記錄，創建初始記錄
        const [newStats] = await db.insert(visitorStats).values({
          totalVisits: 1,
          dailyVisits: { [today]: 1 },
        }).returning();

        res.json(newStats);
      }
    } catch (error) {
      console.error("Error updating visitor stats:", error);
      try {
        await db.insert(errorLogs).values({
          level: "error",
          message: "更新訪問統計失敗",
          stack: error instanceof Error ? error.stack : undefined,
          metadata: {
            errorMessage: error instanceof Error ? error.message : "未知錯誤",
            timestamp: new Date().toISOString()
          }
        });
      } catch (logError) {
        console.error("Failed to log error:", logError);
      }

      res.status(500).json({ message: "更新訪問統計時發生錯誤" });
    }
  });

  // Tool usage tracking endpoints
  app.post("/api/tools/:toolId/track", async (req, res) => {
    try {
      const { toolId } = req.params;
      const parsedId = parseInt(toolId);

      const existingStats = await db.query.toolUsageStats.findFirst({
        where: eq(toolUsageStats.toolId, parsedId),
      });

      if (existingStats) {
        await db
          .update(toolUsageStats)
          .set({ 
            totalClicks: existingStats.totalClicks + 1,
            lastUsedAt: new Date()
          })
          .where(eq(toolUsageStats.toolId, parsedId));
      } else {
        await db.insert(toolUsageStats).values({
          toolId: parsedId,
          totalClicks: 1,
        });
      }

      // 獲取更新後的統計資料
      const updatedStats = await db.query.toolUsageStats.findFirst({
        where: eq(toolUsageStats.toolId, parsedId),
      });

      res.json({ 
        message: "使用統計已更新",
        totalClicks: updatedStats?.totalClicks || 1,
        toolId: parsedId
      });
    } catch (error) {
      console.error("Error tracking tool usage:", error);
      res.status(500).json({ message: "更新使用統計時發生錯誤" });
    }
  });

  app.get("/api/tools/rankings", async (_req, res) => {
    try {
      const stats = await db.query.toolUsageStats.findMany({
        orderBy: desc(toolUsageStats.totalClicks),
        limit: 8,
      });

      // 如果沒有數據，初始化一些基本數據
      if (!stats || stats.length === 0) {
        const initialStats = Array.from({ length: 10 }, (_, i) => ({
          toolId: i + 1,
          totalClicks: 0,
          lastUsedAt: new Date(),
          categoryClicks: {
            communication: 0,
            teaching: 0,
            language: 0,
            reading: 0,
            utilities: 0,
            games: 0
          }
        }));

        const newStats = await db.insert(toolUsageStats).values(initialStats).returning();
        return res.json(newStats);
      }

      res.json(stats);
    } catch (error) {
      console.error("Error fetching rankings:", error);
      res.status(500).json({
        message: "獲取排行榜時發生錯誤",
        error: error instanceof Error ? error.message : "未知錯誤",
        timestamp: new Date().toISOString()
      });

      try {
        await db.insert(errorLogs).values({
          level: "error",
          message: "獲取工具排行榜失敗",
          stack: error instanceof Error ? error.stack : undefined,
          metadata: {
            endpoint: "/api/tools/rankings",
            timestamp: new Date().toISOString()
          }
        });
      } catch (logError) {
        console.error("Failed to log error:", logError);
      }
    }
  });

  app.get("/api/tools/stats", async (_req, res) => {
    try {
      const stats = await db.query.toolUsageStats.findMany({
        orderBy: desc(toolUsageStats.totalClicks),
      });

      if (!stats || stats.length === 0) {
        const initialStats = Array.from({ length: 10 }, (_, i) => ({
          toolId: i + 1,
          totalClicks: 0,
          lastUsedAt: new Date(),
          categoryClicks: {
            communication: 0,
            teaching: 0,
            language: 0,
            reading: 0,
            utilities: 0,
            games: 0
          }
        }));

        const newStats = await db.insert(toolUsageStats).values(initialStats).returning();
        return res.json(newStats);
      }

      res.json(stats);
    } catch (error) {
      console.error("Error fetching tool stats:", error);
      res.status(500).json({
        message: "獲取使用統計時發生錯誤",
        error: error instanceof Error ? error.message : "未知錯誤",
        timestamp: new Date().toISOString()
      });

      try {
        await db.insert(errorLogs).values({
          level: "error",
          message: "獲取工具統計失敗",
          stack: error instanceof Error ? error.stack : undefined,
          metadata: {
            endpoint: "/api/tools/stats",
            timestamp: new Date().toISOString()
          }
        });
      } catch (logError) {
        console.error("Failed to log error:", logError);
      }
    }
  });

  // New endpoint for tour completion reward
  app.post("/api/tour/complete", async (req, res) => {
    try {
      const userId = req.user?.id;

      // Create tour completion achievement if it doesn't exist
      const tourAchievement = await db.query.achievements.findFirst({
        where: eq(achievements.name, "網站導覽達人")
      });

      if (!tourAchievement) {
        const [achievement] = await db.insert(achievements).values({
          name: "網站導覽達人",
          description: "完成網站全部功能的導覽教學",
          icon: "🎯",
          category: "tutorial",
          requirements: {
            type: "tour_completion",
            required: true
          }
        }).returning();

        if (userId) {
          await db.insert(userAchievements).values({
            userId,
            achievementId: achievement.id,
            progress: { completed: true }
          });
        }

        return res.json({
          message: "恭喜獲得「網站導覽達人」成就！",
          achievement: achievement
        });
      }

      // If achievement exists and user is logged in, assign it
      if (userId && tourAchievement) {
        const existingUserAchievement = await db.query.userAchievements.findFirst({
          where: and(
            eq(userAchievements.userId, userId),
            eq(userAchievements.achievementId, tourAchievement.id)
          )
        });

        if (!existingUserAchievement) {
          await db.insert(userAchievements).values({
            userId,
            achievementId: tourAchievement.id,
            progress: { completed: true }
          });
        }
      }

      res.json({
        message: "恭喜完成網站導覽！",
        achievement: tourAchievement
      });
    } catch (error) {
      console.error("Error handling tour completion:", error);
      res.status(500).json({ message: "處理導覽完成獎勵時發生錯誤" });
    }
  });


  // Add AMP routes
  app.use('/amp', ampRouter);

  // After all API routes, serve static files
  app.use(express.static(path.join(process.cwd(), "client/public"), {
    index: false,
    extensions: ["html", "ico"]
  }));

  const httpServer = createServer(app);
  return httpServer;
}