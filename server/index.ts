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

    // 初始化時測試數據庫連接
    try {
      log("測試資料庫連接...");
      // 使用 sql 客戶端直接查詢
      const result = await sql`SELECT 1 as connected`;
      log(`資料庫連接成功: ${JSON.stringify(result)}`);
    } catch (dbError) {
      console.error("警告: 資料庫連接測試失敗:", dbError);
      log("繼續啟動應用，但數據庫相關功能可能受限");
    }

    const server = registerRoutes(app);

    // 增強的健康檢查端點
    app.get("/health", async (_req, res) => {
      // 獲取內存緩存狀態
      const inMemoryCache = require('./cache').getCache();
      
      const status: any = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        isReplit: process.env.REPL_ID !== undefined,
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        databaseType: dbType,
        cacheStatus: {
          size: Object.keys(inMemoryCache).length,
          lastSaved: inMemoryCache.lastSaved || null,
          hasVisitorStats: !!inMemoryCache.visitorStats,
          toolStatsCount: inMemoryCache.toolStats instanceof Map ? inMemoryCache.toolStats.size : 0
        }
      };
      
      try {
        if (dbType === 'postgres' && sql) {
          status.databaseDriver = "@neondatabase/serverless";
          
          const startTime = Date.now();
          // 嘗試 PostgreSQL 連接
          try {
            const result = await sql`SELECT NOW() as now`;
            const responseTime = Date.now() - startTime;
            
            status.database = "connected";
            status.dbResponseTime = `${responseTime}ms`;
            status.dbTimestamp = result[0]?.now;
          } catch (pgError) {
            status.database = "error";
            status.dbError = pgError instanceof Error ? pgError.message : String(pgError);
            status.errorTime = new Date().toISOString();
          }
        } else if (dbType === 'sqlite') {
          status.databaseDriver = "better-sqlite3";
          
          // SQLite 健康檢查
          try {
            const startTime = Date.now();
            // 簡單的 SQLite 查詢
            const result = db.run("SELECT datetime('now') as current_time");
            const responseTime = Date.now() - startTime;
            
            status.database = "connected";
            status.dbResponseTime = `${responseTime}ms`;
            status.dbEngine = "SQLite";
            status.dbFile = db.databasePath || "N/A";
          } catch (sqliteError) {
            status.database = "error";
            status.dbError = sqliteError instanceof Error ? sqliteError.message : String(sqliteError);
          }
        }
        
        // 檢查文件系統
        try {
          const logDir = path.join(process.cwd(), 'logs');
          const cacheDir = path.join(process.cwd(), 'cache');
          const sqliteDir = path.join(process.cwd(), 'sqlite');
          
          status.filesystemStatus = {
            logs: fs.existsSync(logDir) ? 'available' : 'missing',
            cache: fs.existsSync(cacheDir) ? 'available' : 'missing',
            sqlite: fs.existsSync(sqliteDir) ? 'available' : 'missing'
          };
        } catch (fsError) {
          status.filesystemStatus = {
            error: fsError instanceof Error ? fsError.message : String(fsError)
          };
        }
        
        res.json(status);
      } catch (error) {
        console.error("Health check failed:", error);
        
        status.status = "degraded";
        status.error = error instanceof Error ? error.message : "Unknown error";
        status.errorStack = error instanceof Error ? error.stack : undefined;
        
        // 仍返回200但標示為degraded，這樣負載均衡器不會直接將服務標記為不可用
        res.status(200).json(status);
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