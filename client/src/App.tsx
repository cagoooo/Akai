import { Switch, Route } from "wouter";
import { Home } from "@/pages/Home";
import { TourProvider } from "@/components/TourProvider";
import { Toaster } from "@/components/ui/toaster";
import { PageTransition } from "@/components/PageTransition";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Footer } from "@/components/Footer";
import { TriviaDialog } from "@/components/TriviaDialog";

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
      </TourProvider>
    </QueryClientProvider>
  );
}

export default App;