import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

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

(async () => {
  const server = registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
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
    server.on('error', (e: any) => {
      if (e.code === 'EADDRINUSE' && port < 5000 + maxRetries) {
        log(`Port ${port} is in use, trying port ${port + 1}...`);
        server.close();
        tryListenOnPort(port + 1);
      } else {
        log(`Could not start server: ${e.message}`);
      }
    });
    
    server.listen(port, "0.0.0.0", () => {
      log(`Server running at http://0.0.0.0:${port}`);
    });
  };
  
  // Start with port 5000 and try alternatives if occupied
  tryListenOnPort(5000);
})();
