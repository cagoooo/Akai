import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db, sql } from "../db"; // Assuming db and sql are exported correctly

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

(async () => {
  try {
    log("Starting server...");
    const server = registerRoutes(app);

    // 添加健康檢查端點
    app.get("/health", async (_req, res) => {
      try {
        const result = await db.execute(sql`SELECT NOW()`);
        res.json({
          status: "healthy",
          timestamp: result[0].now,
          database: "connected"
        });
      } catch (error) {
        console.error("Health check failed:", error);
        res.status(500).json({
          status: "unhealthy",
          error: error instanceof Error ? error.message : "Unknown error",
          database: "disconnected"
        });
      }
    });

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      log(`Error: ${status} - ${message} - ${err.stack || 'No stack trace'}`);

      res.status(status).json({
        message,
        errorId: new Date().getTime(),
        success: false
      });
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
    server.listen(port, "0.0.0.0", () => {
      log(`Server running at http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();