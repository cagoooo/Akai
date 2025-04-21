import fs from 'node:fs';
import path from 'node:path';
import { logSystem, logError } from './logger';

// 緩存文件路徑
const CACHE_FILE = path.join(process.cwd(), 'cache', 'memory-cache.json');

// 確保緩存目錄存在
const cacheDir = path.dirname(CACHE_FILE);
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// 緩存數據類型
export interface VisitorStats {
  id?: number;
  totalVisits: number;
  dailyVisits: Record<string, number>;
  lastVisitAt?: Date;
}

export interface ToolStats {
  id?: number;
  toolId: number;
  totalClicks: number;
  lastUsedAt: Date;
  categoryClicks?: Record<string, number>;
}

export interface MemoryCache {
  visitorStats: VisitorStats;
  toolStats: Map<number, ToolStats>;
  rankings: ToolStats[];
  lastSaved?: Date;
}

// 默認緩存結構
export const defaultCache: MemoryCache = {
  visitorStats: { totalVisits: 0, dailyVisits: {}, lastVisitAt: new Date() },
  toolStats: new Map(),
  rankings: [],
  lastSaved: new Date()
};

// 加載緩存
export function loadCache(): MemoryCache {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf8');
      const parsed = JSON.parse(data);
      
      // 轉換日期字符串為 Date 對象
      if (parsed.visitorStats && parsed.visitorStats.lastVisitAt) {
        parsed.visitorStats.lastVisitAt = new Date(parsed.visitorStats.lastVisitAt);
      }
      
      if (parsed.lastSaved) {
        parsed.lastSaved = new Date(parsed.lastSaved);
      }
      
      // 轉換 toolStats 從普通對象到 Map
      if (parsed.toolStats) {
        const toolStatsMap = new Map<number, ToolStats>();
        
        if (typeof parsed.toolStats === 'object' && parsed.toolStats !== null) {
          // 處理對象形式的 toolStats
          Object.entries(parsed.toolStats).forEach(([key, value]: [string, any]) => {
            // 轉換工具統計中的日期
            if (value && value.lastUsedAt) {
              value.lastUsedAt = new Date(value.lastUsedAt);
            }
            
            // 確保 toolId 存在
            if (value && !value.toolId) {
              value.toolId = parseInt(key);
            }
            
            // 轉換 categoryClicks，確保它是對象而非字符串
            if (value && typeof value.categoryClicks === 'string') {
              try {
                value.categoryClicks = JSON.parse(value.categoryClicks);
              } catch (e) {
                value.categoryClicks = {};
              }
            }
            
            toolStatsMap.set(parseInt(key), value as ToolStats);
          });
        }
        
        parsed.toolStats = toolStatsMap;
      } else {
        parsed.toolStats = new Map<number, ToolStats>();
      }
      
      // 轉換 rankings 中的日期
      if (Array.isArray(parsed.rankings)) {
        parsed.rankings.forEach((item: any) => {
          if (item.lastUsedAt) {
            item.lastUsedAt = new Date(item.lastUsedAt);
          }
        });
      }
      
      logSystem(`從 ${CACHE_FILE} 成功載入緩存`);
      return parsed as MemoryCache;
    }
  } catch (error) {
    logError('載入緩存失敗', error);
  }
  
  logSystem('未找到有效緩存文件，使用默認緩存');
  return { ...defaultCache };
}

// 保存緩存
export function saveCache(cache: MemoryCache): void {
  try {
    // 更新最後保存時間
    cache.lastSaved = new Date();
    
    // 將 Map 轉換為可序列化對象
    const serializable = { ...cache };
    if (serializable.toolStats instanceof Map) {
      // 明確標記類型以解決 TypeScript 錯誤
      serializable.toolStats = Object.fromEntries(serializable.toolStats) as unknown as Map<number, ToolStats>;
    }
    
    fs.writeFileSync(CACHE_FILE, JSON.stringify(serializable, null, 2));
    logSystem('緩存保存成功');
  } catch (error) {
    logError('保存緩存失敗', error);
  }
}

// 定期保存緩存的機制 (每5分鐘)
let cacheInterval: NodeJS.Timeout | null = null;
let currentCache: MemoryCache;

export function initializeCache(): MemoryCache {
  // 加載緩存
  currentCache = loadCache();
  
  // 設置定期保存
  if (!cacheInterval) {
    cacheInterval = setInterval(() => {
      saveCache(currentCache);
    }, 5 * 60 * 1000); // 每5分鐘
    
    // 確保進程退出時保存緩存
    process.on('SIGINT', () => {
      saveCache(currentCache);
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      saveCache(currentCache);
      process.exit(0);
    });
  }
  
  return currentCache;
}

// 獲取當前緩存對象
export function getCache(): MemoryCache {
  return currentCache || initializeCache();
}

// 手動保存緩存
export function forceSaveCache(): void {
  if (currentCache) {
    saveCache(currentCache);
  }
}