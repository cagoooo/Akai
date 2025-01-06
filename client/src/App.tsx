import { Switch, Route } from "wouter";
import { Home } from "@/pages/Home";
import { HelpProvider } from "@/components/HelpProvider";

function App() {
  return (
    <HelpProvider>
      <Switch>
        <Route path="/" component={Home} />
      </Switch>
    </HelpProvider>
  );
}

export default App;