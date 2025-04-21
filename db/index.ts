import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import { neon, neonConfig } from '@neondatabase/serverless';
import Database from 'better-sqlite3';
import * as pgSchema from "@db/schema";
import * as sqliteSchema from "./sqlite-schema";
import fs from 'node:fs';
import path from 'node:path';
import { logSystem, logError } from '../server/logger';

console.log('Initializing database connection...');

// 環境檢測
const isReplit = process.env.REPL_ID !== undefined;
const useLocalDb = process.env.USE_LOCAL_DB === 'true' || isReplit;

// 導出數據庫連接和SQL客戶端
export let db: any;
export let sql: any;
export let dbType: 'sqlite' | 'postgres' = 'postgres';

try {
  if (useLocalDb) {
    // 使用 SQLite 作為本地數據庫
    logSystem('使用 SQLite 本地數據庫作為主要或備用數據庫');
    dbType = 'sqlite';
    
    // 確保 SQLite 目錄存在
    const dbDir = path.join(process.cwd(), 'sqlite');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // 連接 SQLite 數據庫
    const dbFile = path.join(dbDir, 'app.db');
    const sqlite = new Database(dbFile);
    
    // 配置 SQLite 數據庫
    sqlite.pragma('journal_mode = WAL'); // 寫前日誌模式，提高并發性
    sqlite.pragma('synchronous = NORMAL'); // 安全級別較好但性能更好的同步設置
    
    logSystem(`SQLite 數據庫文件位置: ${dbFile}`);
    
    // 使用 Drizzle ORM 包裝 SQLite 數據庫
    db = drizzleSQLite(sqlite, { schema: sqliteSchema });
    sql = null; // SQLite 不支持 SQL tag 模板
    
    // 創建基本表結構（如果它們不存在）
    try {
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS visitor_stats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          total_visits INTEGER NOT NULL DEFAULT 0,
          daily_visits TEXT NOT NULL,
          last_visit_at TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS tool_usage_stats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tool_id INTEGER NOT NULL UNIQUE,
          total_clicks INTEGER NOT NULL DEFAULT 0,
          category_clicks TEXT,
          last_used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS error_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          level TEXT NOT NULL,
          message TEXT NOT NULL,
          stack TEXT,
          metadata TEXT,
          user_id INTEGER,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      logSystem('已確保 SQLite 基本表結構存在');
    } catch (sqliteError) {
      logError('創建 SQLite 表結構時發生錯誤', sqliteError);
    }
  } else {
    // 使用 PostgreSQL 作為主要數據庫
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set when not using local database."
      );
    }
    
    logSystem('使用 Neon PostgreSQL 數據庫');
    
    // 配置 Neon
    neonConfig.fetchConnectionCache = true;
    
    // 使用 Neon 的 serverless HTTP 驅動
    sql = neon(process.env.DATABASE_URL);
    
    // 使用 Drizzle ORM 包裝 Neon 客戶端
    db = drizzleNeon(sql, { schema: pgSchema });
  }
  
  logSystem('數據庫初始化完成');
} catch (dbError) {
  logError('數據庫初始化失敗', dbError);
  
  // 如果PostgreSQL失敗，嘗試回退到SQLite
  if (!useLocalDb) {
    logSystem('嘗試回退到 SQLite 數據庫');
    
    try {
      dbType = 'sqlite';
      const dbDir = path.join(process.cwd(), 'sqlite');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      const dbFile = path.join(dbDir, 'fallback.db');
      const sqlite = new Database(dbFile);
      sqlite.pragma('journal_mode = WAL');
      sqlite.pragma('synchronous = NORMAL');
      
      db = drizzleSQLite(sqlite, { schema: sqliteSchema });
      sql = null;
      
      logSystem('成功回退到 SQLite 數據庫');
    } catch (sqliteError) {
      logError('回退到 SQLite 也失敗', sqliteError);
      throw new Error('無法初始化任何數據庫連接');
    }
  }
}