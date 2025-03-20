import { Switch, Route } from "wouter";
import { Home } from "@/pages/Home";
import { TourProvider } from "@/components/TourProvider";
import { Toaster } from "@/components/ui/toaster";
import { BreakpointIndicator } from "@/components/BreakpointIndicator";
import { PageTransition } from "@/components/PageTransition";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Footer } from "@/components/Footer";
import { TriviaDialog } from "@/components/TriviaDialog";

// Configure the query client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TourProvider>
        <div className="min-h-screen flex flex-col">
          <PageTransition>
            <Switch>
              <Route path="/" component={Home} />
            </Switch>
          </PageTransition>
          <Footer />
        </div>
        <TriviaDialog />
        <Toaster />
        <BreakpointIndicator />
      </TourProvider>
    </QueryClientProvider>
  );
}

export default App;