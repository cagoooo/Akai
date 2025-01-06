import { ToolCard } from "@/components/ToolCard";
import { TeacherIntro } from "@/components/TeacherIntro";
import { tools } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useHelp } from "@/components/HelpProvider";

export function Home() {
  const { startTour } = useHelp();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            教育工具整合平台
          </h1>
          <Button variant="outline" onClick={startTour}>
            <HelpCircle className="mr-2 h-4 w-4" />
            導覽教學
          </Button>
        </div>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
          探索阿凱老師開發的教育工具，為您的教學增添創新的可能
        </p>

        <div className="mb-12" data-tour="teacher-intro">
          <TeacherIntro />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" data-tour="tools-grid">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} 教育工具整合平台. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}