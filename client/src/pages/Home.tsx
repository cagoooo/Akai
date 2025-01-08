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
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        {/* 頂部標題和按鈕區域 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-8 mb-6 sm:mb-8">
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
        </div>

        {/* 主要內容區域 - 使用flex布局進行響應式排列 */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* 排行榜區域 - 在手機版時移到最上方 */}
          <div className="w-full lg:w-1/3 lg:order-last">
            <div className="sticky top-4 space-y-4">
              <div data-tour="tool-rankings">
                <ToolRankings />
              </div>
              <RankingTutorial />
            </div>
          </div>

          {/* 工具卡片和其他內容區域 */}
          <div className="w-full lg:w-2/3">
            {/* 訪問計數器 */}
            <div className="mb-8">
              <VisitorCounter />
            </div>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-8 sm:mb-12">
              探索阿凱老師開發的教育工具，為您的教學增添創新的可能
            </p>

            <section aria-labelledby="teacher-info" className="mb-8 sm:mb-12" data-tour="teacher-intro">
              <h2 id="teacher-info" className="sr-only">教師介紹</h2>
              <TeacherIntro isLoading={isLoading} />
            </section>

            <section
              aria-label={isLoading ? "正在載入教育工具" : "教育工具列表"}
              data-tour="tools-grid"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8"
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

            {/* 其他組件保持在中間部分 */}
            <div className="space-y-4 sm:space-y-6 mb-8">
              <div data-tour="emoji-storytelling">
                <EmojiStoryTelling />
              </div>
              <div data-tour="mood-tracker">
                <MoodTracker toolId={1} />
              </div>
              <div data-tour="progress-dashboard">
                <ProgressDashboard />
              </div>
              <div data-tour="achievements">
                <AchievementsList />
              </div>
              <div data-tour="diagnostics">
                <DiagnosticsDashboard />
              </div>
            </div>

            {/* SEO 分析報告移到最下方 */}
            <div className="mt-8" data-tour="seo-analytics">
              <SeoAnalyticsDashboard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}