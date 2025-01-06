import { Switch, Route } from "wouter";
import { Home } from "@/pages/Home";
import { HelpProvider } from "@/components/HelpProvider";
import { Toaster } from "@/components/ui/toaster";
import { BreakpointIndicator } from "@/components/BreakpointIndicator";

function App() {
  return (
    <HelpProvider>
      <Switch>
        <Route path="/" component={Home} />
      </Switch>
      <Toaster />
      <BreakpointIndicator />
    </HelpProvider>
  );
}

export default App;