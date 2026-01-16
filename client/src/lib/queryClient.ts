import { QueryClient } from "@tanstack/react-query";

// 檢測是否為 GitHub Pages 靜態部署環境
const isStaticDeployment = () => {
  if (typeof window === 'undefined') return false;
  // 檢測 GitHub Pages 或其他靜態部署環境
  return window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('netlify.app') ||
    window.location.hostname.includes('vercel.app');
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;

        // 在靜態部署環境中，跳過 API 請求並返回空數據
        if (isStaticDeployment() && url.startsWith('/api/')) {
          console.log(`[Static Mode] 跳過 API 請求: ${url}`);
          // 根據不同的 API 端點返回適當的預設值
          if (url.includes('/stats') || url.includes('/rankings')) {
            return [];
          }
          return null;
        }

        const res = await fetch(url, {
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status >= 500) {
            throw new Error(`${res.status}: ${res.statusText}`);
          }

          throw new Error(`${res.status}: ${await res.text()}`);
        }

        return res.json();
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    }
  },
});
