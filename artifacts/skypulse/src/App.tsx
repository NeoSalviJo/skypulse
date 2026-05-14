import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsProvider } from "@/components/settings-provider";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
const queryClient = new QueryClient();
function Router() {
    return (<Switch>
      <Route path="/" component={Dashboard}/>
      <Route component={NotFound}/>
    </Switch>);
}
function App() {
    return (<ThemeProvider defaultTheme="dark" storageKey="skypulse-theme">
      <SettingsProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <div className="min-h-screen text-foreground selection:bg-primary/30">
                <Router />
              </div>
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </SettingsProvider>
    </ThemeProvider>);
}
export default App;
