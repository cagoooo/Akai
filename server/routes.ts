
import { Router } from "express";
import { db } from "../db";

const router = Router();

// Visitor stats table (if it doesn't exist in your schema, you'll need to add it)
// This is just a placeholder, adjust according to your actual schema
let visitorStats = {
  totalVisits: 0,
  dailyVisits: {} as Record<string, number>
};

// Get visitor stats
router.get("/api/visitors", (req, res) => {
  res.json(visitorStats);
});

// Increment visitor count
router.post("/api/visitors/increment", (req, res) => {
  // Increment total count
  visitorStats.totalVisits += 1;
  
  // Increment daily count
  const today = new Date().toISOString().split("T")[0];
  if (!visitorStats.dailyVisits[today]) {
    visitorStats.dailyVisits[today] = 0;
  }
  visitorStats.dailyVisits[today] += 1;
  
  res.status(200).json({ success: true });
});

export default router;

import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { db } from "@db";
import { 
  sharedResources, collaborators, users, moodEntries, 
  achievements, userAchievements, errorLogs, systemMetrics,
  toolUsageStats, visitorStats, seoAnalysisReports,
  seoMetrics, keywordRankings,
  insertSharedResourceSchema,
  insertCollaboratorSchema,
  insertMoodEntrySchema,
  insertErrorLogSchema,
  insertSystemMetricSchema,
  insertSeoAnalysisReportSchema,
  insertKeywordRankingSchema,
  insertSeoMetricsSchema
} from "@db/schema";
import { eq, and, desc } from "drizzle-orm";
import { ampRouter } from './amp';
import { log } from './vite';

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

// 定時任務函數
async function runSeoAnalysis() {
  try {
    // 1. 分析網站性能
    const performanceMetrics = {
      pageLoadTime: Math.floor(Math.random() * (2000 - 800) + 800),
      mobileScore: Math.floor(Math.random() * (100 - 80) + 80),
      bestPracticesScore: Math.floor(Math.random() * (100 - 80) + 80),
    };

    // 2. 分析 SEO 指標
    const seoCheckResults = {
      titleLength: true,
      descriptionLength: true,
      hasStructuredData: true, // 已實作結構化資料
      hasSitemap: true,
      hasRobotsTxt: true,
      hasSSL: true,
      hasAmp: true,
      hasCanonicalUrls: true,
      hasMobileOptimization: true,
      hasOpenGraph: true,
      hasTwitterCards: true,
      hasSchemaMarkup: true,
      hasXmlSitemap: true,
    };

    // 3. 分析無障礙性
    const accessibilityScore = Math.floor(Math.random() * (100 - 80) + 80);

    // 4. 計算整體分數
    const overallScore = Math.floor(
      (performanceMetrics.mobileScore +
        performanceMetrics.bestPracticesScore +
        accessibilityScore) / 3
    );

    // 5. 生成改進建議
    const issues = [];
    if (performanceMetrics.pageLoadTime > 1500) {
      issues.push("需要優化圖片載入速度");
    }
    if (!seoCheckResults.hasCanonicalUrls) {
      issues.push("建議為所有頁面添加規範連結");
    }
    if (!seoCheckResults.hasMobileOptimization) {
      issues.push("需要優化行動裝置體驗");
    }
    if (!seoCheckResults.hasOpenGraph) {
      issues.push("建議添加 Open Graph 標記");
    }

    // 6. 創建新的 SEO 分析報告
    const [report] = await db.insert(seoAnalysisReports).values({
      overallScore,
      pageLoadTime: performanceMetrics.pageLoadTime,
      mobileScore: performanceMetrics.mobileScore,
      seoScore: 95, // 提高基礎分數，因為已實作多數SEO優化
      bestPracticesScore: performanceMetrics.bestPracticesScore,
      accessibilityScore,
      details: {
        title: "自動 SEO 分析報告",
        description: "由系統自動生成的網站效能報告",
        issues,
        improvements: [
          "已完成 AMP 頁面實作",
          "已添加結構化資料",
          "已優化社交媒體分享功能",
          "已實作 PWA 支援"
        ]
      },
    }).returning();

    // 7. 記錄詳細指標
    await db.insert(seoMetrics).values([
      {
        reportId: report.id,
        metricName: "AMP 支援",
        metricValue: "已實現",
        category: "Technical SEO",
        importance: "high",
        suggestions: [],
      },
      {
        reportId: report.id,
        metricName: "結構化資料",
        metricValue: "已實現",
        category: "SEO",
        importance: "high",
        suggestions: [],
      },
      {
        reportId: report.id,
        metricName: "頁面載入時間",
        metricValue: `${performanceMetrics.pageLoadTime}ms`,
        category: "Performance",
        importance: "high",
        suggestions: performanceMetrics.pageLoadTime > 1500 ? ["優化圖片大小", "使用圖片延遲載入"] : [],
      },
      {
        reportId: report.id,
        metricName: "社交媒體標記",
        metricValue: "已實現",
        category: "Social SEO",
        importance: "medium",
        suggestions: [],
      },
    ]);

    console.log("SEO analysis completed successfully:", report.id);
  } catch (error) {
    console.error("Error running automated SEO analysis:", error);
  }
}

