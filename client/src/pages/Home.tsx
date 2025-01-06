import { ToolCard } from "@/components/ToolCard";
import { TeacherIntro } from "@/components/TeacherIntro";
import { tools } from "@/lib/data";

export function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            教育工具整合平台
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            探索阿凱老師開發的教育工具，為您的教學增添創新的可能
          </p>
        </div>

        <div className="mb-12">
          <TeacherIntro />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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