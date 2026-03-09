import { Send, Database, Radio, Cpu } from "lucide-react";
import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const [location] = useLocation();

  const navigationItems = [
    { title: "TRANSMIT", subtitle: "Отправить послание", url: "/", icon: Send },
    { title: "ARCHIVE", subtitle: "История записей", url: "/history", icon: Database },
  ];

  return (
    <Sidebar variant="inset" className="border-r border-purple-900/25">
      <SidebarHeader className="p-5 border-b border-purple-900/25">
        <div className="flex items-center gap-3">
          <div className="p-2 border border-purple-700/40 bg-purple-950/30">
            <Cpu className="w-4 h-4 text-purple-500/70" />
          </div>
          <div>
            <h2
              className="font-black text-base leading-none tracking-wider text-white/85"
              style={{ fontFamily: "'Orbitron', sans-serif", textShadow: "0 0 12px rgba(120,40,255,0.5)" }}
            >
              NERV
            </h2>
            <p className="text-[9px] text-purple-600/50 tracking-[0.3em] uppercase mt-0.5"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              EVA-01 INTERFACE
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[9px] font-bold uppercase tracking-[0.35em] text-purple-700/50 px-5 mb-2"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}>
            // NAVIGATION
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="rounded-none h-auto py-2.5 transition-all duration-150 border border-transparent data-[active=true]:border-purple-700/40 data-[active=true]:bg-purple-950/40 hover:bg-purple-950/25 hover:border-purple-800/30"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className={`w-3.5 h-3.5 flex-shrink-0 ${location === item.url ? "text-purple-400" : "text-purple-700/50"}`} />
                      <div>
                        <p className={`text-xs font-bold tracking-widest leading-none ${location === item.url ? "text-purple-200/90" : "text-purple-500/50"}`}
                          style={{ fontFamily: "'Orbitron', sans-serif" }}>
                          {item.title}
                        </p>
                        <p className="text-[9px] text-purple-700/40 mt-0.5"
                          style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                          {item.subtitle}
                        </p>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-5">
        <div className="border border-purple-800/30 bg-purple-950/15 p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-purple-700/40 to-transparent" />
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-3 h-3 text-[#00ff64] flex-shrink-0"
              style={{ filter: "drop-shadow(0 0 4px #00ff64)" }} />
            <span className="text-[9px] text-purple-500/60 tracking-[0.3em] uppercase"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              SYSTEM STATUS
            </span>
          </div>
          <p className="text-[10px] text-purple-600/50 leading-relaxed"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}>
            ANONYMITY: 100%{"\n"}IDENTITY: CLASSIFIED
          </p>
        </div>
      </div>
    </Sidebar>
  );
}
