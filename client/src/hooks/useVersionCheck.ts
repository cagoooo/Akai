/**
 * 版本檢查 Hook
 *
 * 透過輪詢 /version.json 檢測網站是否有新版本釋出。
 * 相比單純依賴 Service Worker 的 `updatefound` 事件：
 * - 更主動（自訂輪詢間隔，不必等 SW 檢查）
 * - 更可靠（即使 SW 本身沒變，也能偵測 API/資料更新）
 * - 跨分頁通知（所有開著網站的分頁都會同時收到提示）
 *
 * 設計參考：.claude/skills/pwa-cache-bust
 */

import { useEffect, useState, useRef } from 'react';

interface VersionInfo {
  version: string;
  cacheVersion: string;
  gitHash: string;
  buildTime: string;
  buildTimestamp: number;
}

interface UseVersionCheckOptions {
  /** 輪詢間隔（毫秒），預設 15 分鐘 */
  intervalMs?: number;
  /** 是否在分頁可見時啟動輪詢，預設 true（背景分頁不浪費請求） */
  onlyWhenVisible?: boolean;
}

interface UseVersionCheckReturn {
  /** 目前網站的建置版本（第一次 fetch 到就固定，用來做新舊比對） */
  localVersion: VersionInfo | null;
  /** 最新偵測到的版本 */
  latestVersion: VersionInfo | null;
  /** 是否偵測到新版（latestVersion.buildTimestamp > localVersion.buildTimestamp） */
  hasNewVersion: boolean;
  /** 手動觸發一次檢查 */
  checkNow: () => Promise<void>;
}

export function useVersionCheck(options: UseVersionCheckOptions = {}): UseVersionCheckReturn {
  const { intervalMs = 15 * 60 * 1000, onlyWhenVisible = true } = options;

  const [localVersion, setLocalVersion] = useState<VersionInfo | null>(null);
  const [latestVersion, setLatestVersion] = useState<VersionInfo | null>(null);
  const [hasNewVersion, setHasNewVersion] = useState(false);

  const localVersionRef = useRef<VersionInfo | null>(null);
  localVersionRef.current = localVersion;

  const fetchVersion = async (): Promise<VersionInfo | null> => {
    try {
      // 強制 no-store 避免瀏覽器或 SW 快取 version.json
      const url = `${import.meta.env.BASE_URL}version.json?t=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return null;
      const data = (await res.json()) as VersionInfo;
      return data;
    } catch (err) {
      console.warn('[useVersionCheck] 無法取得 version.json:', err);
      return null;
    }
  };

  const check = async () => {
    const data = await fetchVersion();
    if (!data) return;

    // 第一次取得 → 記錄為 local baseline
    if (!localVersionRef.current) {
      setLocalVersion(data);
      setLatestVersion(data);
      return;
    }

    setLatestVersion(data);

    // 比對 buildTimestamp（數值比對最可靠，避免 semver 字串比對邊界）
    if (data.buildTimestamp > localVersionRef.current.buildTimestamp) {
      setHasNewVersion(true);
      console.log(
        '[useVersionCheck] 🆕 偵測到新版本！',
        `本地 ${localVersionRef.current.cacheVersion} → 線上 ${data.cacheVersion}`
      );
    }
  };

  useEffect(() => {
    // Mount 時先拿一次當 baseline
    check();

    let intervalId: number | undefined;

    const startPolling = () => {
      if (intervalId !== undefined) return;
      intervalId = window.setInterval(check, intervalMs);
    };

    const stopPolling = () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    if (onlyWhenVisible) {
      // 只有分頁可見時才輪詢，節省資源
      const handleVisibilityChange = () => {
        if (document.hidden) {
          stopPolling();
        } else {
          // 回到前台立即檢查一次，再啟動週期輪詢
          check();
          startPolling();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      if (!document.hidden) startPolling();

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        stopPolling();
      };
    }

    startPolling();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, onlyWhenVisible]);

  return { localVersion, latestVersion, hasNewVersion, checkNow: check };
}
