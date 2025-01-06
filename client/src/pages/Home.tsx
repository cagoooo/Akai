import { ToolCard } from "@/components/ToolCard";
import { TeacherIntro } from "@/components/TeacherIntro";
import { tools } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useHelp } from "@/components/HelpProvider";

export function Home() {
  const { startTour } = useHelp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md"
      >
        跳至主要內容
      </a>

      <main id="main-content" className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            教育工具整合平台
          </h1>
          <Button 
            variant="outline" 
            onClick={startTour}
            aria-label="開始導覽教學"
          >
            <HelpCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            導覽教學
          </Button>
        </div>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
          探索阿凱老師開發的教育工具，為您的教學增添創新的可能
        </p>

        <section aria-labelledby="teacher-info" className="mb-12" data-tour="teacher-intro">
          <h2 id="teacher-info" className="sr-only">教師介紹</h2>
          <TeacherIntro />
        </section>

        <section aria-label="教育工具列表" data-tour="tools-grid">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" role="list">
            {tools.map((tool) => (
              <div key={tool.id} role="listitem">
                <ToolCard tool={tool} />
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} 教育工具整合平台. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}