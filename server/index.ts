import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db, sql, dbType } from "../db";
import path from "node:path";
import fs from "node:fs";
import https from "node:https";
import compression from "compression";
import { escapeChatCardText, literalChatText } from "./chat-card-escape";
import { publicErrorResponse, publicHealthStatus, validErrorStatus } from "./public-diagnostics";
import { localTlsOptions } from "./local-tls";

const app = express();
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 跨網域與安全性標頭設定 (解決 Firebase Auth 彈窗無法關閉的問題)
app.use((req, res, next) => {
  // 允許 Firebase Auth 彈窗與主頁面通訊
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");

  // 基本的 CORS 支援，避免部分資源加載失敗
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

(async () => {
  try {
    log("Starting server...");

    // 初始化時測試數據庫連接
    try {
      log("測試資料庫連接...");

      if (dbType === 'postgres' && sql) {
        // 使用 sql 客戶端直接查詢 (僅 PostgreSQL)
        const result = await sql`SELECT 1 as connected`;
        log(`PostgreSQL 連接成功: ${JSON.stringify(result)}`);
      } else if (dbType === 'sqlite') {
        // 測試 SQLite 連接
        try {
          const result = db.run('SELECT 1 as connected');
          log(`SQLite 連接成功: ${JSON.stringify(result)}`);
        } catch (sqliteError: unknown) {
          const errorMessage = sqliteError instanceof Error ? sqliteError.message : String(sqliteError);
          throw new Error(`SQLite 連接測試失敗: ${errorMessage}`);
        }
      }
    } catch (dbError) {
      console.error("警告: 資料庫連接測試失敗:", dbError);
      log("繼續啟動應用，但數據庫相關功能可能受限");
    }

    registerRoutes(app);

    // 增強的健康檢查端點
    app.get("/health", async (_req, res) => {
      // 獲取內存緩存狀態
      const { getCache } = await import('./cache');
      const inMemoryCache = getCache();

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
          } catch (sqliteError: unknown) {
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

        res.json(publicHealthStatus(status, app.get('env') === 'development'));
      } catch (error) {
        console.error("Health check failed:", error);

        status.status = "degraded";
        status.error = error instanceof Error ? error.message : "Unknown error";
        status.errorStack = error instanceof Error ? error.stack : undefined;

        // 仍返回200但標示為degraded，這樣負載均衡器不會直接將服務標記為不可用
        res.status(200).json(publicHealthStatus(status, app.get('env') === 'development'));
      }
    });

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = validErrorStatus(err.status || err.statusCode);
      const message = err.message || "Internal Server Error";
      const errorId = Date.now();

      log(`Error ${errorId}: ${status} - ${message} - ${err.stack || 'No stack trace'}`);

      // 當狀態碼為 500 且配置了 GOOGLE_CHAT_WEBHOOK_URL 時，發送告警到 Google Chat
      const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL;
      if (status === 500 && webhookUrl && webhookUrl !== "PLACEHOLDER_NOT_CONFIGURED" && webhookUrl.trim() !== "") {
        const errStack = err.stack || "無堆疊資訊";
        const reqPath = _req.originalUrl || _req.path || "未知路徑";
        const reqMethod = _req.method || "GET";
        const clientIp = _req.headers['x-forwarded-for'] || _req.socket.remoteAddress || "未知 IP";

        // 非同步推送 Google Chat，不阻塞 Response
        (async () => {
          try {
            const summaryText = `🚨 Express 後端伺服器 500 錯誤: ${message}`;
            const card = {
              cardId: `express-err-${Date.now()}`,
              card: {
                header: {
                  title: "🚨 Express 後端伺服器 500 錯誤",
                  subtitle: escapeChatCardText(message),
                  imageUrl: "https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/dns/default/48px.svg",
                  imageType: "CIRCLE",
                },
                sections: [
                  {
                    header: "請求詳細資訊",
                    widgets: [
                      {
                        decoratedText: {
                          topLabel: "請求路徑",
                          text: `<b>[${escapeChatCardText(reqMethod)}]</b> ${escapeChatCardText(reqPath)}`,
                        }
                      },
                      {
                        decoratedText: {
                          topLabel: "客戶端來源",
                          text: `IP: ${escapeChatCardText(clientIp)}`,
                        }
                      },
                      {
                        decoratedText: {
                          topLabel: "觸發時間",
                          text: new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }),
                        }
                      }
                    ]
                  },
                  {
                    header: "錯誤堆疊分析 (Stack Trace)",
                    widgets: [
                      {
                        textParagraph: {
                          text: `<font color="#b91c1c"><pre>${escapeChatCardText(String(errStack).split("\n").slice(0, 10).join("\n"))}</pre></font>`,
                        }
                      }
                    ]
                  }
                ]
              }
            };

            // 通知是伺服器對 Google Chat 的外送請求，不寫回瀏覽器；請求路徑與來源已在卡片內跳脫。
            const response = await fetch(webhookUrl.trim(), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: literalChatText(summaryText).slice(0, 1000),
                cardsV2: [card]
              }),
              signal: AbortSignal.timeout(5000),
            });
            await response.body?.cancel(); // 不需要回應內容，直接釋放連線
          } catch (eChat) {
            console.error("Failed to send Express error to Google Chat:", eChat);
          }
        })();
      }

      res.status(status).json(publicErrorResponse(
        app.get('env') === 'development' ? message : '服務暫時無法完成要求，請稍後再試',
        err, app.get('env') === 'development', errorId,
      ));
    });

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
    // 本機伺服器只提供加密連線（HTTPS，自簽憑證），並依 Fortify 建議固定使用 TLS 1.2，不接受舊版 SSL／TLS；
    // Vite 開發中介層再掛到同一個伺服器以支援熱更新。
    const tls = await localTlsOptions();
    const server = https.createServer({ key: tls.key, cert: tls.cert, secureProtocol: "TLSv1_2_method" }, app);
    server.listen(port, "0.0.0.0", () => {
      log(`Server running at https://localhost:${port}`);
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
