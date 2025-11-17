import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Plus } from "lucide-react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppProvider } from "@/lib/AppContext";
import { AppSidebar } from "@/components/app-sidebar";
import { ClientSwitcher } from "@/components/client-switcher";
import { CreatePostModal } from "@/components/create-post-modal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

import Calendar from "@/pages/calendar";
import Connections from "@/pages/connections";
import Analytics from "@/pages/analytics";
import Clients from "@/pages/clients";
import Settings from "@/pages/settings";
import Security from "@/pages/security";
import SecurityDetail from "@/pages/security-detail";
import NotFound from "@/pages/not-found";

const routeConfig: Record<string, { title: string; breadcrumb: string; description: string }> = {
  '/': { 
    title: 'Calendar - Post Farming', 
    breadcrumb: 'Calendar',
    description: 'Schedule and manage your social media posts across Instagram, Facebook, and TikTok with our calendar view.'
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
      <Route path="/connections" component={Connections} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/clients" component={Clients} />
      <Route path="/settings" component={Settings} />
      <Route path="/security" component={Security} />
      <Route path="/security/:id" component={SecurityDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  const getCurrentBreadcrumb = () => {
    if (location.startsWith('/security/')) return 'Account Health';
    return routeConfig[location]?.breadcrumb || 'Page';
  };

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
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getCurrentBreadcrumb()}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-3">
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
