import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log('Initializing database connection...');

// 使用 postgres-js 客戶端
const sql = postgres(process.env.DATABASE_URL, { 
  max: 10, // 設置連接池的最大連接數
  idle_timeout: 20,
  connect_timeout: 10
});

// 使用 drizzle ORM 包裝 postgres-js 客戶端
export const db = drizzle(sql, { schema });
export { sql }; // 導出 sql 查詢客戶端供健康檢查使用