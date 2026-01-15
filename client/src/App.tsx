import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { TourProvider } from "@/components/TourProvider";
import { Toaster } from "@/components/ui/toaster";
import { PageTransition } from "@/components/PageTransition";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Footer } from "@/components/Footer";
import { ErrorBoundary, SuspenseWrapper } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";

// 懶載入頁面元件 - 程式碼分割
const Home = lazy(() => import("@/pages/Home").then(m => ({ default: m.Home })));

// 懶載入大型元件
const TriviaDialog = lazy(() =>
  import("@/components/TriviaDialog").then(m => ({ default: m.TriviaDialog }))
);

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TourProvider>
          <div className="min-h-screen flex flex-col">
            <PageTransition>
              <Switch>
                <Route path="/">
                  <Suspense fallback={<PageSkeleton />}>
                    <Home />
                  </Suspense>
                </Route>
              </Switch>
            </PageTransition>
            <Footer />
          </div>

          {/* 懶載入對話框元件 */}
          <SuspenseWrapper>
            <TriviaDialog />
          </SuspenseWrapper>

          <Toaster />
        </TourProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;