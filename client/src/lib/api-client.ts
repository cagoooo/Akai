
import { toast } from "@/components/ui/use-toast";

interface FetchOptions extends RequestInit {
  cacheTime?: number; // 緩存時間（毫秒）
  retry?: number; // 重試次數
  retryDelay?: number; // 重試延遲（毫秒）
}

const cache = new Map<string, { data: any; timestamp: number }>();

export async function apiClient<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    cacheTime = 60000, // 默認緩存 1 分鐘
    retry = 1,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  // 檢查是否有緩存且仍然有效
  const cacheKey = `${url}-${JSON.stringify(fetchOptions)}`;
  const cachedResponse = cache.get(cacheKey);
  
  if (cachedResponse && Date.now() - cachedResponse.timestamp < cacheTime) {
    return cachedResponse.data as T;
  }

  let attempts = 0;
  let lastError: any;

  while (attempts <= retry) {
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...fetchOptions,
      });

      if (!response.ok) {
        throw new Error(`HTTP 錯誤: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // 保存到緩存
      cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data as T;
    } catch (error) {
      lastError = error;
      console.error(`API 請求失敗 (${attempts + 1}/${retry + 1}):`, error);
      
      // 自動記錄錯誤到後端
      try {
        await fetch("/api/diagnostics/log-error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            level: "error",
            message: `API 請求失敗: ${url}`,
            metadata: {
              url,
              error: error instanceof Error ? error.message : String(error),
              timestamp: new Date().toISOString()
            }
          })
        });
      } catch (logError) {
        console.error("無法記錄錯誤:", logError);
      }
      
      attempts++;
      
      if (attempts <= retry) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // 顯示錯誤提示
  toast({
    title: "請求失敗",
    description: "無法連接到伺服器，請檢查網絡連接後重試",
    variant: "destructive",
  });

  throw lastError;
}

// 清理過期的緩存數據
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > 300000) { // 5 分鐘後自動清理
      cache.delete(key);
    }
  }
}, 60000); // 每分鐘檢查一次
