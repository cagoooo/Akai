/**
 * BulletinHome — E2 公佈欄版首頁
 *
 * 整合策略：
 * - 複用所有現有 hooks（useFavorites、useRecentTools、useKeyboardShortcuts 等）
 * - 複用同一份 tools.json 資料來源（共 81 個工具）
 * - 同步篩選狀態至 URL（與舊版相容）
 * - 視覺層全面改為 Bulletin 系列元件
 *
 * 保留功能：雲端收藏同步、PWA 自動更新、鍵盤快捷鍵、搜尋、分類篩選、排序、URL 同步、許願池（LINE Bot）
 */

import { useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { EducationalTool } from '@/lib/data';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecentTools } from '@/hooks/useRecentTools';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSortOptions } from '@/hooks/useSortOptions';
import { useToolClickStats } from '@/hooks/useToolClickStats';
import { useToast } from '@/hooks/use-toast';

import { BulletinBoard } from '@/components/bulletin/BulletinBoard';
import { BulletinHeader } from '@/components/bulletin/BulletinHeader';
import { BulletinHero } from '@/components/bulletin/BulletinHero';
import { BulletinLeaderboard } from '@/components/bulletin/BulletinLeaderboard';
import { BulletinWishPool } from '@/components/bulletin/BulletinWishPool';
import { BulletinSearchBar } from '@/components/bulletin/BulletinSearchBar';
import { BulletinCategoryFilter } from '@/components/bulletin/BulletinCategoryFilter';
import { BulletinToolGrid } from '@/components/bulletin/BulletinToolGrid';
import { BulletinFooter } from '@/components/bulletin/BulletinFooter';
import { tokens } from '@/design/tokens';

const KeyboardShortcutsDialog = lazy(() =>
  import('@/components/KeyboardShortcutsDialog').then((m) => ({ default: m.KeyboardShortcutsDialog }))
);

// ── URL Query String 同步 ─────────────────────────────────────────
function readUrlFilters() {
  const params = new URLSearchParams(window.location.search);
  return {
    category: params.get('category') || null,
    tags: params.get('tag') ? params.get('tag')!.split(',').filter(Boolean) : [],
    query: params.get('q') || '',
    favorites: params.get('favorites') === '1',
  };
}

function writeUrlFilters({
  category,
  tags,
  query,
  favorites,
}: {
  category: string | null;
  tags: string[];
  query: string;
  favorites: boolean;
}) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (tags.length > 0) params.set('tag', tags.join(','));
  if (query) params.set('q', query);
  if (favorites) params.set('favorites', '1');
  const search = params.toString();
  const newUrl = window.location.pathname + (search ? '?' + search : '');
  window.history.replaceState(null, '', newUrl);
}

