import { Suspense } from "react";
import { Router, Switch, Route } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import { TourProvider } from "@/components/TourProvider";
import { Toaster } from "@/components/ui/toaster";
import { PageTransition } from "@/components/PageTransition";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Footer } from "@/components/Footer";
import { ErrorBoundary, SuspenseWrapper } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/SEOHead";
import { WebsiteSchema, OrganizationSchema, AllToolsSchema } from "@/components/StructuredData";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { InstallPrompt } from "@/components/InstallPrompt";

// 直接 import
import { Home } from "@/pages/Home";
import { ToolDetail } from "@/pages/ToolDetail";
import { TriviaDialog } from "@/components/TriviaDialog";

// 取得 base path - Vite 會在建置時注入 BASE_URL
const basePath = import.meta.env.BASE_URL || '/';

// 頁面載入骨架屏
function PageSkeleton() {
  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* 標題骨架 */}
      <Skeleton className="h-12 w-64" />

      {/* 訪客計數器骨架 */}
      <Skeleton className="h-32 w-full rounded-lg" />

      {/* 工具卡片骨架 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function App() {
  // 移除結尾的斜線以符合 wouter 格式
  const base = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;

  console.log('App basePath:', basePath, 'wouter base:', base);

  return (
    <HelmetProvider>
      <ErrorBoundary>
        {/* SEO 全域設定 */}
        <SEOHead />
        <WebsiteSchema />
        <OrganizationSchema />
        <AllToolsSchema />

        <QueryClientProvider client={queryClient}>
          <TourProvider>
            {/* 使用 Router base 設定 GitHub Pages 路徑 */}
            <Router base={base}>
              <div className="min-h-screen flex flex-col">
                <PageTransition>
                  <Switch>
                    <Route path="/">
                      <Home />
                    </Route>
                    <Route path="/tool/:id">
                      <ToolDetail />
                    </Route>
                  </Switch>
                </PageTransition>
                <Footer />
              </div>
            </Router>

            <TriviaDialog />

            <Toaster />

            {/* PWA 功能元件 */}
            <OfflineIndicator />
            <InstallPrompt />
          </TourProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;