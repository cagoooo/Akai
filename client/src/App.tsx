import { Suspense, lazy, useEffect } from "react";
import { Router, Switch, Route, useLocation } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import { SEOHead } from "@/components/SEOHead";
import { WebsiteSchema, OrganizationSchema } from "@/components/StructuredData";
import { LazyMotion } from "framer-motion";

// 動態載入 Framer Motion 特徵
const loadFramerFeatures = () => import("./framerFeatures").then(res => res.default);

// 直接 import 首頁 (首屏必須載入)
// 改為 E2 公佈欄版首頁（BulletinHome），舊版 Home 保留於 /classic 以便對比
import { BulletinHome } from "@/pages/BulletinHome";
import { Home as ClassicHome } from "@/pages/Home";

// 延遲載入次要路由元件與彈窗元件
// BulletinToolDetail 為 cork 風格詳情頁；舊版 ToolDetail 保留於 /tool-classic/:id
const ToolDetail = lazy(() => import("@/pages/BulletinToolDetail").then(module => ({ default: module.BulletinToolDetail })));
const ClassicToolDetail = lazy(() => import("@/pages/ToolDetail").then(module => ({ default: module.ToolDetail })));
const AdminAuth = lazy(() => import("@/components/AdminAuth").then(module => ({ default: module.AdminAuth })));
const TriviaDialog = lazy(() => import("@/components/TriviaDialog").then(module => ({ default: module.TriviaDialog })));
const PWAUpdatePrompt = lazy(() => import("@/components/PWAUpdatePrompt").then(module => ({ default: module.PWAUpdatePrompt })));
const Footer = lazy(() => import("@/components/Footer").then(module => ({ default: module.Footer })));
const Toaster = lazy(() => import("@/components/ui/toaster").then(module => ({ default: module.Toaster })));

// ✅ 策略：TooltipProvider 改回直接 import
// 原因：TooltipProvider 是整個 App 的包袹層，若使用 lazy 會導致首頁必須等待其載入才能顯示，反而推遲 LCP
import { TooltipProvider } from "@/components/ui/tooltip";
import { TourProvider } from "@/components/TourProvider";

import { OptimizedIcon } from "@/components/OptimizedIcons";
import { PageTransition } from "@/components/PageTransition";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

// 取得 base path - Vite 會在建置時注入 BASE_URL
const basePath = import.meta.env.BASE_URL || '/';

// 應用啟動時自動進行：匿名身份建立 + 增加訪客數 + 累計 analytics（地理/裝置/來源）
// 不論落地頁是 BulletinHome / /admin / /tool/:id / /wish 都會被記到，
// 不再依賴 BulletinVisitorCounter 元件是否渲染。
// 動態 import 避免影響首屏載入。
if (typeof window !== 'undefined') {
  setTimeout(() => {
    import('@/lib/visitorTracker').then(({ trackPageVisit }) => {
      trackPageVisit().catch((err) => console.warn('[App] trackPageVisit 失敗:', err));
    });
  }, 800); // 等首屏 LCP 過去再做
}

/**
 * 條件式 Footer：
 * - 在 BulletinHome (/) 隱藏全站 Footer（因該頁有自己的 cork 風格 BulletinFooter）
 * - 其他路由 (/classic /tool/:id /admin) 仍顯示預設 Footer
 */
function ConditionalFooter() {
  const [location] = useLocation();
  // BulletinHome ('/') 與 BulletinToolDetail ('/tool/:id') 皆已有整合版 BulletinFooter
  if (location === '/' || location === '') return null;
  if (location.startsWith('/tool/')) return null;
  return <Footer />;
}

/**
 * ✅ 核心 LCP 優化骨架：
 * 包含真實 h1 文字（而非純骨架），讓 Lighthouse 能立即識別到大型文字元素為 LCP。
 * TooltipProvider lazy 加載期間，此骨架提供有意義的 FCP + LCP 內容。
 */
