import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { db } from "@db";
import { 
  sharedResources, collaborators, users, moodEntries, 
  achievements, userAchievements, errorLogs, systemMetrics,
  toolUsageStats, visitorStats,
  insertSharedResourceSchema, insertCollaboratorSchema, 
  insertMoodEntrySchema, insertUserAchievementSchema,
  insertErrorLogSchema, insertSystemMetricSchema,
  insertToolUsageStatsSchema, insertVisitorStatsSchema
} from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Serve static files from the public directory
  app.use(express.static(path.join(process.cwd(), "client/public"), {
    index: false,
    extensions: ["html", "ico"]
  }));

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

  // New endpoint for mood entries
  app.post("/api/mood-entries", async (req, res) => {
    try {
      const parsedBody = insertMoodEntrySchema.parse(req.body);
      const userId = req.user?.id; 
      const moodEntry = await db.insert(moodEntries).values({
        ...parsedBody,
        userId: userId || null,
      }).returning();
      res.json(moodEntry[0]);
    } catch (error) {
      console.error("Mood entry error:", error);
      res.status(400).json({ message: "無效的心情資料" });
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

      res.json({ message: "使用統計已更新" });
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

  const httpServer = createServer(app);
  return httpServer;
}