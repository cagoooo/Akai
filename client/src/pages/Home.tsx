import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ToolCard } from "@/components/ToolCard";
import { TeacherIntro } from "@/components/TeacherIntro";
import { MoodTracker } from "@/components/MoodTracker";
import { tools } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useHelp } from "@/components/HelpProvider";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Home() {
  const { startTour } = useHelp();

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-8 mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            教育科技創新發現
          </h1>
          <div className="flex flex-wrap gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={startTour}
              className="text-sm sm:text-base"
              aria-label="開始導覽教學"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              導覽教學
            </Button>
          </div>
        </div>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12">
          探索阿凱老師開發的教育工具，為您的教學增添創新的可能
        </p>

        <section aria-labelledby="teacher-info" className="mb-8 sm:mb-12" data-tour="teacher-intro">
          <h2 id="teacher-info" className="sr-only">教師介紹</h2>
          <TeacherIntro isLoading={isLoading} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          <div className="lg:col-span-2">
            <section
              aria-label={isLoading ? "正在載入教育工具" : "教育工具列表"}
              data-tour="tools-grid"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
            >
              {isLoading ? (
                <div className="col-span-full">
                  <LoadingScreen message="正在準備教育工具..." />
                </div>
              ) : (
                toolsData?.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))
              )}
            </section>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <MoodTracker toolId={1} />
            <ProgressDashboard />
          </div>
        </div>

        <footer className="mt-8 sm:mt-16 text-center text-sm sm:text-base text-muted-foreground">
          <p>© {new Date().getFullYear()} 教育科技創新專區. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}