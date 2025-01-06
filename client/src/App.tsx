import { Switch, Route } from "wouter";
import { Home } from "@/pages/Home";
import { HelpProvider } from "@/components/HelpProvider";
import { Toaster } from "@/components/ui/toaster";
import { BreakpointIndicator } from "@/components/BreakpointIndicator";
import { PageTransition } from "@/components/PageTransition";

function App() {
  return (
    <HelpProvider>
      <PageTransition>
        <Switch>
          <Route path="/" component={Home} />
        </Switch>
      </PageTransition>
      <Toaster />
      <BreakpointIndicator />
    </HelpProvider>
  );
}

export default App;