function PageSkeleton() {
  // cork 風格的 LCP 骨架：保留真實大 h1 讓 Lighthouse 抓到，但換成 E2 便利貼主題
  return (
    <div className="cork-bg min-h-screen" style={{ paddingTop: 18, fontFamily: "'Noto Sans TC', sans-serif" }}>
      <main className="container mx-auto px-4 sm:px-8 py-10">
        {/* ✅ 真實 h1：Lighthouse 的 LCP 元素（cork 風） */}
        <section
          className="mb-8 p-8 sm:p-12 relative"
          style={{
            background: '#fff27a',
            border: '2.5px solid #1a1a1a',
            borderRadius: 6,
            boxShadow: '4px 4px 0 rgba(0,0,0,.25), 0 14px 24px -6px rgba(0,0,0,.25)',
            transform: 'rotate(-1deg)',
            maxWidth: 880,
            margin: '0 auto 32px',
          }}
        >
          {/* 紅色立體圖釘 */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: -12,
              left: '50%',
              marginLeft: -12,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #ffffff, #dc2626 55%, #000000)',
              boxShadow: '0 2px 5px rgba(0,0,0,.35), inset -1px -2px 3px rgba(0,0,0,.25)',
              zIndex: 2,
            }}
          />
          <div className="text-center">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3"
              style={{ color: '#1a1a1a', letterSpacing: '0.02em', lineHeight: 1.2 }}
            >
              ✨{' '}
              <span
                style={{
                  background:
                    'linear-gradient(transparent 55%, #7a8c3a 55%, #7a8c3a 88%, transparent 88%)',
                  padding: '0 6px',
                }}
              >
                教育科技創新專區
              </span>{' '}
              ✨
            </h1>
            <p className="text-sm sm:text-base md:text-lg font-medium" style={{ color: '#4a3a20' }}>
              探索阿凱老師開發的教育工具，為您的教學增添創新的可能
            </p>
          </div>
        </section>

        {/* 工具卡片骨架（cork 紙張風） */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: '#fefdfa',
                border: '1px solid #d8d4c8',
                borderRadius: 4,
                padding: 14,
                transform: `rotate(${(i - 1) * 1.5}deg)`,
                boxShadow: '3px 3px 5px rgba(0,0,0,.15), 0 10px 18px -6px rgba(0,0,0,.2)',
                opacity: 0.85,
              }}
            >
              <Skeleton className="h-36 rounded-none mb-3" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function App() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const base = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;

  useEffect(() => {
    // 🛡️ [安全性修復] 全局資源 404 監聽（自癒補償機制）
    const handleAssetError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const message = 'reason' in event ? event.reason?.message : event.message;
      const isChunkError = /Loading chunk|Failed to fetch dynamically imported module/i.test(message || '');

      if (isChunkError) {
        console.error('🚀 偵測到版本斷層：資源已在伺服器更新，正在導引恢復...', message);
        toast({
          title: "🚀 偵測到系統更新",
          description: "為了確保功能完全正常，我們需要快速為您同步最新資產。",
          variant: "default",
          action: (
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm font-bold shadow-lg"
            >
              立即同步
            </button>
          ),
          duration: 10000,
        });
      }
    };

    window.addEventListener('error', handleAssetError, true);
    window.addEventListener('unhandledrejection', handleAssetError);
    return () => {
      window.removeEventListener('error', handleAssetError, true);
      window.removeEventListener('unhandledrejection', handleAssetError);
    };
  }, [toast]);

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
    // 🚀 [UX 優化] 當路由路徑發生變化時，自動捲動至頂部
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location]);

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
          <TooltipProvider>
            <TourProvider>
              <Router base={base}>
                <div className="min-h-screen flex flex-col">
                  <PageTransition>
                    <Suspense fallback={<PageSkeleton />}>
                      <Switch>
                        <Route path="/">
                          <BulletinHome />
                        </Route>
                        <Route path="/classic">
                          <ClassicHome />
                        </Route>
                        <Route path="/tool/:id">
                          <ToolDetail />
                        </Route>
                        <Route path="/tool-classic/:id">
                          <ClassicToolDetail />
                        </Route>
                        <Route path="/admin">
                          <AdminAuth />
                        </Route>
                      </Switch>
                    </Suspense>
                  </PageTransition>
                  <Suspense fallback={null}>
                    <ConditionalFooter />
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