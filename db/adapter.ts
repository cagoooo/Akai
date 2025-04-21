/**
 * 數據庫適配器
 * 提供了在不同數據庫之間轉換的幫助函數
 */

import { dbType } from './index';
import { sql as sqlTemplate } from 'drizzle-orm';

/**
 * 獲取當前時間的 SQL 表達式
 * PostgreSQL 使用 NOW()
 * SQLite 使用 datetime('now')
 */
export function getCurrentTimeSql(): string {
  return dbType === 'postgres' ? 'NOW()' : "datetime('now')";
}

/**
 * 獲取當前時間的 SQL 模板表達式，用於 Drizzle ORM
 * 返回一個可以直接在 Drizzle SQL 表達式中使用的對象
 */
export function nowSql() {
  return dbType === 'postgres' 
    ? sqlTemplate`NOW()` 
    : sqlTemplate`datetime('now')`;
}

/**
 * 創建一個插入數據時可用的時間戳對象
 * 解決 SQLite 的 now() 函數不存在的問題
 */
export function getTimestamp() {
  return dbType === 'postgres' 
    ? nowSql() 
    : new Date();
}

/**
 * 將 JavaScript Date 對象轉換為適合當前數據庫的時間格式
 */
export function dateToDbFormat(date: Date): any {
  if (dbType === 'postgres') {
    return date; // PostgreSQL 可以直接使用 Date 對象
  } else {
    // SQLite 需要 ISO 字符串格式
    return date.toISOString();
  }
}

/**
 * 獲取日期差的 SQL 表達式
 */
export function getDateDiffSql(startDate: string, endDate: string = 'NOW()', unit: 'day' | 'hour' | 'minute' | 'second' = 'day'): string {
  if (dbType === 'postgres') {
    // PostgreSQL 日期差異語法
    return `EXTRACT(${unit} FROM (${endDate} - ${startDate}))`;
  } else {
    // SQLite 日期差異語法
    const divisors: Record<string, number> = {
      'second': 1,
      'minute': 60,
      'hour': 3600,
      'day': 86400
    };
    const divisor = divisors[unit];
    const nowFunction = endDate === 'NOW()' ? "datetime('now')" : endDate;
    return `(strftime('%s', ${nowFunction}) - strftime('%s', ${startDate})) / ${divisor}`;
  }
}

/**
 * 生成隨機值的 SQL 表達式
 */
export function getRandomSql(): string {
  return dbType === 'postgres' ? 'RANDOM()' : 'RANDOM()';
}

/**
 * 生成 JSONB 類型字段的 SQL 表達式
 */
export function jsonFieldSql(field: string, path: string): string {
  if (dbType === 'postgres') {
    // PostgreSQL JSON 提取語法
    return `${field}->>'${path}'`;
  } else {
    // SQLite JSON 提取語法 (使用 json_extract)
    return `json_extract(${field}, '$.${path}')`;
  }
}

/**
 * 生成日期格式化的 SQL 表達式
 */
export function formatDateSql(dateField: string, format: string = '%Y-%m-%d'): string {
  if (dbType === 'postgres') {
    // PostgreSQL 日期格式化
    let pgFormat = format.replace('%Y', 'YYYY')
      .replace('%m', 'MM')
      .replace('%d', 'DD')
      .replace('%H', 'HH24')
      .replace('%M', 'MI')
      .replace('%S', 'SS');
    return `TO_CHAR(${dateField}, '${pgFormat}')`;
  } else {
    // SQLite 日期格式化
    return `strftime('${format}', ${dateField})`;
  }
}