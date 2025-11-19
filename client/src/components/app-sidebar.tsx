import { Calendar, Link as LinkIcon, BarChart3, Users, Settings, MessageSquare, Shield, Inbox } from "lucide-react";
import { Link, useLocation } from "wouter";
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
import { useApp } from "@/lib/AppContext";
import { translations } from "@/lib/translations";

export function AppSidebar() {
  const [location] = useLocation();
  const { language } = useApp();
  const t = translations[language];

  const menuItems = [
    {
      title: t.calendar,
      url: "/",
      icon: Calendar,
      id: 'calendar'
    },
    {
      title: t.inbox,
      url: "/inbox",
      icon: Inbox,
      id: 'inbox'
    },
    {
      title: t.connections,
      url: "/connections",
      icon: LinkIcon,
      id: 'connections'
    },
    {
      title: t.analytics,
      url: "/analytics",
      icon: BarChart3,
      id: 'analytics'
    },
    {
      title: t.security,
      url: "/security",
      icon: Shield,
      id: 'security'
    },
    {
      title: t.clients,
      url: "/clients",
      icon: Users,
      id: 'clients'
    },
    {
      title: t.settings,
      url: "/settings",
      icon: Settings,
      id: 'settings'
    },
  ];

  const comingSoonItems = [
    {
      title: t.campaigns,
      icon: MessageSquare,
      id: 'campaigns'
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-lg font-bold text-primary-foreground">P</span>
          </div>
          <span className="text-lg font-semibold">{t.appName}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`nav-${item.id}`}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground">{t.comingSoon}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {comingSoonItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton disabled data-testid={`nav-${item.id}`}>
                    <item.icon className="h-4 w-4" />
                    <span className="text-muted-foreground">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
