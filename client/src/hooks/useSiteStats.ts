/**
 * useSiteStats — 讀取 build-time 寫入的 /api/site-stats.json
 *
 * 由 scripts/generate-home-og.mjs 在每次 build 時自動寫入：
 *   {
 *     toolCount: 97,
 *     displayCount: "97",
 *     categoryCounts: { utilities: 30, teaching: 18, ... },
 *     milestones: { tool100: "2026-..." },
 *     ogImage: "/og-preview-XXX.png",
 *     ogImageAbsolute: "https://cagoooo.github.io/Akai/og-preview-XXX.png",
 *     generatedAt: "..."
 *   }
 *
 * Cache 15 分鐘，避免每個用到 stats 的元件都重抓。
 */

import { useQuery } from '@tanstack/react-query';

export interface SiteStats {
  toolCount: number;
  displayCount: string;
  categoryCounts: Record<string, number>;
  milestones?: Record<string, string>;
  ogImage?: string;
  ogImageAbsolute?: string;
  generatedAt?: string;
}

const STALE_MS = 15 * 60 * 1000;

export function useSiteStats() {
  return useQuery<SiteStats>({
    queryKey: ['/api/site-stats'],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL || '/';
      const version = import.meta.env.VITE_APP_VERSION || Date.now();
      const res = await fetch(`${base}api/site-stats.json?v=${version}`);
      if (!res.ok) throw new Error(`site-stats fetch failed: ${res.status}`);
      return res.json();
    },
    staleTime: STALE_MS,
    refetchOnWindowFocus: false,
  });
}
