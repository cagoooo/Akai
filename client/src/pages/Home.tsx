import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ToolCard } from "@/components/ToolCard";
import { TeacherIntro } from "@/components/TeacherIntro";
import { tools } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, X, Keyboard } from "lucide-react";
import { useTour } from "@/components/TourProvider";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SearchBar } from "@/components/SearchBar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentTools } from "@/hooks/useRecentTools";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";

import { ToolRankings } from "@/components/ToolRankings";
import { RankingTutorial } from "@/components/RankingTutorial";
import { VisitorCounter } from "@/components/VisitorCounter";

export function Home() {
  const { startTour } = useTour();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [selectedToolIndex, setSelectedToolIndex] = useState(0);

  // 搜尋框 ref
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const { data: toolsData, isLoading } = useQuery({
    queryKey: ['/api/tools'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return tools;
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

    // 搜尋篩選
    if (searchQuery) {
      result = result?.filter(tool =>
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 分類篩選
    if (selectedCategory) {
      result = result?.filter(tool => tool.category === selectedCategory);
    }

    return result;
  }, [toolsData, searchQuery, selectedCategory, showFavorites, favorites]);

  // 處理工具點擊
  const handleToolClick = (toolId: number) => {
    addToRecent(toolId);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 md:py-8">
        {/* 頂部標題區域 */}
        <header
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-8 mb-4 sm:mb-8 p-3 sm:p-4 rounded-lg bg-blue-50"
          data-tour="header-section"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            教育科技創新專區
          </h1>
        </header>

        {/* 主要內容區域 */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* 手機版排行榜切換按鈕 */}
          <div className="lg:hidden w-full p-3 rounded-lg text-center">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => document.getElementById('mobile-rankings')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Trophy className="w-4 h-4" />
              <span>跳至工具排行榜</span>
            </Button>
          </div>

          {/* 主內容區域 */}
          <div className="w-full lg:w-2/3 space-y-5 sm:space-y-8">
            {/* 訪問計數器 */}
            <section className="p-3 sm:p-4 rounded-lg bg-green-50">
              <VisitorCounter />
            </section>

            {/* 簡介文字 */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl p-3 sm:p-4 rounded-lg bg-gray-50">
              探索阿凱老師開發的教育工具，為您的教學增添創新的可能
            </p>

            {/* 最近使用區塊 */}
            {hasRecent && !isLoading && (
              <section className="p-3 sm:p-4 rounded-lg bg-teal-50">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-teal-800 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    最近使用
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecent}
                    className="text-teal-600 hover:text-teal-800"
                  >
                    <X className="w-4 h-4 mr-1" />
                    清除
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              </section>
            )}

            {/* 搜尋與篩選區域 */}
            <section className="space-y-4 p-3 sm:p-4 rounded-lg bg-orange-50">
              <h2 className="text-lg font-semibold text-orange-800">🔍 搜尋與篩選</h2>

              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                resultCount={filteredTools?.length || 0}
                totalCount={toolsData?.length || 0}
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
                  顯示 {filteredTools?.length || 0} / {toolsData?.length || 0} 個工具
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
                ) : filteredTools && filteredTools.length > 0 ? (
                  filteredTools.map((tool) => (
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
            <div className="mt-6 sm:mt-10 border-t pt-4 text-center text-xs sm:text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} 阿凱老師教育工具集. 版權所有.</p>
              <p className="mt-2">
                已優化工具體驗，專注於提供最實用的教學資源
              </p>
            </div>
          </div>

          {/* 排行榜區域 */}
          <aside id="mobile-rankings" className="w-full lg:w-1/3 lg:order-last">
            <div className="lg:sticky lg:top-4 space-y-4 p-3 sm:p-4 rounded-lg bg-purple-50">
              <div data-tour="tool-rankings">
                <ToolRankings />
              </div>
              <RankingTutorial />
            </div>
          </aside>
        </div>
      </main>

      {/* 回到頂部按鈕 */}
      <ScrollToTop />

      {/* 快捷鍵說明對話框 */}
      <KeyboardShortcutsDialog
        open={showShortcutsDialog}
        onOpenChange={setShowShortcutsDialog}
      />

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