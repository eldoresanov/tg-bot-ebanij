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
          <div className="flex h-screen w-full bg-background">
            <AppSidebar />
            
            <div className="flex flex-col flex-1 overflow-hidden relative">
              {/* Mobile Header with Trigger */}
              <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-teal-900/15 bg-background/95 backdrop-blur-xl z-20 sticky top-0">
                <div className="flex items-center gap-3">
                  <SidebarTrigger>
                    <Button variant="ghost" size="icon" className="md:hidden text-teal-700/40 hover:text-teal-400/60">
                      <Menu className="w-4 h-4" />
                    </Button>
                  </SidebarTrigger>
                  <h1
                    className="leading-none glitch"
                    style={{
                      fontFamily: "'VT323', monospace",
                      fontSize: "1.4rem",
                      color: "rgba(100,190,200,0.6)",
                      textShadow: "0 0 10px rgba(60,170,180,0.3)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    THE WIRED
                  </h1>
                </div>
                <span className="text-[9px] text-teal-800/30 tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                  PRESENT TIME
                </span>
              </header>

              {/* Desktop subtle floating trigger if sidebar is collapsed */}
              <div className="hidden md:block absolute top-6 left-6 z-20">
                <SidebarTrigger className="bg-background border border-teal-900/20 hover:border-teal-700/30 rounded-none transition-colors text-teal-700/40 hover:text-teal-500/60" />
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
