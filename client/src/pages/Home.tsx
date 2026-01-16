import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ToolCard } from "@/components/ToolCard";
import { TeacherIntro } from "@/components/TeacherIntro";
import { tools } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { useTour } from "@/components/TourProvider";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SearchBar } from "@/components/SearchBar";

import { ToolRankings } from "@/components/ToolRankings";
import { RankingTutorial } from "@/components/RankingTutorial";
import { VisitorCounter } from "@/components/VisitorCounter";

export function Home() {
  const { startTour } = useTour();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: toolsData, isLoading } = useQuery({
    queryKey: ['/api/tools'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return tools;
    },
  });

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
    return toolsData?.filter(tool => {
      const matchesSearch = !searchQuery ||
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [toolsData, searchQuery, selectedCategory]);

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
              {!isLoading && (searchQuery || selectedCategory) && (
                <div className="mb-4 text-sm text-muted-foreground">
                  顯示 {filteredTools?.length || 0} / {toolsData?.length || 0} 個工具
                  {selectedCategory && (
                    <span className="ml-2">
                      (分類: <span className="font-medium">{selectedCategory}</span>)
                    </span>
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
                    <ToolCard key={tool.id} tool={tool} isLoading={false} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    <p className="text-lg">😕 找不到符合條件的工具</p>
                    <p className="text-sm mt-2">請嘗試調整搜尋關鍵字或分類篩選</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory(null);
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
    </div>
  );
}