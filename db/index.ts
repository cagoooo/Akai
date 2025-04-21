import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log('Initializing database connection with Neon serverless driver...');

// 配置 Neon
neonConfig.fetchConnectionCache = true;

// 使用 Neon 的 serverless HTTP 驅動
const sql = neon(process.env.DATABASE_URL);

// 使用 drizzle ORM 包裝 neon 客戶端
export const db = drizzle(sql, { schema });
export { sql }; // 導出 sql 查詢客戶端供健康檢查使用