import fs from 'node:fs';
import path from 'node:path';

const LOG_DIR = path.join(process.cwd(), 'logs');
// 確保日誌目錄存在
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const ERROR_LOG = path.join(LOG_DIR, 'error.log');
const ACCESS_LOG = path.join(LOG_DIR, 'access.log');
const SYSTEM_LOG = path.join(LOG_DIR, 'system.log');

// 記錄系統訊息
export function logSystem(message: string) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [SYSTEM] ${message}\n`;
  
  // 寫入控制台
  console.log(`[SYSTEM] ${message}`);
  
  // 寫入文件
  try {
    fs.appendFileSync(SYSTEM_LOG, formattedMessage);
  } catch (error) {
    console.error('無法寫入系統日誌:', error);
  }
}

// 記錄錯誤
export function logError(message: string, error: any, metadata: Record<string, any> = {}) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    message,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    metadata: {
      ...metadata,
      environment: process.env.NODE_ENV,
      isReplit: process.env.REPL_ID !== undefined
    }
  };
  
  // 寫入控制台
  console.error(`[ERROR] ${message}:`, error);
  
  // 寫入本地文件
  try {
    fs.appendFileSync(
      ERROR_LOG, 
      JSON.stringify(errorInfo) + '\n'
    );
  } catch (fileError) {
    console.error('無法寫入錯誤日誌文件:', fileError);
  }
  
  // 仍然嘗試寫入數據庫，但不等待結果且忽略錯誤
  try {
    const { db, errorLogs } = require('@db');
    db.insert(errorLogs).values({
      level: 'error',
      message,
      stack: error instanceof Error ? error.stack : undefined,
      metadata: errorInfo
    }).then(() => {
      // 成功，但不需要任何處理
    }).catch(() => {
      // 忽略數據庫寫入錯誤
    });
  } catch (e) {
    // 忽略任何錯誤
  }
}

// 記錄API訪問
export function logAccess(method: string, path: string, statusCode: number, duration: number, response?: any) {
  const timestamp = new Date().toISOString();
  let logEntry = `[${timestamp}] ${method} ${path} ${statusCode} in ${duration}ms`;
  
  if (response) {
    // 最多顯示80個字符的響應預覽
    const responseStr = JSON.stringify(response);
    const truncatedResponse = responseStr.length > 80 
      ? responseStr.substring(0, 79) + '…' 
      : responseStr;
    logEntry += ` :: ${truncatedResponse}`;
  }
  
  logEntry += '\n';
  
  // 寫入控制台
  console.log(`[ACCESS] ${method} ${path} ${statusCode} in ${duration}ms`);
  
  // 寫入文件
  try {
    fs.appendFileSync(ACCESS_LOG, logEntry);
  } catch (error) {
    console.error('無法寫入訪問日誌:', error);
  }
}

// 獲取最近的錯誤日誌
export function getRecentErrorLogs(limit: number = 50): any[] {
  try {
    if (!fs.existsSync(ERROR_LOG)) {
      return [];
    }
    
    const content = fs.readFileSync(ERROR_LOG, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    return lines.slice(-limit).map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return { timestamp: new Date().toISOString(), message: line, error: 'Parse Error' };
      }
    });
  } catch (error) {
    console.error('讀取錯誤日誌失敗:', error);
    return [];
  }
}