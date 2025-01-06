import { Switch, Route } from "wouter";
import { Home } from "@/pages/Home";
import { HelpProvider } from "@/components/HelpProvider";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <HelpProvider>
      <Switch>
        <Route path="/" component={Home} />
      </Switch>
      <Toaster />
    </HelpProvider>
  );
}

export default App;