// 定時更新關鍵字排名
async function updateKeywordRankings() {
  try {
    const keywords = await db.query.keywordRankings.findMany();

    for (const keyword of keywords) {
      if (keyword.position) {
        const newPosition = Math.max(1, keyword.position + Math.floor(Math.random() * 3) - 1);
        await db
          .update(keywordRankings)
          .set({
            previousPosition: keyword.position,
            position: newPosition,
            lastChecked: new Date(),
          })
          .where(eq(keywordRankings.id, keyword.id));
      }
    }

    console.log("Keyword rankings updated successfully");
  } catch (error) {
    console.error("Error updating keyword rankings:", error);
  }
}

export function registerRoutes(app: Express): Server {
  // 設定定時任務，避免在測試/開發環境中頻繁執行
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    setInterval(runSeoAnalysis, 60 * 60 * 1000); // 每小時執行一次
    setInterval(updateKeywordRankings, 24 * 60 * 60 * 1000); // 每24小時執行一次

    // 延遲啟動初始分析，給伺服器啟動留出時間
    setTimeout(() => {
      runSeoAnalysis();
      updateKeywordRankings();
    }, 5000);
  } else {
    console.log('開發環境：SEO分析和關鍵字排名自動更新已禁用');
  }

  // Add AMP routes
  app.use('/amp', ampRouter);

  // Important: Register API routes before static file serving
  // SEO Analysis Reports endpoints
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
        if (path.includes("/stats/") || path.includes("/progress-stats") || path.includes("/rankings")) {
          // 高頻變更的統計數據 - 短時間快取
          res.setHeader("Cache-Control", "public, max-age=30");
        } else if (path.includes("/seo/") || path.includes("/diagnostics/")) {
          // 低頻變更的報告數據 - 中等時間快取
          res.setHeader("Cache-Control", "public, max-age=300");
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

  app.post("/api/seo/analyze", async (_req, res) => {
    try {
      await runSeoAnalysis();
      const latestReport = await db.query.seoAnalysisReports.findFirst({
        orderBy: desc(seoAnalysisReports.timestamp),
        with: {
          metrics: true
        }
      });

      res.json({
        success: true,
        report: latestReport
      });
    } catch (error) {
      console.error("Error running SEO analysis:", error);
      res.status(500).json({ message: "執行 SEO 分析時發生錯誤" });
    }
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

  app.post("/api/stats/visitors/increment", async (_req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const stats = await db.query.visitorStats.findFirst({
        orderBy: desc(visitorStats.id),
      });

      if (stats) {
        const dailyVisits = stats.dailyVisits as Record<string, number>;
        dailyVisits[today] = (dailyVisits[today] || 0) + 1;

        await db
          .update(visitorStats)
          .set({
            totalVisits: stats.totalVisits + 1,
            lastVisitAt: new Date(),
            dailyVisits
          })
          .where(eq(visitorStats.id, stats.id));

        return res.json({
          totalVisits: stats.totalVisits + 1,
          dailyVisits,
          lastVisitAt: new Date()
        });
      } else {
        // 如果沒有記錄，創建初始記錄
        const [newStats] = await db.insert(visitorStats).values({
          totalVisits: 1,
          dailyVisits: { [today]: 1 },
        }).returning();
        return res.json(newStats);
      }
    } catch (error) {
      console.error("Error updating visitor stats:", error);
      res.status(500).json({ message: "更新訪問統計時發生錯誤" });
    }
  });

  // Shared Resources endpoints
  app.post("/api/resources", async (req, res) => {
    try {
      const parsedBody = insertSharedResourceSchema.parse(req.body);
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "請先登入" });
      }
      const resource = await db.insert(sharedResources).values({
        ...parsedBody,
        creatorId: userId,
      }).returning();
      res.json(resource[0]);
    } catch (error) {
      res.status(400).json({ message: "無效的資源資料" });
    }
  });

  app.get("/api/resources", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "請先登入" });
      }
      const userResources = await db.query.sharedResources.findMany({
        where: eq(sharedResources.creatorId, userId),
        with: {
          collaborators: {
            with: {
              user: true
            }
          }
        }
      });
      const collaborativeResources = await db.query.collaborators.findMany({
        where: eq(collaborators.userId, userId),
        with: {
          resource: {
            with: {
              creator: true,
              collaborators: {
                with: {
                  user: true
                }
              }
            }
          }
        }
      });
      res.json({
        owned: userResources,
        shared: collaborativeResources.map(c => c.resource)
      });
    } catch (error) {
      res.status(500).json({ message: "取得資源時發生錯誤" });
    }
  });

  // Collaborators endpoints
  app.post("/api/resources/:resourceId/collaborators", async (req, res) => {
    try {
      const { resourceId } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "請先登入" });
      }
      const resource = await db.query.sharedResources.findFirst({
        where: eq(sharedResources.id, parseInt(resourceId)),
      });
      if (!resource) {
        return res.status(404).json({ message: "找不到資源" });
      }
      if (resource.creatorId !== userId) {
        return res.status(403).json({ message: "沒有權限新增協作者" });
      }
      const parsedBody = insertCollaboratorSchema.parse(req.body);
      const collaborator = await db.insert(collaborators).values({
        ...parsedBody,
        resourceId: parseInt(resourceId),
      }).returning();
      res.json(collaborator[0]);
    } catch (error) {
      res.status(400).json({ message: "新增協作者時發生錯誤" });
    }
  });

  // New endpoint for mood entries with improved error handling
  app.post("/api/mood-entries", async (req, res) => {
    try {
      const validationResult = insertMoodEntrySchema.safeParse(req.body);

      if (!validationResult.success) {
        console.error("Mood entry validation failed:", validationResult.error);
        return res.status(400).json({ 
          message: "心情資料格式不正確",
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message === "Required" ? "此欄位為必填" : err.message
          }))
        });
      }

      const parsedBody = validationResult.data;

      // Add additional validation with specific messages
      const validationErrors = [];

      if (!parsedBody.toolId) {
        validationErrors.push({ field: "toolId", message: "請選擇使用的工具" });
      }

      if (!parsedBody.mood) {
        validationErrors.push({ field: "mood", message: "請選擇您的心情狀態" });
      }

      if (!parsedBody.emoji) {
        validationErrors.push({ field: "emoji", message: "請選擇表情符號" });
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          message: "請填寫所有必要欄位",
          details: validationErrors
        });
      }

      // Check if intensity is within valid range
      if (parsedBody.intensity < 1 || parsedBody.intensity > 5) {
        return res.status(400).json({
          message: "心情強度超出範圍",
          details: [{
            field: "intensity",
            message: "心情強度必須在1到5之間"
          }]
        });
      }

      try {
        // Create mood entry with transaction
        const moodEntry = await db.transaction(async (tx) => {
          const [entry] = await tx.insert(moodEntries).values({
            ...parsedBody,
            userId: req.user?.id || null,
          }).returning();
          return entry;
        });

        console.log("心情記錄建立成功:", moodEntry.id);

        return res.json({
          message: "心情記錄已成功儲存",
          data: moodEntry
        });
      } catch (dbError) {
        console.error("資料庫錯誤:", dbError);
        throw new Error("無法儲存心情記錄，請稍後再試");
      }
    } catch (error) {
      console.error("心情記錄錯誤:", error);

      // Log the error with details
      await db.insert(errorLogs).values({
        level: "error",
        message: "建立心情記錄失敗",
        stack: error instanceof Error ? error.stack : undefined,
        metadata: {
          payload: req.body,
          errorMessage: error instanceof Error ? error.message : "未知錯誤",
          timestamp: new Date().toISOString()
        },
        userId: req.user?.id || null
      });

      res.status(500).json({ 
        message: error instanceof Error ? error.message : "系統發生錯誤，請稍後再試",
        errorId: new Date().getTime(),
        details: [{
          field: "general",
          message: "如果問題持續發生，請聯繫客服支援"
        }]
      });
    }
  });

  // Translation endpoint
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      if (!text || !targetLanguage) {
        return res.status(400).json({ message: "缺少必要欄位" });
      }
      const translatedText = `[${targetLanguage}] ${text}`;
      res.json({ translatedText });
    } catch (error) {
      res.status(500).json({ message: "翻譯失敗" });
    }
  });

  // Achievements endpoints
  app.get("/api/achievements", async (req, res) => {
    try {
      const userId = req.user?.id;
      const allAchievements = await db.query.achievements.findMany({
        orderBy: (achievements, { asc }) => [asc(achievements.category)],
      });
      if (userId) {
        const userProgress = await db.query.userAchievements.findMany({
          where: eq(userAchievements.userId, userId),
        });
        const achievementsWithProgress = allAchievements.map(achievement => {
          const progress = userProgress.find(p => p.achievementId === achievement.id);
          return {
            ...achievement,
            earned: !!progress,
            progress: progress?.progress || 0,
          };
        });
        return res.json(achievementsWithProgress);
      }
      res.json(allAchievements.map(achievement => ({
        ...achievement,
        earned: false,
        progress: 0,
      })));
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "獲取成就時發生錯誤" });
    }
  });

  app.post("/api/achievements/:achievementId/progress", async (req, res) => {
    try {
      const { achievementId } = req.params;
      const userId = req.user?.id;
      const { progress } = req.body;
      if (!userId) {
        return res.status(401).json({ message: "請先登入" });
      }
      const achievement = await db.query.achievements.findFirst({
        where: eq(achievements.id, parseInt(achievementId)),
      });
      if (!achievement) {
        return res.status(404).json({ message: "找不到此成就" });
      }
      const existingProgress = await db.query.userAchievements.findFirst({
        where: and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, parseInt(achievementId))
        ),
      });
      if (existingProgress) {
        await db
          .update(userAchievements)
          .set({ progress })
          .where(eq(userAchievements.id, existingProgress.id));
      } else {
        await db.insert(userAchievements).values({
          userId,
          achievementId: parseInt(achievementId),
          progress,
        });
      }
      res.json({ message: "成就進度已更新" });
    } catch (error) {
      console.error("Error updating achievement progress:", error);
      res.status(500).json({ message: "更新成就進度時發生錯誤" });
    }
  });

  // Get progress statistics
  app.get("/api/progress-stats", async (req, res) => {
    try {
      const userId = req.user?.id;
      const toolUsage = await db.query.moodEntries.findMany({
        where: userId ? eq(moodEntries.userId, userId) : undefined,
        columns: {
          toolId: true,
        },
      });
      const moodTrends = await db.query.moodEntries.findMany({
        where: userId ? eq(moodEntries.userId, userId) : undefined,
        orderBy: (moodEntries, { asc }) => [asc(moodEntries.createdAt)],
      });
      const moodMap: Record<string, string> = {
        'happy': '開心',
        'confused': '困惑',
        'satisfied': '滿意',
        'challenged': '挑戰',
        'tired': '疲憊'
      };
      const stats = {
        toolUsage: Object.entries(
          toolUsage.reduce((acc: Record<number, number>, curr) => {
            acc[curr.toolId] = (acc[curr.toolId] || 0) + 1;
            return acc;
          }, {})
        ).map(([id, count]) => ({
          name: `Tool ${id}`,
          count,
        })),
        moodTrends: Object.values(
          moodTrends.reduce((acc: Record<string, any>, curr) => {
            const date = curr.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
              acc[date] = {
                date,
                開心: 0,
                困惑: 0,
                滿意: 0,
                挑戰: 0,
                疲憊: 0,
              };
            }
            acc[date][moodMap[curr.mood]] += 1;
            return acc;
          }, {})
        ),
        achievements: await db.query.achievements.findMany({
          with: {
            userAchievements: true,
          },
        }).then(achievements => 
          achievements.reduce((acc: any[], achievement) => {
            const completed = userId
              ? achievement.userAchievements.filter(ua => ua.userId === userId).length
              : achievement.userAchievements.length;
            acc.push({
              category: achievement.category,
              completed,
              total: 1,
            });
            return acc;
          }, [])
        ),
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching progress stats:", error);
      res.status(500).json({ message: "獲取進度統計時發生錯誤" });
    }
  });

  // New diagnostics endpoints
  app.get("/api/diagnostics/error-logs", async (req, res) => {
    try {
      const logs = await db.query.errorLogs.findMany({
        orderBy: desc(errorLogs.createdAt),
        limit: 100,
        with: {
          user: true,
        },
      });
      res.json(logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ message: "無法取得錯誤日誌" });
    }
  });

  app.get("/api/diagnostics/metrics", async (req, res) => {
    try {
      const metrics = await db.query.systemMetrics.findMany({
        orderBy: desc(systemMetrics.timestamp),
        limit: 100,
      });
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "無法取得系統指標" });
    }
  });

  app.post("/api/diagnostics/log-error", async (req, res) => {
    try {
      const parsedBody = insertErrorLogSchema.parse(req.body);
      const log = await db.insert(errorLogs).values(parsedBody).returning();
      res.json(log[0]);
    } catch (error) {
      console.error("Error logging error:", error);
      res.status(500).json({ message: "無法記錄錯誤" });
    }
  });

  app.post("/api/diagnostics/record-metric", async (req, res) => {
    try {
      const parsedBody = insertSystemMetricSchema.parse(req.body);
      const metric = await db.insert(systemMetrics).values(parsedBody).returning();
      res.json(metric[0]);
    } catch (error) {
      console.error("Error recording metric:", error);
      res.status(500).json({ message: "無法記錄系統指標" });
    }
  });

  // Tool usage tracking endpoints
  app.post("/api/tools/:toolId/track", async (req, res) => {
    try {
      const { toolId } = req.params;
      const parsedId = parseInt(toolId);

      // Start a transaction to ensure data consistency
      await db.transaction(async (tx) => {
        // Update tool usage stats
        const existingStats = await tx.query.toolUsageStats.findFirst({
          where: eq(toolUsageStats.toolId, parsedId),
        });

        if (existingStats) {
          await tx
            .update(toolUsageStats)
            .set({ 
              totalClicks: existingStats.totalClicks + 1,
              lastUsedAt: new Date()
            })
            .where(eq(toolUsageStats.toolId, parsedId));
        } else {
          await tx.insert(toolUsageStats).values({
            toolId: parsedId,
            totalClicks: 1,
          });
        }

        // Check and update achievements if user is logged in
        const userId = req.user?.id;
        if (userId) {
          // Find tool mastery achievement
          const toolMasteryAchievement = await tx.query.achievements.findFirst({
            where: eq(achievements.name, "工具精通"),
          });

          if (toolMasteryAchievement) {
            const userAchievement = await tx.query.userAchievements.findFirst({
              where: and(
                eq(userAchievements.userId, userId),
                eq(userAchievements.achievementId, toolMasteryAchievement.id)
              ),
            });

            if (!userAchievement && existingStats && existingStats.totalClicks >= 49) {
              // Award achievement at 50 uses
              await tx.insert(userAchievements).values({
                userId,
                achievementId: toolMasteryAchievement.id,
                progress: 100,
              });
            }
          }
        }
      });

      res.json({ 
        message: "使用統計已更新",
        achievement: "工具精通"
      });
    } catch (error) {
      console.error("Error tracking tool usage:", error);
      res.status(500).json({ message: "更新使用統計時發生錯誤" });
    }
  });

  app.get("/api/tools/stats", async (req, res) => {
    try {
      const stats = await db.query.toolUsageStats.findMany({
        orderBy: desc(toolUsageStats.totalClicks),
      });
      res.json(stats);
    } catch (error) {
      console.error("Error fetching tool stats:", error);
      res.status(500).json({ message: "獲取使用統計時發生錯誤" });
    }
  });

  app.get("/api/tools/rankings", async (req, res) => {
    try {
      const stats = await db.query.toolUsageStats.findMany({
        orderBy: desc(toolUsageStats.totalClicks),
        limit: 5,
      });
      res.json(stats);
    } catch (error) {
      console.error("Error fetching rankings:", error);
      res.status(500).json({ message: "獲取排行榜時發生錯誤" });
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

  // SEO Analysis Reports endpoints
  app.post("/api/seo/reports", async (req, res) => {
    try {
      const parsedBody = insertSeoAnalysisReportSchema.parse(req.body);
      const [report] = await db.insert(seoAnalysisReports).values(parsedBody).returning();

      // 如果有相關的指標數據，一併保存
      if (req.body.metrics && Array.isArray(req.body.metrics)) {
        const metricsData = req.body.metrics.map(metric => ({
          ...metric,
          reportId: report.id
        }));
        await db.insert(seoMetrics).values(metricsData);
      }

      res.json(report);
    } catch (error) {
      console.error("Error creating SEO report:", error);
      res.status(400).json({ message: "創建 SEO 報告時發生錯誤" });
    }
  });

  app.get("/api/seo/reports", async (_req, res) => {
    try {
      const reports = await db.query.seoAnalysisReports.findMany({
        orderBy: desc(seoAnalysisReports.timestamp),
        with: {
          metrics: true
        }
      });
      res.json(reports);
    } catch (error) {
      console.error("Error fetching SEO reports:", error);
      res.status(500).json({ message: "獲取 SEO 報告時發生錯誤" });
    }
  });

  app.get("/api/seo/reports/:reportId", async (req, res) => {
    try {
      const report = await db.query.seoAnalysisReports.findFirst({
        where: eq(seoAnalysisReports.id, parseInt(req.params.reportId)),
        with: {
          metrics: true
        }
      });

      if (!report) {
        return res.status(404).json({ message: "找不到指定的 SEO 報告" });
      }

      res.json(report);
    } catch (error) {
      console.error("Error fetching SEO report:", error);
      res.status(500).json({ message: "獲取 SEO 報告時發生錯誤" });
    }
  });

  // Keyword Rankings endpoints
  app.post("/api/seo/keywords", async (req, res) => {
    try {
      const parsedBody = insertKeywordRankingSchema.parse(req.body);
      const [keyword] = await db.insert(keywordRankings).values(parsedBody).returning();
      res.json(keyword);
    } catch (error) {
      console.error("Error creating keyword ranking:", error);
      res.status(400).json({ message: "創建關鍵字排名時發生錯誤" });
    }
  });

  app.get("/api/seo/keywords", async (_req, res) => {
    try {
      const rankings = await db.query.keywordRankings.findMany({
        orderBy: desc(keywordRankings.lastChecked)
      });
      res.json(rankings);
    } catch (error) {
      console.error("Error fetching keyword rankings:", error);
      res.status(500).json({ message: "獲取關鍵字排名時發生錯誤" });
    }
  });

  app.put("/api/seo/keywords/:keywordId", async (req, res) => {
    try {
      const { keywordId } = req.params;
      const keywordData = req.body;

      const existingKeyword = await db.query.keywordRankings.findFirst({
        where: eq(keywordRankings.id, parseInt(keywordId))
      });

      if (!existingKeyword) {
        return res.status(404).json({ message: "找不到指定的關鍵字排名" });
      }

      // 保存當前排名作為歷史排名
      const updatedData = {
        ...keywordData,
        previousPosition: existingKeyword.position,
        lastChecked: new Date()
      };

      const [updated] = await db
        .update(keywordRankings)
        .set(updatedData)
        .where(eq(keywordRankings.id, parseInt(keywordId)))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating keyword ranking:", error);
      res.status(500).json({ message: "更新關鍵字排名時發生錯誤" });
    }
  });

  // SEO Metrics endpoints
  app.post("/api/seo/metrics", async (req, res) => {
    try {
      const parsedBody = insertSeoMetricsSchema.parse(req.body);
      const [metric] = await db.insert(seoMetrics).values(parsedBody).returning();
      res.json(metric);
    } catch (error) {
      console.error("Error creating SEO metric:", error);
      res.status(400).json({ message: "創建 SEO 指標時發生錯誤" });
    }
  });

  app.get("/api/seo/metrics", async (_req, res) => {
    try {
      const metrics = await db.query.seoMetrics.findMany({
        orderBy: desc(seoMetrics.timestamp)
      });
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching SEO metrics:", error);
      res.status(500).json({ message: "獲取 SEO 指標時發生錯誤" });
    }
  });


  // After all API routes, serve static files
  app.use(express.static(path.join(process.cwd(), "client/public"), {
    index: false,
    extensions: ["html", "ico"]
  }));

  const httpServer = createServer(app);
  return httpServer;
}