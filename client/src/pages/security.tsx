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
import { translations } from '@/lib/translations';

export default function Security() {
  const { state, language } = useApp();
  const { clientHealth } = state;
  const t = translations[language];

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

  const getStatusLabel = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return t.healthy;
      case 'attention':
        return t.needsAttention;
      case 'high-risk':
        return t.highRisk;
      default:
        return status;
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
          <h1 className="text-3xl font-semibold">{t.securityTitle}</h1>
          <p className="text-muted-foreground mt-1">
            {t.securitySubtitle}
          </p>
        </div>
      </div>



      {/* Connected Clients */}
      <Card>
        <CardHeader>
          <CardTitle>{t.connectedClients}</CardTitle>
          <CardDescription>
            {t.connectedClientsDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-muted-foreground border-b">
              <div className="col-span-3">{t.clientHeader}</div>
              <div className="col-span-2">{t.accountHealthHeader}</div>
              <div className="col-span-5">{t.recentIssuesHeader}</div>
              <div className="col-span-2 text-right">{t.lastScanHeader}</div>
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
                        <span className="capitalize">{getStatusLabel(health.status)}</span>
                      </Badge>
                    </div>

                    <div className="col-span-5 flex items-center">
                      <p className="text-sm text-muted-foreground line-clamp-2">{health.recentIssues}</p>
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <span className="text-sm text-muted-foreground">{format(new Date(health.lastScan), 'p')} {t.ago}</span>
                      <Button variant="ghost" size="sm" className="text-primary" data-testid={`button-view-health-${health.clientId}`}>
                        {t.viewHealth} »
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
          <CardTitle>{t.alertsNotifications}</CardTitle>
          <CardDescription>
            {t.alertsNotificationsDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="font-medium mb-2">{t.emailAlertsTitle}</div>
              <p className="text-sm text-muted-foreground mb-4">
                {t.emailAlertsDesc}
              </p>
              <div className="flex items-center gap-2">
                <Switch defaultChecked id="email-alerts" data-testid="switch-email-alerts" />
                <Label htmlFor="email-alerts" className="cursor-pointer">{t.enableEmailAlerts}</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
