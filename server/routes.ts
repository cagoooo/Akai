import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import { db, dbType } from "@db";
import { 
  toolUsageStats,
  visitorStats,
  errorLogs,
  achievements,
  userAchievements
} from "@db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { ampRouter } from './amp';
import { log } from './vite';
import path from "path";
import { getTimestamp, nowSql } from '../db/adapter';

// 定義類型以確保類型安全
interface VisitorStats {
  id?: number;
  totalVisits: number;
  dailyVisits: Record<string, number>;
  lastVisitAt?: Date;
}

interface ToolStats {
  id?: number;
  toolId: number;
  totalClicks: number;
  lastUsedAt: Date;
  categoryClicks?: Record<string, number>;
}

// 內存中的緩存，用於降級服務
const inMemoryCache: {
  visitorStats: VisitorStats;
  toolStats: Map<number, ToolStats>;
  rankings: ToolStats[];
} = {
  visitorStats: { totalVisits: 0, dailyVisits: {}, lastVisitAt: new Date() },
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
        try {
          // 如果沒有記錄，創建初始記錄
          const [newStats] = await db.insert(visitorStats).values({
            totalVisits: 0,
            dailyVisits: {},
            createdAt: getTimestamp(),
            lastVisitAt: getTimestamp()
          }).returning();
          
          // 更新內存緩存
          inMemoryCache.visitorStats = newStats;
          return res.json(newStats);
        } catch (insertError) {
          console.error("Error creating visitor stats:", insertError);
          // 使用內存緩存
          return res.json({
            ...inMemoryCache.visitorStats,
            _note: "從內存緩存提供的數據",
            _cached: true
          });
        }
      }

      // 更新內存緩存
      inMemoryCache.visitorStats = stats;
      res.json(stats);
    } catch (error) {
      console.error("Error fetching visitor stats:", error);
      
      // 返回內存中的緩存數據，而不是錯誤
      res.json({
        ...inMemoryCache.visitorStats,
        _note: "從內存緩存提供的數據，資料庫暫時不可用",
        _cached: true
      });
      
      // 錯誤記錄嘗試，但不中斷響應
      try {
        await db.insert(errorLogs).values({
          level: "error",
          message: "獲取訪問統計失敗",
          stack: error instanceof Error ? error.stack : undefined,
          metadata: { errorMessage: error instanceof Error ? error.message : "未知錯誤" },
          createdAt: getTimestamp()
        });
      } catch (logError) {
        console.error("Failed to log error:", logError);
      }
    }
  });

  app.post("/api/stats/visitors/increment", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 使用內存緩存更新，無論數據庫成功與否都能響應
      if (!inMemoryCache.visitorStats.dailyVisits) {
        inMemoryCache.visitorStats.dailyVisits = {};
      }
      
      inMemoryCache.visitorStats.totalVisits = (inMemoryCache.visitorStats.totalVisits || 0) + 1;
      inMemoryCache.visitorStats.dailyVisits[today] = (
        inMemoryCache.visitorStats.dailyVisits[today] || 0
      ) + 1;
      inMemoryCache.visitorStats.lastVisitAt = new Date();
      
      try {
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
              lastVisitAt: getTimestamp(),
              dailyVisits
            })
            .where(eq(visitorStats.id, stats.id))
            .returning();

          // 更新成功
          inMemoryCache.visitorStats = updated;
          return res.json({
            totalVisits: updated.totalVisits,
            dailyVisits: updated.dailyVisits,
            lastVisitAt: updated.lastVisitAt
          });
        } else {
          // 如果沒有記錄，創建初始記錄
          const [newStats] = await db.insert(visitorStats).values({
            totalVisits: 1,
            dailyVisits: { [today]: 1 },
            createdAt: getTimestamp(),
            lastVisitAt: getTimestamp()
          }).returning();

          inMemoryCache.visitorStats = newStats;
          return res.json(newStats);
        }
      } catch (dbError) {
        console.error("Database error updating visitor stats:", dbError);
        
        // 返回內存中的數據
        return res.json({
          ...inMemoryCache.visitorStats,
          _note: "資料庫更新失敗，但已在內存中記錄",
          _cached: true
        });
      }
    } catch (error) {
      console.error("Error updating visitor stats:", error);
      
      // 返回內存數據
      res.json({
        ...inMemoryCache.visitorStats,
        _note: "從內存緩存提供的數據，資料庫暫時不可用",
        _cached: true
      });
      
      // 嘗試記錄錯誤，但不影響響應
      try {
        await db.insert(errorLogs).values({
          level: "error",
          message: "更新訪問統計失敗",
          stack: error instanceof Error ? error.stack : undefined,
          metadata: {
            errorMessage: error instanceof Error ? error.message : "未知錯誤",
            timestamp: new Date().toISOString()
          },
          createdAt: getTimestamp()
        });
      } catch (logError) {
        console.error("Failed to log error:", logError);
      }
    }
  });

  // Tool usage tracking endpoints
  app.post("/api/tools/:toolId/track", async (req, res) => {
    try {
      const { toolId } = req.params;
      const parsedId = parseInt(toolId);
      
      // 內存緩存更新
      const toolStats = inMemoryCache.toolStats.get(parsedId) || { 
        toolId: parsedId,  // 確保 toolId 存在
        totalClicks: 0, 
        lastUsedAt: new Date() 
      } as ToolStats;
      toolStats.totalClicks += 1;
      toolStats.lastUsedAt = new Date();
      inMemoryCache.toolStats.set(parsedId, toolStats);

      try {
        const existingStats = await db.query.toolUsageStats.findFirst({
          where: eq(toolUsageStats.toolId, parsedId),
        });

        if (existingStats) {
          const currentTime = new Date();
          
          try {
            // 使用適當格式的時間戳
            await db
              .update(toolUsageStats)
              .set({ 
                totalClicks: existingStats.totalClicks + 1,
                lastUsedAt: currentTime
              })
              .where(eq(toolUsageStats.toolId, parsedId));
              
            console.log(`成功更新工具 ${parsedId} 的使用次數，新次數: ${existingStats.totalClicks + 1}`);
          } catch (updateError) {
            console.error(`更新工具 ${parsedId} 使用次數時出錯:`, updateError);
            // 更新內存緩存，即使數據庫操作失敗
            inMemoryCache.toolStats.set(parsedId, {
              ...existingStats,
              totalClicks: existingStats.totalClicks + 1,
              lastUsedAt: currentTime
            });
          }
        } else {
          const currentTime = new Date();
          await db.insert(toolUsageStats).values({
            toolId: parsedId,
            totalClicks: 1,
            createdAt: currentTime,
            lastUsedAt: currentTime
          });
        }

        // 獲取更新後的統計資料
        const updatedStats = await db.query.toolUsageStats.findFirst({
          where: eq(toolUsageStats.toolId, parsedId),
        });

        if (updatedStats) {
          // 更新內存緩存中的工具統計
          inMemoryCache.toolStats.set(parsedId, updatedStats);
          
          // 更新排行榜緩存
          // 1. 首先獲取最新的所有工具統計
          const allStats = await db.query.toolUsageStats.findMany({
            orderBy: desc(toolUsageStats.totalClicks),
            limit: 8,
          });
          
          // 2. 更新內存緩存中的排行榜
          if (allStats && allStats.length > 0) {
            inMemoryCache.rankings = allStats;
          }
        }

        res.json({ 
          message: "使用統計已更新",
          totalClicks: updatedStats?.totalClicks || 1,
          toolId: parsedId
        });
      } catch (dbError) {
        console.error("Database error tracking tool usage:", dbError);
        
        // 返回內存中的數據
        res.json({
          message: "使用統計已在內存中更新",
          totalClicks: toolStats.totalClicks,
          toolId: parsedId,
          _cached: true
        });
      }
    } catch (error) {
      console.error("Error tracking tool usage:", error);
      
      // 返回基本響應
      res.json({ 
        message: "使用統計處理遇到問題，但已記錄請求",
        _cached: true
      });
    }
  });

  app.get("/api/tools/rankings", async (_req, res) => {
    try {
      try {
        // 首先修復任何空的 lastUsedAt 記錄
        try {
          if (dbType === 'sqlite') {
            await db.run("UPDATE tool_usage_stats SET last_used_at = datetime('now') WHERE last_used_at IS NULL");
          } else if (sql) {
            await sql`UPDATE tool_usage_stats SET last_used_at = NOW() WHERE last_used_at IS NULL`;
          }
        } catch (fixError) {
          console.error("嘗試修復 lastUsedAt 空值時出錯:", fixError);
        }
        
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

          try {
            const newStats = await db.insert(toolUsageStats).values(initialStats).returning();
            inMemoryCache.rankings = newStats;
            return res.json(newStats);
          } catch (insertError) {
            console.error("Error initializing tool stats:", insertError);
            return res.json(initialStats);
          }
        }

        // 更新內存緩存
        inMemoryCache.rankings = stats;
        return res.json(stats);
      } catch (dbError) {
        console.error("Database error fetching rankings:", dbError);
        
        // 如果內存中有數據，使用內存數據
        if (inMemoryCache.rankings && inMemoryCache.rankings.length > 0) {
          return res.json({
            data: inMemoryCache.rankings,
            _note: "從內存緩存提供的數據",
            _cached: true
          });
        }
        
        // 否則返回默認數據
        const defaultRankings = Array.from({ length: 8 }, (_, i) => ({
          toolId: i + 1,
          totalClicks: (8 - i) * 10,
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
        
        return res.json({
          data: defaultRankings,
          _note: "無法連接數據庫，顯示預設排行榜",
          _cached: true
        });
      }
    } catch (error) {
      console.error("Error fetching rankings:", error);
      
      // 如果內存中有數據，使用內存數據
      if (inMemoryCache.rankings && inMemoryCache.rankings.length > 0) {
        return res.json({
          data: inMemoryCache.rankings,
          _note: "從內存緩存提供的數據",
          _cached: true
        });
      }
      
      // 否則返回基本響應
      res.json({
        message: "獲取排行榜數據時發生錯誤，顯示預設數據",
        data: Array.from({ length: 8 }, (_, i) => ({
          toolId: i + 1,
          totalClicks: (8 - i) * 10,
          lastUsedAt: new Date()
        })),
        _cached: true
      });
      
      // 嘗試記錄錯誤
      try {
        await db.insert(errorLogs).values({
          level: "error",
          message: "獲取工具排行榜失敗",
          stack: error instanceof Error ? error.stack : undefined,
          metadata: {
            endpoint: "/api/tools/rankings",
            timestamp: new Date().toISOString()
          },
          createdAt: getTimestamp()
        });
      } catch (logError) {
        console.error("Failed to log error:", logError);
      }
    }
  });

  app.get("/api/tools/stats", async (_req, res) => {
    try {
      // 從數據庫獲取數據
      try {
        // 首先修復任何空的 lastUsedAt 記錄
        try {
          if (dbType === 'sqlite') {
            await db.run("UPDATE tool_usage_stats SET last_used_at = datetime('now') WHERE last_used_at IS NULL");
          } else if (sql) {
            await sql`UPDATE tool_usage_stats SET last_used_at = NOW() WHERE last_used_at IS NULL`;
          }
        } catch (fixError) {
          console.error("嘗試修復 lastUsedAt 空值時出錯:", fixError);
        }
      
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

          try {
            const newStats = await db.insert(toolUsageStats).values(initialStats).returning();
            // 更新內存緩存
            newStats.forEach((stat: { toolId: number } & Record<string, any>) => {
              inMemoryCache.toolStats.set(stat.toolId, stat as unknown as ToolStats);
            });
            return res.json(newStats);
          } catch (insertError) {
            console.error("Error initializing tool stats:", insertError);
            return res.json({
              data: initialStats,
              _note: "使用預設數據，無法存儲到數據庫",
              _cached: true
            });
          }
        }

        // 更新內存緩存
        stats.forEach((stat: { toolId: number } & Record<string, any>) => {
          inMemoryCache.toolStats.set(stat.toolId, stat as unknown as ToolStats);
        });
        return res.json(stats);
      } catch (dbError) {
        console.error("Database error fetching tool stats:", dbError);
        
        // 如果內存中有數據，將內存數據轉換為數組
        if (inMemoryCache.toolStats.size > 0) {
          const cachedStats = Array.from(inMemoryCache.toolStats.values());
          return res.json({
            data: cachedStats,
            _note: "從內存緩存提供的數據",
            _cached: true
          });
        }
        
        throw new Error("無法從數據庫或內存獲取數據");
      }
    } catch (error) {
      console.error("Error fetching tool stats:", error);
      
      // 返回基本響應
      res.json({
        message: "獲取使用統計時發生錯誤，顯示有限數據",
        data: Array.from(inMemoryCache.toolStats.size > 0 
          ? inMemoryCache.toolStats.values() 
          : Array.from({ length: 10 }, (_, i) => ({
              toolId: i + 1,
              totalClicks: i * 5,
              lastUsedAt: new Date()
            }))),
        _cached: true
      });
      
      // 嘗試記錄錯誤
      try {
        await db.insert(errorLogs).values({
          level: "error",
          message: "獲取工具統計失敗",
          stack: error instanceof Error ? error.stack : undefined,
          metadata: {
            endpoint: "/api/tools/stats",
            timestamp: new Date().toISOString()
          },
          createdAt: getTimestamp()
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


  // 添加數據庫和系統診斷信息的路由
  app.get('/api/diagnostics/system-info', (_req, res) => {
    try {
      const info = {
        databaseType: dbType,
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      };
      
      // 添加元數據指示這是真實數據
      Object.assign(info, {
        _cached: false,
        _databaseType: dbType
      });
      
      res.json(info);
    } catch (error) {
      console.error("Error fetching system info:", error);
      res.status(500).json({ 
        message: "獲取系統信息失敗",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // 數據庫健康檢查路由
  app.get('/api/diagnostics/db-health', async (_req, res) => {
    try {
      const startTime = Date.now();
      
      let result: any;
      if (dbType === 'postgres' && sql) {
        result = await sql`SELECT NOW() as now, version() as version`;
      } else {
        result = db.run("SELECT datetime('now') as now, sqlite_version() as version");
      }
      
      const responseTime = Date.now() - startTime;
      
      res.json({
        status: "connected",
        databaseType: dbType,
        responseTime: `${responseTime}ms`,
        version: Array.isArray(result) ? result[0]?.version : result.version,
        timestamp: Array.isArray(result) ? result[0]?.now : result.now,
        _cached: false
      });
    } catch (error) {
      console.error("Database health check failed:", error);
      
      res.json({
        status: "error",
        databaseType: dbType,
        message: "無法連接到數據庫",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        _cached: true
      });
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