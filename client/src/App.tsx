import { Suspense } from "react";
import { Switch, Route } from "wouter";
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

// 直接 import，暫時移除 lazy loading 來測試 GitHub Pages
import { Home } from "@/pages/Home";
import { TriviaDialog } from "@/components/TriviaDialog";

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
            <div className="min-h-screen flex flex-col">
              <PageTransition>
                <Switch>
                  <Route path="/">
                    <Home />
                  </Route>
                </Switch>
              </PageTransition>
              <Footer />
            </div>

            <TriviaDialog />

            <Toaster />
          </TourProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;