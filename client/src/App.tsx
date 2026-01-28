import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import DataEntry from "@/pages/DataEntry";
import DataTable from "@/pages/DataTable";
import Alerts from "@/pages/Alerts";
import Trends from "@/pages/Trends";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/entry" component={DataEntry} />
      <Route path="/data" component={DataTable} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/trends" component={Trends} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