export function BulletinHome() {
  const initialFilters = useMemo(() => readUrlFilters(), []);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState(initialFilters.query);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialFilters.category);
  const [showFavorites, setShowFavorites] = useState(initialFilters.favorites);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [showWishingWellFromShortcut, setShowWishingWellFromShortcut] = useState(false);
  const [selectedToolIndex, setSelectedToolIndex] = useState(0);

  // 從 ?wish=1 URL 自動開啟許願池（相容 v3.5.7 功能）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('wish') === '1') {
      setShowWishingWellFromShortcut(true);
      params.delete('wish');
      const search = params.toString();
      window.history.replaceState(null, '', window.location.pathname + (search ? '?' + search : ''));
    }
  }, []);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const { favorites, toggleFavorite } = useFavorites();
  const { addToRecent } = useRecentTools();
  const { currentSort, sortTools } = useSortOptions();
  const { clicksById } = useToolClickStats();

  // URL 雙向同步
  useEffect(() => {
    writeUrlFilters({ category: selectedCategory, tags: [], query: searchQuery, favorites: showFavorites });
  }, [selectedCategory, searchQuery, showFavorites]);

  // 從 API 取得工具
  const { data: toolsData, isLoading } = useQuery({
    queryKey: ['/api/tools'],
    queryFn: async () => {
      const staticUrl = `${import.meta.env.BASE_URL}api/tools.json`;
      try {
        const staticResponse = await fetch(staticUrl);
        if (staticResponse.ok) return (await staticResponse.json()) as EducationalTool[];
        const response = await fetch('/api/tools');
        if (response.ok) return (await response.json()) as EducationalTool[];
        throw new Error('無法獲取工具數據');
      } catch (err) {
        console.error('數據獲取失敗:', err);
        throw err;
      }
    },
    staleTime: 300000,
  });

  // 將 Firestore 即時點擊數合併進 tools 陣列（每張卡片的 👆 顯示才能即時更新）
  const toolsWithStats = useMemo(() => {
    if (!toolsData) return [];
    if (clicksById.size === 0) return toolsData;
    return toolsData.map((tool) => ({
      ...tool,
      totalClicks: clicksById.get(tool.id) ?? tool.totalClicks ?? 0,
    }));
  }, [toolsData, clicksById]);

  // 計算各分類工具數量
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    toolsWithStats.forEach((tool) => {
      counts[tool.category] = (counts[tool.category] || 0) + 1;
    });
    return counts;
  }, [toolsWithStats]);

  // 篩選（使用含 Firestore 點擊數的 toolsWithStats）
  const filteredTools = useMemo(() => {
    let result = toolsWithStats;
    if (showFavorites) result = result.filter((t) => favorites.includes(t.id));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    if (selectedCategory) result = result.filter((t) => t.category === selectedCategory);
    return result;
  }, [toolsWithStats, searchQuery, selectedCategory, showFavorites, favorites]);

  const sortedTools = useMemo(() => sortTools(filteredTools), [filteredTools, sortTools, currentSort]);

  // 鍵盤快捷鍵（複用既有 hook）
  useKeyboardShortcuts({
    onSearch: () => searchInputRef.current?.focus(),
    onClearSearch: () => setSearchQuery(''),
    onShowHelp: () => setShowShortcutsDialog(true),
    onToggleFavorite: () => {
      const currentTool = sortedTools[selectedToolIndex];
      if (currentTool) toggleFavorite(currentTool.id);
    },
    onNavigateUp: () => setSelectedToolIndex((prev) => Math.max(0, prev - 1)),
    onNavigateDown: () =>
      setSelectedToolIndex((prev) => Math.min(sortedTools.length - 1, prev + 1)),
    onOpenSelected: () => {
      const currentTool = sortedTools[selectedToolIndex];
      if (currentTool) {
        window.open(currentTool.url, '_blank');
        addToRecent(currentTool.id);
      }
    },
  });

  // 收藏切換按鈕（公佈欄版）
  const favoriteCount = favorites.length;

  return (
    <BulletinBoard>
      <BulletinHeader />
      <BulletinHero />

      {/* 排行榜 + 許願池 */}
      <div
        className="bulletin-sections-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 40,
          padding: '20px 60px 30px',
        }}
      >
        <BulletinLeaderboard tools={toolsWithStats} />
        <BulletinWishPool />
      </div>

      {/* 搜尋 */}
      <BulletinSearchBar
        ref={searchInputRef}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        resultCount={filteredTools.length}
        totalCount={toolsWithStats.length}
      />

      {/* 分類篩選 + 我的收藏切換 */}
      <BulletinCategoryFilter
        selected={selectedCategory}
        onChange={setSelectedCategory}
        categoryCounts={categoryCounts}
      />

      <div style={{ padding: '0 60px 10px' }} className="bulletin-favorite-toggle">
        <button
          type="button"
          onClick={() => setShowFavorites(!showFavorites)}
          aria-pressed={showFavorites}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            background: showFavorites ? tokens.red : '#fff',
            color: showFavorites ? '#fff' : tokens.red,
            border: `2px solid ${tokens.red}`,
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            fontFamily: tokens.font.tc,
            cursor: 'pointer',
            boxShadow: showFavorites ? '3px 3px 0 rgba(0,0,0,.25)' : '2px 2px 0 rgba(0,0,0,.12)',
          }}
        >
          {showFavorites ? '💖' : '♡'}
          <span>只看我的收藏</span>
          <span style={{ fontFamily: tokens.font.en, fontSize: 11, opacity: 0.8 }}>
            {favoriteCount}
          </span>
        </button>
      </div>

      {/* 工具網格 */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60, color: tokens.muted, fontStyle: 'italic' }}>
          📌 正在把工具釘上公佈欄…
        </div>
      ) : (
        <BulletinToolGrid tools={sortedTools} />
      )}

      <BulletinFooter />

      {/* 許願池對話框（從快捷鍵或 ?wish=1 開啟） */}
      {showWishingWellFromShortcut && (
        <Suspense fallback={null}>
          {(() => {
            const WishingWellDialog = lazy(() =>
              import('@/components/WishingWellDialog').then((m) => ({
                default: m.WishingWellDialog,
              }))
            );
            return (
              <WishingWellDialog
                open={showWishingWellFromShortcut}
                onOpenChange={setShowWishingWellFromShortcut}
              />
            );
          })()}
        </Suspense>
      )}

      {showShortcutsDialog && (
        <Suspense fallback={null}>
          <KeyboardShortcutsDialog open={showShortcutsDialog} onOpenChange={setShowShortcutsDialog} />
        </Suspense>
      )}
    </BulletinBoard>
  );
}
