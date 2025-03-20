import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// 創建基本的postgres客戶端
const queryClient = postgres(process.env.DATABASE_URL, {
  max: 10, // 設置連接池大小
  idle_timeout: 20, // 空閒連接超時時間
  connect_timeout: 10, // 連接超時時間
  prepare: false, // 禁用準備語句以避免某些兼容性問題
});

// 使用drizzle ORM包裝postgres客戶端
export const db = drizzle(queryClient, { schema });

// 添加基本的健康檢查函數
export async function checkDatabaseConnection() {
  try {
    const result = await queryClient`SELECT NOW()`;
    console.log('Database connection successful:', result[0].now);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}