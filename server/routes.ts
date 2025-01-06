import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { sharedResources, collaborators, users, insertSharedResourceSchema, insertCollaboratorSchema } from "@db/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}