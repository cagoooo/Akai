import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 主要日志中间件已移至 routes.ts，避免重复记录

(async () => {
  const server = registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // 记录错误但不重新抛出，避免进程崩溃
    log(`Error: ${status} - ${message} - ${err.stack || 'No stack trace'}`);

    // 向客户端返回友好的错误消息
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
          process.exit(1); // 如果无法启动服务器，退出进程
        }
      });

      server.listen(currentPort, "0.0.0.0", () => {
        log(`Server running at http://0.0.0.0:${currentPort}`);
      });
    };

    attemptListen(port, maxRetries);
  };

  // 获取环境变量中的端口，如果没有则使用5000
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  tryListenOnPort(port);
})();