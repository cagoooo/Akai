import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log('Initializing database connection...');

// 使用 neon-http 客戶端
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// 初始化數據庫表和基礎數據
export async function initializeDatabase() {
  try {
    console.log('Testing database connection...');
    const result = await sql`SELECT NOW()`;
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

// 添加重試機制的數據庫連接檢查
export async function checkDatabaseConnection(retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Testing database connection (attempt ${i + 1}/${retries})...`);
      const result = await sql`SELECT NOW()`;
      console.log('Database connection successful:', result[0].now);
      return true;
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  return false;
}