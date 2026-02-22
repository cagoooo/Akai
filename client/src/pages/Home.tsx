import { useState, useMemo, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from "@tanstack/react-query";
import { ToolCard } from "@/components/ToolCard";
import { TeacherIntro } from "@/components/TeacherIntro";
import { tools } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, X, Keyboard, ChevronDown, ChevronUp } from "lucide-react";
import { useTour } from "@/components/TourProvider";
import { CategoryFilter } from "@/components/CategoryFilter";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentTools } from "@/hooks/useRecentTools";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
const KeyboardShortcutsDialog = lazy(() => import("@/components/KeyboardShortcutsDialog").then(module => ({ default: module.KeyboardShortcutsDialog })));
import { useSortOptions, type SortOption } from "@/hooks/useSortOptions";

// 延遲載入帶有 Firebase 依賴的重型元件
const ToolRankings = lazy(() => import("@/components/ToolRankings").then(module => ({ default: module.ToolRankings })));
const VisitorCounter = lazy(() => import("@/components/VisitorCounter").then(module => ({ default: module.VisitorCounter })));
const RecommendedTools = lazy(() => import("@/components/RecommendedTools").then(module => ({ default: module.RecommendedTools })));

import { RankingTutorial } from "@/components/RankingTutorial";
import { NewToolsBanner } from "@/components/NewToolsBanner";
const WishingWellDialog = lazy(() => import("@/components/WishingWellDialog").then(module => ({ default: module.WishingWellDialog })));
import { Wand2 } from "lucide-react";

