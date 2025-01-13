import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ToolCard } from "@/components/ToolCard";
import { TeacherIntro } from "@/components/TeacherIntro";
import { MoodTracker } from "@/components/MoodTracker";
import { tools } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useTour } from "@/components/TourProvider";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AchievementsList } from "@/components/AchievementsList";
import { DiagnosticsDashboard } from "@/components/DiagnosticsDashboard";
import { EmojiStoryTelling } from "@/components/EmojiStoryTelling";
import { ToolRankings } from "@/components/ToolRankings";
import { RankingTutorial } from "@/components/RankingTutorial";
import { VisitorCounter } from "@/components/VisitorCounter";
import { SeoAnalyticsDashboard } from "@/components/SeoAnalyticsDashboard";
import { ColorContrastIndicator } from "@/components/ColorContrastIndicator";
import { TriviaDialog } from "@/components/TriviaDialog";

export function Home() {
  const { startTour } = useTour();
  const { data: toolsData, isLoading } = useQuery({
    queryKey: ['/api/tools'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return tools;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <TriviaDialog />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        {/* 頂部標題和按鈕區域 - 藍色系背景 */}
        <header 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-8 mb-6 sm:mb-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/50"
          data-tour="header-section"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            教育科技創新專區
          </h1>
          <div className="flex flex-wrap gap-2">
            <div data-tour="theme-toggle">
              <ThemeToggle />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                console.log("Starting site tour");
                startTour();
              }}
              className="text-sm sm:text-base gap-2"
              aria-label="開始網站導覽"
              data-tour="start-tour"
            >
              <HelpCircle className="h-4 w-4" />
              網站導覽
            </Button>
          </div>
        </header>

        {/* 主要內容區域 */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* 排行榜區域 - 紫色系背景 */}
          <aside className="w-full lg:w-1/3 lg:order-last">
            <div className="sticky top-4 space-y-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/50">
              <div data-tour="tool-rankings">
                <ToolRankings />
              </div>
              <RankingTutorial />
            </div>
          </aside>

          {/* 主內容區域 */}
          <div className="w-full lg:w-2/3">
            {/* 訪問計數器 - 綠色系背景 */}
            <section className="mb-8 p-4 rounded-lg bg-green-50 dark:bg-green-950/50">
              <VisitorCounter />
            </section>

            {/* 簡介文字區域 - 灰色系背景 */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-8 sm:mb-12 p-4 rounded-lg bg-gray-50 dark:bg-gray-950/50">
              探索阿凱老師開發的教育工具，為您的教學增添創新的可能
            </p>

            {/* 教師介紹區域 - 黃色系背景 */}
            <section 
              aria-labelledby="teacher-info" 
              className="mb-8 sm:mb-12 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/50" 
              data-tour="teacher-intro"
            >
              <h2 id="teacher-info" className="sr-only">教師介紹</h2>
              <TeacherIntro isLoading={isLoading} />
            </section>

            {/* 工具卡片區域 - 靛藍色系背景 */}
            <section
              aria-label={isLoading ? "正在載入教育工具" : "教育工具列表"}
              data-tour="tools-grid"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/50"
            >
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <ToolCard
                    key={`loading-${index}`}
                    tool={tools[0]}
                    isLoading={true}
                  />
                ))
              ) : (
                toolsData?.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} isLoading={false} />
                ))
              )}
            </section>

            {/* 其他功能區域 */}
            <div className="space-y-4 sm:space-y-6 mb-8">
              {/* 表情故事區域 - 粉色系背景 */}
              <section data-tour="emoji-storytelling" className="p-4 rounded-lg bg-pink-50 dark:bg-pink-950/50">
                <EmojiStoryTelling />
              </section>
              {/* 心情追蹤區域 - 橙色系背景 */}
              <section data-tour="mood-tracker" className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/50">
                <MoodTracker toolId={1} />
              </section>
              {/* 進度面板區域 - 青色系背景 */}
              <section data-tour="progress-dashboard" className="p-4 rounded-lg bg-teal-50 dark:bg-teal-950/50">
                <ProgressDashboard />
              </section>
              {/* 成就列表區域 - 琥珀色系背景 */}
              <section data-tour="achievements" className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/50">
                <AchievementsList />
              </section>
              {/* 診斷面板區域 - 青藍色系背景 */}
              <section data-tour="diagnostics" className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/50">
                <DiagnosticsDashboard />
              </section>
            </div>

            {/* SEO 分析報告區域 - 紅色系背景 */}
            <section className="mt-8 p-4 rounded-lg bg-red-50 dark:bg-red-950/50" data-tour="seo-analytics">
              <SeoAnalyticsDashboard />
            </section>

            {/* 色彩對比度檢測區域 - 移動到最下方 */}
            <section className="mt-8 p-4 rounded-lg bg-slate-50 dark:bg-slate-950/50" data-tour="color-contrast">
              <ColorContrastIndicator />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}