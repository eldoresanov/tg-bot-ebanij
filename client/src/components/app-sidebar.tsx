import { Send, Archive } from "lucide-react";
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
    { title: "TRANSMIT", subtitle: "отправить послание", url: "/", icon: Send },
    { title: "ARCHIVE", subtitle: "история передач", url: "/history", icon: Archive },
  ];

  return (
    <Sidebar variant="inset" className="border-r border-teal-900/20">
      <SidebarHeader className="p-5 border-b border-teal-900/15">
        <div>
          <h2
            className="leading-none glitch"
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: "1.7rem",
              color: "rgba(100,190,200,0.65)",
              textShadow: "0 0 12px rgba(60,170,180,0.3), 2px 0 rgba(200,80,120,0.1)",
              letterSpacing: "0.1em",
            }}
          >
            THE WIRED
          </h2>
          <p
            className="text-[9px] text-teal-800/40 tracking-[0.35em] uppercase mt-1"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            anonymous node // active
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-3">
        <SidebarGroup>
          <SidebarGroupLabel
            className="text-[9px] text-teal-800/35 tracking-[0.3em] uppercase px-5 mb-1"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            // navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="h-auto py-2.5 transition-all duration-150 rounded-none border border-transparent data-[active=true]:border-teal-800/30 data-[active=true]:bg-teal-950/20 hover:bg-teal-950/15 hover:border-teal-900/20"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon
                        className={`w-3.5 h-3.5 flex-shrink-0 ${location === item.url ? "text-teal-500/60" : "text-teal-800/35"}`}
                      />
                      <div>
                        <p
                          className={`text-xs leading-none tracking-widest ${location === item.url ? "text-teal-300/60" : "text-teal-700/40"}`}
                          style={{ fontFamily: "'Share Tech Mono', monospace" }}
                        >
                          {item.title}
                        </p>
                        <p
                          className="text-[9px] text-slate-600/30 mt-0.5"
                          style={{ fontFamily: "'Share Tech Mono', monospace" }}
                        >
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
        <div className="lain-border p-4 bg-black/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-teal-700/20 to-transparent" />
          <p
            className="text-[9px] text-teal-800/35 tracking-[0.3em] uppercase mb-2"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            system.log
          </p>
          <p
            className="text-[10px] text-slate-700/35 leading-relaxed italic"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            no matter where you go,<br />everyone is connected.
          </p>
        </div>
      </div>
    </Sidebar>
  );
}
