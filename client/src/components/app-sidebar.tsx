import { Send, History, Sparkles, MessageSquare } from "lucide-react";
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
      title: "Отправить сообщение",
      url: "/",
      icon: Send,
    },
    {
      title: "История",
      url: "/history",
      icon: History,
    },
  ];

  return (
    <Sidebar variant="inset" className="border-r border-border/50">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3 text-primary">
          <div className="p-2 bg-primary/10 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-xl text-foreground">
            Anon<span className="text-primary">Sender</span>
          </h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-6 mb-2">
            Навигация
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-4 space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    className="rounded-xl h-11 transition-all duration-200 data-[active=true]:bg-primary/10 data-[active=true]:text-primary font-medium"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {/* Decorative footer element */}
      <div className="mt-auto p-6">
        <div className="rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 p-4 border border-white/50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Sparkles className="w-16 h-16" />
          </div>
          <h3 className="font-display font-bold text-sm mb-1 text-foreground">Анонимность 100%</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Никто не узнает, что это были вы. Отправляйте смело.
          </p>
        </div>
      </div>
    </Sidebar>
  );
}
