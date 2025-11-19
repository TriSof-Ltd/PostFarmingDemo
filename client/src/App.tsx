import React, { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Plus, Languages } from "lucide-react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppProvider, useApp } from "@/lib/AppContext";
import { AppSidebar } from "@/components/app-sidebar";
import { ClientSwitcher } from "@/components/client-switcher";
import { CreatePostModal } from "@/components/create-post-modal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

import Calendar from "@/pages/calendar";
import Inbox from "@/pages/inbox";
import Connections from "@/pages/connections";
import Analytics from "@/pages/analytics";
import Clients from "@/pages/clients";
import Settings from "@/pages/settings";
import Security from "@/pages/security";
import SecurityDetail from "@/pages/security-detail";
import AuthFacebook from "@/pages/auth-facebook";
import AuthInstagram from "@/pages/auth-instagram";
import AuthTikTok from "@/pages/auth-tiktok";
import NotFound from "@/pages/not-found";

const routeConfig: Record<string, { title: string; breadcrumb: string; description: string }> = {
  '/': {
    title: 'Calendar - Post Farming',
    breadcrumb: 'Calendar',
    description: 'Schedule and manage your social media posts across Instagram, Facebook, and TikTok with our calendar view.'
  },
  '/calendar': {
    title: 'Calendar - Post Farming',
    breadcrumb: 'Calendar',
    description: 'Schedule and manage your social media posts across Instagram, Facebook, and TikTok with our calendar view.'
  },
  '/inbox': {
    title: 'Unified Inbox - Post Farming',
    breadcrumb: 'Inbox',
    description: 'Manage and respond to comments from all your social media platforms in one unified inbox.'
  },
  '/connections': {
    title: 'Connections - Post Farming',
    breadcrumb: 'Connections',
    description: 'Connect and manage your social media accounts for Instagram, Facebook, and TikTok platforms.'
  },
  '/analytics': {
    title: 'Analytics - Post Farming',
    breadcrumb: 'Analytics',
    description: 'Track your social media performance with detailed analytics and engagement metrics across all platforms.'
  },
  '/clients': {
    title: 'Clients - Post Farming',
    breadcrumb: 'Clients',
    description: 'Manage your client accounts and their connected social media platforms in one place.'
  },
  '/settings': {
    title: 'Settings - Post Farming',
    breadcrumb: 'Settings',
    description: 'Configure your account settings, notifications, and preferences for Post Farming.'
  },
  '/security': {
    title: 'Security & Account Health - Post Farming',
    breadcrumb: 'Security',
    description: 'Monitor account health, security warnings, and platform compliance across all client social media accounts.'
  },
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Calendar} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/inbox" component={Inbox} />
      <Route path="/connections" component={Connections} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/clients" component={Clients} />
      <Route path="/settings" component={Settings} />
      <Route path="/security" component={Security} />
      <Route path="/security/:id" component={SecurityDetail} />
      <Route path="/auth/facebook" component={AuthFacebook} />
      <Route path="/auth/instagram" component={AuthInstagram} />
      <Route path="/auth/tiktok" component={AuthTikTok} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { language, setLanguage } = useApp();

  // Update page title and meta description based on route
  useEffect(() => {
    const route = routeConfig[location] || {
      title: 'Post Farming',
      description: 'Social media management platform for scheduling and managing content across multiple platforms.'
    };
    document.title = route.title;

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', route.description);
  }, [location]);

  const getBreadcrumbs = () => {
    // For security detail pages, show: Home > Security > Account Health
    if (location.startsWith('/security/')) {
      return [
        { label: 'Home', href: '/' },
        { label: 'Security', href: '/security' },
        { label: 'Account Health', href: null }, // Current page, no link
      ];
    }

    // For all other pages, show: Home > Current Page
    const currentRoute = routeConfig[location];
    if (currentRoute) {
      return [
        { label: 'Home', href: '/' },
        { label: currentRoute.breadcrumb, href: null }, // Current page, no link
      ];
    }

    // Fallback
    return [
      { label: 'Home', href: '/' },
      { label: 'Page', href: null },
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between gap-4 px-6 py-3 border-b bg-background">
          <div className="flex items-center gap-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <Separator orientation="vertical" className="h-6" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      {crumb.href ? (
                        <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-3">
            <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'ku' | 'ar')}>
              <SelectTrigger className="w-[140px]">
                <Languages className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ku">کوردی</SelectItem>
                <SelectItem value="ar">العربيّة</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setIsCreateModalOpen(true)} data-testid="button-create">
              <Plus className="mr-2 h-4 w-4" />
              Create
            </Button>
            <ClientSwitcher />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Router />
        </main>
      </div>
      <CreatePostModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  );
}

function App() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <SidebarProvider style={sidebarStyle as React.CSSProperties}>
            <AppContent />
            <Toaster />
          </SidebarProvider>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