export function Home() {
  const { startTour } = useTour();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isRecentCollapsed, setIsRecentCollapsed] = useState(true);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [showWishingWell, setShowWishingWell] = useState(false);
  const [selectedToolIndex, setSelectedToolIndex] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 搜尋框 ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 排序選項
  const { currentSort, setCurrentSort, sortTools } = useSortOptions();

  // 收藏功能
  const { favorites, toggleFavorite, isFavorite, favoritesCount } = useFavorites();

  // 最近使用歷史
  const { recentIds, addToRecent, clearRecent, hasRecent } = useRecentTools();

  // 鍵盤快捷鍵
  useKeyboardShortcuts({
    onSearch: () => searchInputRef.current?.focus(),
    onClearSearch: () => setSearchQuery(''),
    onShowHelp: () => setShowShortcutsDialog(true),
    onToggleFavorite: () => {
      const currentTool = filteredTools?.[selectedToolIndex];
      if (currentTool) {
        toggleFavorite(currentTool.id);
      }
    },
    onNavigateUp: () => {
      setSelectedToolIndex(prev => Math.max(0, prev - 1));
    },
    onNavigateDown: () => {
      setSelectedToolIndex(prev =>
        Math.min((filteredTools?.length || 1) - 1, prev + 1)
      );
    },
    onOpenSelected: () => {
      const currentTool = filteredTools?.[selectedToolIndex];
      if (currentTool) {
        window.open(currentTool.url, '_blank');
        handleToolClick(currentTool.id);
      }
    }
  });

  // Fisher-Yates 洗牌演算法
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const { data: toolsData, isLoading } = useQuery({
    queryKey: ['/api/tools'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // 每次載入時隨機排序工具
      return shuffleArray(tools);
    },
  });

  // 取得最近使用的工具
  const recentTools = useMemo(() => {
    if (!toolsData || recentIds.length === 0) return [];
    return recentIds
      .map(id => toolsData.find(tool => tool.id === id))
      .filter(Boolean) as typeof tools;
  }, [toolsData, recentIds]);

  // 計算各分類的工具數量
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    toolsData?.forEach(tool => {
      counts[tool.category] = (counts[tool.category] || 0) + 1;
    });
    return counts;
  }, [toolsData]);

  // 取得所有分類列表
  const categories = useMemo(() => {
    return Object.keys(categoryCounts).sort((a, b) => {
      return (categoryCounts[b] || 0) - (categoryCounts[a] || 0);
    });
  }, [categoryCounts]);

  // 篩選工具
  const filteredTools = useMemo(() => {
    let result = toolsData;

    // 收藏篩選
    if (showFavorites) {
      result = result?.filter(tool => favorites.includes(tool.id));
    }

    // 搜尋篩選 (標題、描述、標籤)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result?.filter(tool =>
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 標籤篩選
    if (selectedTags.length > 0) {
      result = result?.filter(tool =>
        selectedTags.some(tag =>
          tool.tags?.some(t => t.toLowerCase() === tag.toLowerCase())
        )
      );
    }

    // 分類篩選
    if (selectedCategory) {
      result = result?.filter(tool => tool.category === selectedCategory);
    }

    return result;
  }, [toolsData, searchQuery, selectedCategory, showFavorites, favorites, selectedTags]);

  // 排序後的工具列表
  const sortedTools = useMemo(() => {
    if (!filteredTools) return [];
    return sortTools(filteredTools);
  }, [filteredTools, sortTools]);

  // 處理工具點擊
  const handleToolClick = (toolId: number) => {
    addToRecent(toolId);
  };

  return (
    <div className="min-h-screen bg-background">
      <main id="main-content" role="main" className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 md:py-8" aria-label="教育工具列表">
        {/* 頂部標題區域 */}
        <header
          className="relative overflow-hidden mb-4 sm:mb-6 p-5 sm:p-6 md:p-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg"
          data-tour="header-section"
        >
          {/* 背景裝飾 */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 bg-purple-400/20 rounded-full blur-2xl" />

          <div className="relative z-10 text-center">
            {/* 主標題 */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight mb-2 sm:mb-3">
              ✨ 教育科技創新專區 ✨
            </h1>

            {/* 副標題 */}
            <p className="text-sm sm:text-base md:text-lg text-white/80 font-medium max-w-2xl mx-auto">
              探索阿凱老師開發的教育工具，為您的教學增添創新的可能
            </p>
          </div>
        </header>

        {/* 主要內容區域 - xl 以上才變為左右排版 */}
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 xl:gap-8">
          {/* 手機版和平板版排行榜切換按鈕 - 吸睛設計 */}
          <div className="xl:hidden w-full px-2 sm:px-0">
            <button
              onClick={() => document.getElementById('mobile-rankings')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 p-[2px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="relative flex items-center justify-center gap-3 rounded-2xl bg-white/90 dark:bg-gray-900/90 px-4 py-3 sm:py-4 backdrop-blur-sm group-hover:bg-white/80 dark:group-hover:bg-gray-900/80 transition-all">
                {/* 獎杯圖示帶動畫 */}
                <div className="relative">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 group-hover:text-amber-600 transition-colors animate-bounce" style={{ animationDuration: '2s' }} />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                </div>

                {/* 文字 */}
                <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
                  跳至工具排行榜
                </span>

                {/* 箭頭指示 */}
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 group-hover:translate-y-1 transition-transform animate-bounce"
                  style={{ animationDuration: '1.5s', animationDelay: '0.5s' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              {/* 背景光暈效果 */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            </button>
          </div>

          {/* 主內容區域 */}
          <div className="w-full xl:w-2/3 space-y-5 sm:space-y-8">
            {/* 訪問計數器 */}
            <section className="p-3 sm:p-4 rounded-lg bg-green-50">
              <Suspense fallback={<div className="h-32 rounded-xl bg-green-100/50 animate-pulse" />}>
                <VisitorCounter />
              </Suspense>
            </section>

            {/* 搜尋與篩選區域 */}
            <section className="space-y-3 sm:space-y-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border border-orange-100 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100">
                  <span className="text-lg">🔍</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-orange-800">搜尋與篩選</h2>
              </div>

              <AdvancedSearch
                ref={searchInputRef}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                resultCount={filteredTools?.length || 0}
                totalCount={toolsData?.length || 0}
                selectedTags={selectedTags}
                onTagSelect={(tag) => {
                  setSelectedTags(prev =>
                    prev.includes(tag)
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  );
                }}
                onClearTags={() => setSelectedTags([])}
                currentSort={currentSort}
                onSortChange={setCurrentSort}
              />

              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categoryCounts={categoryCounts}
                showFavorites={showFavorites}
                onToggleFavorites={() => setShowFavorites(!showFavorites)}
                favoritesCount={favoritesCount}
              />
            </section>

            {/* 🆕 新工具通知橫幅 */}
            <NewToolsBanner />

            {/* 🎯 AI 智慧推薦區塊 */}
            {!isLoading && !searchQuery && !selectedCategory && !showFavorites && (
              <Suspense fallback={<div className="h-48 rounded-xl bg-purple-100/30 animate-pulse p-4" />}>
                <RecommendedTools onToolClick={handleToolClick} />
              </Suspense>
            )}

            {/* 最近使用區塊 */}
            {hasRecent && !isLoading && (
              <section className="p-3 sm:p-4 rounded-lg bg-teal-50">
                <div
                  className="flex items-center justify-between mb-3 cursor-pointer select-none"
                  onClick={() => setIsRecentCollapsed(!isRecentCollapsed)}
                >
                  <h2 className="text-lg font-semibold text-teal-800 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    最近使用
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearRecent();
                      }}
                      className="text-teal-600 hover:text-teal-800"
                    >
                      <X className="w-4 h-4 mr-1" />
                      清除
                    </Button>
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8 hover:bg-teal-100/50 rounded-full">
                      {isRecentCollapsed ? <ChevronDown className="w-5 h-5 text-teal-600" /> : <ChevronUp className="w-5 h-5 text-teal-600" />}
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {!isRecentCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1">
                        {recentTools.slice(0, 4).map((tool) => (
                          <ToolCard
                            key={`recent-${tool.id}`}
                            tool={tool}
                            isLoading={false}
                            isFavorite={isFavorite(tool.id)}
                            onToggleFavorite={toggleFavorite}
                            onToolClick={handleToolClick}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            )}



            {/* 教師介紹區域 */}
            <section
              aria-labelledby="teacher-info"
              className="p-3 sm:p-4 rounded-lg bg-yellow-50"
              data-tour="teacher-intro"
            >
              <h2 id="teacher-info" className="sr-only">教師介紹</h2>
              <TeacherIntro isLoading={isLoading} />
            </section>

            {/* 工具卡片區域 */}
            <section
              aria-label={isLoading ? "正在載入教育工具" : "教育工具列表"}
              data-tour="tools-grid"
              className="p-3 sm:p-4 rounded-lg bg-indigo-50"
            >
              {!isLoading && (searchQuery || selectedCategory || showFavorites) && (
                <div className="mb-4 text-sm text-muted-foreground">
                  顯示 {sortedTools?.length || 0} / {toolsData?.length || 0} 個工具
                  {showFavorites && <span className="ml-2">(我的收藏)</span>}
                  {selectedCategory && (
                    <span className="ml-2">(分類: {selectedCategory})</span>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <ToolCard
                      key={`loading-${index}`}
                      tool={tools[0]}
                      isLoading={true}
                    />
                  ))
                ) : sortedTools && sortedTools.length > 0 ? (
                  sortedTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      isLoading={false}
                      isFavorite={isFavorite(tool.id)}
                      onToggleFavorite={toggleFavorite}
                      onToolClick={handleToolClick}
                    />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    <p className="text-lg">😕 找不到符合條件的工具</p>
                    <p className="text-sm mt-2">
                      {showFavorites
                        ? '還沒有收藏任何工具，點擊愛心按鈕收藏吧！'
                        : '請嘗試調整搜尋關鍵字或分類篩選'}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory(null);
                        setShowFavorites(false);
                      }}
                    >
                      清除所有篩選
                    </Button>
                  </div>
                )}
              </div>
            </section>

            {/* 頁腳資訊 */}
            <footer className="mt-6 sm:mt-8">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 px-4 py-4 sm:px-6 sm:py-5 text-center">
                {/* 背景裝飾 */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl" />

                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
                  {/* Logo 和標題 */}
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">🎓</span>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      阿凱老師教育工具集
                    </h3>
                  </div>

                  {/* 分隔線 - 只在桌面顯示 */}
                  <div className="hidden sm:block w-px h-6 bg-slate-600" />

                  {/* 功能亮點 - 一行顯示 */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                    <span>✨ 互動式工具</span>
                    <span className="text-slate-500">•</span>
                    <span>📚 教學資源</span>
                    <span className="text-slate-500">•</span>
                    <span>🎮 趣味遊戲</span>
                  </div>

                  {/* 分隔線 - 只在桌面顯示 */}
                  <div className="hidden sm:block w-px h-6 bg-slate-600" />

                  {/* 版權 */}
                  <p className="text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} 版權所有
                  </p>
                </div>
              </div>
            </footer>
          </div>

          {/* 排行榜區域 - xl 以上才顯示在側邊 */}
          <aside id="mobile-rankings" className="w-full xl:w-1/3 xl:order-last">
            <div className="xl:sticky xl:top-4 space-y-4 p-3 sm:p-4 rounded-lg bg-purple-50">
              <div data-tour="tool-rankings">
                <Suspense fallback={<div className="h-96 rounded-xl bg-purple-100/50 animate-pulse" />}>
                  <ToolRankings />
                </Suspense>
              </div>
              <RankingTutorial />
            </div>
          </aside>
        </div>
      </main>

      {/* 回到頂部按鈕 */}
      <ScrollToTop />

      {/* 後台入口 - 不顯眼的半透明按鈕 */}
      <a
        href={`${import.meta.env.BASE_URL}admin`}
        className="fixed bottom-4 left-4 sm:left-6 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-slate-500/10 hover:bg-slate-500/25 backdrop-blur-sm text-slate-400/50 hover:text-slate-500 transition-all duration-300 hover:scale-110 cursor-pointer z-40"
        title="管理後台"
        aria-label="進入管理後台"
      >
        <span className="text-lg sm:text-xl opacity-40 hover:opacity-70 transition-opacity">🛠️</span>
      </a>

      {/* 快捷鍵說明對話框 */}
      {showShortcutsDialog && (
        <Suspense fallback={null}>
          <KeyboardShortcutsDialog
            open={showShortcutsDialog}
            onOpenChange={setShowShortcutsDialog}
          />
        </Suspense>
      )}

      {/* 許願池對話框 */}
      {showWishingWell && (
        <Suspense fallback={null}>
          <WishingWellDialog
            open={showWishingWell}
            onOpenChange={setShowWishingWell}
          />
        </Suspense>
      )}

      {/* 許願池浮動按鈕 */}
      <Button
        onClick={() => setShowWishingWell(true)}
        className="fixed bottom-36 right-4 sm:right-6 h-14 pl-4 pr-5 rounded-full shadow-2xl hover:shadow-indigo-500/25 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-[1.05] z-40 group flex items-center gap-2 border-none"
      >
        <div className="relative">
          <Wand2 className="w-6 h-6 animate-pulse" />
          <div className="absolute inset-0 bg-white/30 blur-md rounded-full group-hover:bg-white/50 transition-colors" />
        </div>
        <span className="font-bold text-base tracking-wide whitespace-nowrap hidden sm:inline-block shadow-black/10">許願池</span>
      </Button>

      {/* 快捷鍵提示按鈕 */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-20 right-4 sm:right-6 rounded-full shadow-lg hover:shadow-xl transition-all"
        onClick={() => setShowShortcutsDialog(true)}
        title="鍵盤快捷鍵 (?)"
      >
        <Keyboard className="h-5 w-5" />
      </Button>
    </div>
  );
}