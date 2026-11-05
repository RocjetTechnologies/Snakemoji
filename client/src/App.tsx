import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import SnakeGame from "@/pages/SnakeGame";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SnakeGame} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;