import { Switch, Route } from "wouter";
import { Home } from "@/pages/Home";
import { HelpProvider } from "@/components/HelpProvider";
import { Toaster } from "@/components/ui/toaster";
import { BreakpointIndicator } from "@/components/BreakpointIndicator";
import { PageTransition } from "@/components/PageTransition";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelpProvider>
        <PageTransition>
          <Switch>
            <Route path="/" component={Home} />
          </Switch>
        </PageTransition>
        <Toaster />
        <BreakpointIndicator />
      </HelpProvider>
    </QueryClientProvider>
  );
}

export default App;