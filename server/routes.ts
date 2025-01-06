import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { 
  sharedResources, collaborators, users, moodEntries, 
  achievements, userAchievements,
  insertSharedResourceSchema, insertCollaboratorSchema, 
  insertMoodEntrySchema, insertUserAchievementSchema 
} from "@db/schema";
import { eq, and } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
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
      const userId = req.user?.id; // Optional for now

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
        return res.status(400).json({ message: "Missing required fields" });
      }

      // TODO: Implement actual translation using Azure Translator API
      // For now, we'll return a mock translation
      const translatedText = `[${targetLanguage}] ${text}`;

      res.json({ translatedText });
    } catch (error) {
      res.status(500).json({ message: "Translation failed" });
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
        // If user is logged in, fetch their progress
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

      // If no user, return achievements without progress
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
        // Update existing progress
        await db
          .update(userAchievements)
          .set({ progress })
          .where(eq(userAchievements.id, existingProgress.id));
      } else {
        // Create new progress entry
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

  // Add new endpoint for progress statistics
  app.get("/api/progress-stats", async (req, res) => {
    try {
      const userId = req.user?.id;

      // Get tool usage statistics
      const toolUsage = await db.query.moodEntries.findMany({
        where: userId ? eq(moodEntries.userId, userId) : undefined,
        columns: {
          toolId: true,
        },
      });

      // Get mood trends
      const moodTrends = await db.query.moodEntries.findMany({
        where: userId ? eq(moodEntries.userId, userId) : undefined,
        orderBy: (moodEntries, { asc }) => [asc(moodEntries.createdAt)],
      });

      // Get achievement statistics
      const achievementStats = await db.query.achievements.findMany({
        with: {
          userAchievements: true,
        },
      });

      // Process and aggregate the data
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
        moodTrends: moodTrends.reduce((acc: Record<string, any>, curr) => {
          const date = curr.createdAt.toISOString().split('T')[0];
          if (!acc[date]) {
            acc[date] = {
              date,
              happy: 0,
              confused: 0,
              satisfied: 0,
              challenged: 0,
              tired: 0,
            };
          }
          acc[date][curr.mood] += 1;
          return acc;
        }, {}),
        achievements: achievementStats.reduce((acc: any[], achievement) => {
          const completed = userId
            ? achievement.userAchievements.filter(ua => ua.userId === userId).length
            : achievement.userAchievements.length;

          acc.push({
            category: achievement.category,
            completed,
            total: 1, // Each achievement counts as 1
          });
          return acc;
        }, []),
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching progress stats:", error);
      res.status(500).json({ message: "獲取進度統計時發生錯誤" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}