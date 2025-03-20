import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase, checkDatabaseConnection } from "../db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

(async () => {
  try {
    // 檢查數據庫連接並初始化，添加重試機制
    log("Attempting to establish database connection...");
    const isConnected = await checkDatabaseConnection(3, 2000); // 3次重試，每次間隔2秒
    if (!isConnected) {
      throw new Error("Database connection failed after multiple attempts");
    }
    log("Database connection successful");

    // 初始化數據庫表和基礎數據
    log("Initializing database tables and data...");
    const isInitialized = await initializeDatabase();
    if (!isInitialized) {
      throw new Error("Database initialization failed");
    }
    log("Database initialized successfully");

    const server = registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // 記錄錯誤但不重新拋出，避免進程崩潰
      log(`Error: ${status} - ${message} - ${err.stack || 'No stack trace'}`);

      // 向客戶端返回友好的錯誤消息
      res.status(status).json({
        message,
        errorId: new Date().getTime(),
        success: false
      });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Try to serve the app on port 5000 first, then fallback to alternative ports
    const tryListenOnPort = (port: number, maxRetries = 3) => {
      const attemptListen = (currentPort: number, retriesLeft: number) => {
        server.once('error', (e: any) => {
          if (e.code === 'EADDRINUSE' && retriesLeft > 0) {
            log(`Port ${currentPort} is in use, trying port ${currentPort + 1}...`);
            attemptListen(currentPort + 1, retriesLeft - 1);
          } else {
            log(`Could not start server: ${e.message}`);
            process.exit(1); // 如果無法啟動服務器，退出進程
          }
        });

        server.listen(currentPort, "0.0.0.0", () => {
          log(`Server running at http://0.0.0.0:${currentPort}`);
        });
      };

      attemptListen(port, maxRetries);
    };

    // 獲取環境變量中的端口，如果沒有則使用5000
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
    tryListenOnPort(port);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();