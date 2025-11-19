import { AlertTriangle, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Link } from 'wouter';
import { format } from 'date-fns';
import type { HealthStatus, SeverityLevel } from '@/lib/types';

export default function Security() {
  const { state } = useApp();
  const { clientHealth } = state;




  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'attention':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'high-risk':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'attention':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high-risk':
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'high':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Security & Account Health</h1>
          <p className="text-muted-foreground mt-1">
            Portfolio view of all your client companies and the health of their connected social accounts.
          </p>
        </div>
      </div>



      {/* Connected Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Connected clients</CardTitle>
          <CardDescription>
            High-level health and recent issues per client. Click a row to open a detailed health page for that company.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-muted-foreground border-b">
              <div className="col-span-3">CLIENT</div>
              <div className="col-span-2">ACCOUNT HEALTH</div>
              <div className="col-span-5">RECENT ISSUES & RISKS</div>
              <div className="col-span-2 text-right">LAST SCAN</div>
            </div>

            {/* Rows */}
            {clientHealth.map((health) => {
              const client = state.clients.find((c) => c.id === health.clientId);
              if (!client) return null;

              return (
                <Link key={health.clientId} href={`/security/${health.clientId}`}>
                  <div className="grid grid-cols-12 gap-4 px-4 py-4 hover-elevate rounded-lg cursor-pointer border-b last:border-0" data-testid={`row-client-${health.clientId}`}>
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted border">
                        <img
                          src={client.logo}
                          alt={client.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">{client.email}</div>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <Badge variant="secondary" className={`gap-1.5 ${getStatusColor(health.status)}`}>
                        {getStatusIcon(health.status)}
                        <span className="capitalize">{health.status === 'attention' ? 'Needs attention' : health.status}</span>
                      </Badge>
                    </div>

                    <div className="col-span-5 flex items-center">
                      <p className="text-sm text-muted-foreground line-clamp-2">{health.recentIssues}</p>
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <span className="text-sm text-muted-foreground">{format(new Date(health.lastScan), 'p')} ago</span>
                      <Button variant="ghost" size="sm" className="text-primary" data-testid={`button-view-health-${health.clientId}`}>
                        View health »
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts & notifications</CardTitle>
          <CardDescription>
            Get an email when any client's account health becomes risky so your team can act before platforms apply restrictions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="font-medium mb-2">Email alerts for risky client health</div>
              <p className="text-sm text-muted-foreground mb-4">
                We'll notify you if we detect aggressive posting, spam patterns or other behaviour that might lead to temporary limits or blocks on any connected client.
              </p>
              <div className="flex items-center gap-2">
                <Switch defaultChecked id="email-alerts" data-testid="switch-email-alerts" />
                <Label htmlFor="email-alerts" className="cursor-pointer">Enable email alerts</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
