import { Suspense, lazy, useEffect } from "react";
import { Router, Switch, Route } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import { SEOHead } from "@/components/SEOHead";
import { WebsiteSchema, OrganizationSchema } from "@/components/StructuredData";
import { LazyMotion } from "framer-motion";

// 動態載入 Framer Motion 特徵
const loadFramerFeatures = () => import("./framerFeatures").then(res => res.default);

// 直接 import 首頁 (首屏必須載入)
import { Home } from "@/pages/Home";

// 延遲載入次要路由元件與彈窗元件
const ToolDetail = lazy(() => import("@/pages/ToolDetail").then(module => ({ default: module.ToolDetail })));
const AdminAuth = lazy(() => import("@/components/AdminAuth").then(module => ({ default: module.AdminAuth })));
const TriviaDialog = lazy(() => import("@/components/TriviaDialog").then(module => ({ default: module.TriviaDialog })));
const PWAUpdatePrompt = lazy(() => import("@/components/PWAUpdatePrompt").then(module => ({ default: module.PWAUpdatePrompt })));
const ToolRankings = lazy(() => import("@/components/ToolRankings").then(module => ({ default: module.ToolRankings })));
const VisitorCounter = lazy(() => import("@/components/VisitorCounter").then(module => ({ default: module.VisitorCounter })));
const RecommendedTools = lazy(() => import("@/components/RecommendedTools").then(module => ({ default: module.RecommendedTools })));
const Footer = lazy(() => import("@/components/Footer").then(module => ({ default: module.Footer })));
const Toaster = lazy(() => import("@/components/ui/toaster").then(module => ({ default: module.Toaster })));

// ✅ 策略：TooltipProvider 保持 lazy（避免拉大主 bundle 造成 TBT 爆表）
// ✅ 但外層 Suspense 的 fallback 改為 PageSkeleton（骨架立即觸發 FCP，不再空白）
const TooltipProvider = lazy(() => import("@/components/ui/tooltip").then(module => ({ default: module.TooltipProvider })));

import { OptimizedIcon } from "@/components/OptimizedIcons";
import { PageTransition } from "@/components/PageTransition";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { TourProvider } from "@/components/TourProvider";

// 取得 base path - Vite 會在建置時注入 BASE_URL
const basePath = import.meta.env.BASE_URL || '/';

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
  const base = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    import('@/hooks/useClickTracking').then(({ initClickTracking }) => {
      const cleanup = initClickTracking();
      return () => cleanup();
    });
  }, []);

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <SEOHead />
        <WebsiteSchema />
        <OrganizationSchema />

        <QueryClientProvider client={queryClient}>
          {/*
           * ✅ 核心策略：TooltipProvider 保持 lazy（不塞大主 bundle，避免 TBT↑）
           * ✅ fallback 改為 PageSkeleton（骨架立即可見，觸發 FCP）
           * 💡 骨架觸發 FCP → 真實內容觸發 LCP，兩者分離，各自計時
           */}
          <Suspense fallback={<PageSkeleton />}>
            <TooltipProvider>
              <TourProvider>
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
                    <Suspense fallback={null}>
                      <Footer />
                    </Suspense>
                  </div>
                </Router>

                <Suspense fallback={null}>
                  <TriviaDialog />
                </Suspense>

                <Suspense fallback={null}>
                  <Toaster />
                </Suspense>

                <Suspense fallback={null}>
                  <PWAUpdatePrompt />
                </Suspense>
              </TourProvider>
            </TooltipProvider>
          </Suspense>
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

// ⚠️ 不使用 strict 模式：strict=true 會強制 m.* 等待 features 載入，導致 LCP 8s
export default function AppWithLazyMotion() {
  return (
    <LazyMotion features={loadFramerFeatures}>
      <App />
    </LazyMotion>
  );
}