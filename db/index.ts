import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log('Initializing database connection...');

// 使用 DATABASE_URL 直接初始化數據庫連接
const queryClient = postgres(process.env.DATABASE_URL, {
  ssl: {
    rejectUnauthorized: false
  },
  max: 1, // 減少連接數以便調試
  idle_timeout: 20,
  connect_timeout: 10,
});

// 使用drizzle ORM包裝postgres客戶端
export const db = drizzle(queryClient, { schema });

// 初始化數據庫表和基礎數據
export async function initializeDatabase() {
  try {
    console.log('Testing database connection...');
    const result = await queryClient`SELECT NOW()`;
    console.log('Database connection successful:', result[0].now);

    console.log('Checking for existing tool usage stats...');
    const stats = await db.query.toolUsageStats.findMany();
    console.log('Current stats count:', stats?.length || 0);

    if (!stats || stats.length === 0) {
      console.log('No existing stats found, initializing...');
      const initialStats = Array.from({ length: 10 }, (_, i) => ({
        toolId: i + 1,
        totalClicks: 0,
        lastUsedAt: new Date(),
        categoryClicks: {
          communication: 0,
          teaching: 0,
          language: 0,
          reading: 0,
          utilities: 0,
          games: 0
        }
      }));

      await db.insert(schema.toolUsageStats).values(initialStats);
      console.log('Tool usage stats initialized successfully');
    } else {
      console.log('Existing stats found, skipping initialization');
    }

    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return false;
  }
}

// 檢查數據庫連接
export async function checkDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    const result = await queryClient`SELECT NOW()`;
    console.log('Database connection successful:', result[0].now);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    if (error instanceof Error) {
      console.error('Connection error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return false;
  }
}