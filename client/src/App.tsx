import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import History from "@/pages/history";
import { AppSidebar } from "@/components/app-sidebar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/history" component={History} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <SidebarProvider style={sidebarStyle as React.CSSProperties}>
          <div className="flex h-screen w-full bg-slate-50/50">
            <AppSidebar />
            
            <div className="flex flex-col flex-1 overflow-hidden relative">
              {/* Mobile Header with Trigger */}
              <header className="md:hidden flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-xl z-20 sticky top-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <SidebarTrigger>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SidebarTrigger>
                  <h1 className="font-display font-bold text-lg">
                    Anon<span className="text-primary">Sender</span>
                  </h1>
                </div>
              </header>

              {/* Desktop subtle floating trigger if sidebar is collapsed */}
              <div className="hidden md:block absolute top-6 left-6 z-20">
                 <SidebarTrigger className="bg-white shadow-md hover:shadow-lg rounded-xl transition-shadow border border-border" />
              </div>

              <main className="flex-1 overflow-y-auto relative scroll-smooth">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
