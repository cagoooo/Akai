import { Suspense, lazy, useEffect } from "react";
import { Router, Switch, Route } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import { TourProvider } from "@/components/TourProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OptimizedIcon } from "@/components/OptimizedIcons";
import { PageTransition } from "@/components/PageTransition";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Footer } from "@/components/Footer";
import { ErrorBoundary, SuspenseWrapper } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/SEOHead";
import { WebsiteSchema, OrganizationSchema } from "@/components/StructuredData";
import { LazyMotion } from "framer-motion";

// 動態載入 Framer Motion 特徵 (進一步縮減初始 JS，使用獨立檔案支援 Tree-Shaking)
const loadFramerFeatures = () => import("./framerFeatures").then(res => res.default);

// 直接 import 首頁 (首屏必須載入)
import { Home } from "@/pages/Home";

// 延遲載入次要路由元件與彈窗元件 (解決 Code Splitting)
// 注意：因為是以 named export 導出，需轉為 default format
const ToolDetail = lazy(() => import("@/pages/ToolDetail").then(module => ({ default: module.ToolDetail })));
const AdminAuth = lazy(() => import("@/components/AdminAuth").then(module => ({ default: module.AdminAuth })));
const TriviaDialog = lazy(() => import("@/components/TriviaDialog").then(module => ({ default: module.TriviaDialog })));
const PWAUpdatePrompt = lazy(() => import("@/components/PWAUpdatePrompt").then(module => ({ default: module.PWAUpdatePrompt })));

// 取得 base path - Vite 會在建置時注入 BASE_URL
const basePath = import.meta.env.BASE_URL || '/';

// 頁面載入骨架屏
function PageSkeleton() {
  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* 標題骨架 */}
      <OptimizedIcon name="Keyboard" className="h-5 w-5" />
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

  // 頁面載入或重新整理時自動滾動到頂部
  useEffect(() => {
    // 禁用瀏覽器的滾動記憶功能
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    // 強制滾動到頂部
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // 初始化點擊追蹤
  useEffect(() => {
    import('@/hooks/useClickTracking').then(({ initClickTracking }) => {
      const cleanup = initClickTracking();
      return () => cleanup();
    });
  }, []);

  return (
    <HelmetProvider>
      <ErrorBoundary>
        {/* SEO 全域設定 */}
        <SEOHead />
        <WebsiteSchema />
        <OrganizationSchema />

        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <TourProvider>
              {/* 使用 Router base 設定 GitHub Pages 路徑 */}
              <Router base={base}>
                <div className="min-h-screen flex flex-col">
                  <PageTransition>
                    <Suspense fallback={<PageSkeleton />}>
                      <Switch>
                        <Route path="/">
                          <Home />
                        </Route>
                        <Route path="/tool/:id">
                          <ToolDetail />
                        </Route>
                        <Route path="/admin">
                          <AdminAuth />
                        </Route>
                      </Switch>
                    </Suspense>
                  </PageTransition>
                  <Footer />
                </div>
              </Router>

              <Suspense fallback={null}>
                <TriviaDialog />
              </Suspense>

              <Toaster />

              {/* PWA 功能元件 */}
              <Suspense fallback={null}>
                <PWAUpdatePrompt />
              </Suspense>
            </TourProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

// 用 LazyMotion 包裝整個 App，確保所有 `m` 元件都能獲得動畫能力
export default function AppWithLazyMotion() {
  return (
    <LazyMotion features={loadFramerFeatures} strict>
      <App />
    </LazyMotion>
  );
}