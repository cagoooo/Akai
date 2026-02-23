import { Suspense, lazy, useEffect } from "react";
import { Router, Switch, Route, useLocation } from "wouter";
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
const Footer = lazy(() => import("@/components/Footer").then(module => ({ default: module.Footer })));
const Toaster = lazy(() => import("@/components/ui/toaster").then(module => ({ default: module.Toaster })));

// ✅ 策略：TooltipProvider 保持 lazy（避免加大主 bundle 造成 TBT↑）
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

/**
 * ✅ 核心 LCP 優化骨架：
 * 包含真實 h1 文字（而非純骨架），讓 Lighthouse 能立即識別到大型文字元素為 LCP。
 * TooltipProvider lazy 加載期間，此骨架提供有意義的 FCP + LCP 內容。
 */
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 md:py-8">
        {/* ✅ 真實 h1：讓 Lighthouse 捕捉到大文字作為 LCP 元素，而非 placeholder */}
        <header className="relative overflow-hidden mb-4 sm:mb-6 p-5 sm:p-6 md:p-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg">
          <div className="relative z-10 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight mb-2 sm:mb-3">
              ✨ 教育科技創新專區 ✨
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/80 font-medium max-w-2xl mx-auto">
              探索阿凱老師開發的教育工具，為您的教學增添創新的可能
            </p>
          </div>
        </header>

        {/* 工具卡片骨架 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </main>
    </div>
  );
}

function App() {
  const [location, setLocation] = useLocation();
  const base = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;

  useEffect(() => {
    // 🚀 SPA 路由恢復邏輯：處理 GitHub Pages 404 重定向
    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get('redirect');

    if (redirectPath) {
      console.log('Detected redirect path, navigating to:', redirectPath);
      // 移除可能存在的 base path 前綴
      const cleanPath = redirectPath.startsWith(base)
        ? redirectPath.substring(base.length)
        : redirectPath;

      setLocation(cleanPath || '/');

      // 清除 URL 中的 redirect 參數，維持網址美觀
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState(null, '', newUrl);
    }
  }, [base, setLocation]);

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
           * ✅ 核心策略：
           * - TooltipProvider 保持 lazy → 主 bundle 不膨脹 → TBT 維持低水準
           * - fallback 改為含 h1 真實文字的 PageSkeleton
           * - h1 "✨ 教育科技創新專區 ✨" 是大文字 → 成為 LCP 元素
           * - 骨架立即觸發有意義的 FCP，不再是空白屏幕
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

// ⚠️ 不使用 strict 模式：strict=true 會強制 m.* 等到 features 載入後才渲染，造成 LCP 8s
export default function AppWithLazyMotion() {
  return (
    <LazyMotion features={loadFramerFeatures}>
      <App />
    </LazyMotion>
  );
}