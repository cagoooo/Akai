import { Switch, Route } from "wouter";
import { Home } from "@/pages/Home";
import { HelpProvider } from "@/components/HelpProvider";
import { TranslationProvider } from "@/lib/translation";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <TranslationProvider>
      <HelpProvider>
        <Switch>
          <Route path="/" component={Home} />
        </Switch>
        <Toaster />
      </HelpProvider>
    </TranslationProvider>
  );
}

export default App;