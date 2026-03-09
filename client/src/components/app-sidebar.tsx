import { Send, BookOpen, Feather } from "lucide-react";
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
    {
      title: "Написать послание",
      url: "/",
      icon: Send,
    },
    {
      title: "Записи тетради",
      url: "/history",
      icon: BookOpen,
    },
  ];

  return (
    <Sidebar variant="inset" className="border-r border-red-900/20">
      <SidebarHeader className="p-6 border-b border-red-900/20">
        <div className="flex items-center gap-3">
          <div className="p-2 border border-red-900/40 rounded bg-red-950/20">
            <Feather className="w-5 h-5 text-red-700/70" />
          </div>
          <div>
            <h2
              className="font-bold text-lg leading-none"
              style={{ fontFamily: "'Cinzel', serif", color: "#e0cca0" }}
            >
              Death Note
            </h2>
            <p className="text-xs text-stone-600 tracking-widest uppercase font-sans mt-0.5">
              Тетрадь смерти
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-widest text-red-900/60 px-6 mb-2 font-sans">
            Навигация
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-4 space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="rounded h-11 transition-all duration-200 data-[active=true]:bg-red-950/30 data-[active=true]:text-red-600/90 data-[active=true]:border-red-900/40 border border-transparent font-sans text-stone-400 hover:text-stone-200 hover:bg-stone-900/40"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm tracking-wide">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-6">
        <div className="rounded border border-red-900/30 bg-red-950/10 p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5">
            <Feather className="w-14 h-14 text-red-500" />
          </div>
          <h3
            className="text-xs font-bold mb-1 tracking-wider uppercase"
            style={{ fontFamily: "'Cinzel', serif", color: "#8b5a2b" }}
          >
            Анонимность
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed font-body italic">
            Никто не узнает, кто написал в тетрадь.
          </p>
        </div>
      </div>
    </Sidebar>
  );
}
