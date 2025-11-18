import { useRoute } from 'wouter';
import { Shield, AlertCircle, Clock } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { SeverityLevel } from '@/lib/types';
import { Link } from 'wouter';

export default function SecurityDetail() {
  const [, params] = useRoute('/security/:id');
  const { state } = useApp();
  
  const clientId = params?.id;
  const client = state.clients.find((c) => c.id === clientId);
  const health = state.clientHealth.find((h) => h.clientId === clientId);
  const events = state.securityEvents.filter((e) => e.clientId === clientId);

  if (!client || !health) {
    return <div>Client not found</div>;
  }

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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthStatus = (score: number) => {
    if (score >= 90) return 'Healthy';
    if (score >= 70) return 'Attention needed';
    return 'At risk';
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>›</span>
        <Link href="/connections" className="hover:text-foreground">Connections</Link>
        <span>›</span>
        <span className="text-foreground">Security & Account Health</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold">Account Health Dashboard</h1>
            <Badge variant="secondary" className={`${getSeverityColor(health.warnings.length > 0 ? health.warnings[0].severity : 'low')}`}>
              {client.name} · {health.status === 'attention' ? 'At risk' : health.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Snapshot of violations, warnings and risky behaviour across all connected platforms for this client.
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Last scan</div>
          <div className="text-lg font-semibold">{format(new Date(health.lastScan), 'p')} ago</div>
        </div>
      </div>

      {/* Overall Health */}
      <Card>
        <CardHeader>
          <CardTitle>Overall health</CardTitle>
          <CardDescription>
            Blended risk score for {client.name}'s social accounts (last 30 days).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`text-6xl font-bold ${getScoreColor(health.overallScore)}`}>
                  {health.overallScore}
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <div className={`text-lg font-semibold ${getScoreColor(health.overallScore)}`}>
                  {getHealthStatus(health.overallScore)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {health.warnings.length} active warnings · {events.filter(e => e.severity === 'critical').length} critical environment risk.
                </div>
              </div>
            </div>

            <div className="flex-1 flex gap-4">
              {health.warnings.slice(0, 3).map((warning) => (
                <Badge key={warning.id} variant="secondary" className="whitespace-nowrap">
                  {warning.platform}: {warning.title}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Warnings */}
      <Card>
        <CardHeader>
          <CardTitle>Active warnings ({health.warnings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {health.warnings.map((warning) => (
              <div
                key={warning.id}
                className={`p-4 rounded-lg border-l-4 ${
                  warning.severity === 'critical'
                    ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
                    : warning.severity === 'high'
                    ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10'
                    : 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                }`}
                data-testid={`warning-${warning.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold capitalize">{warning.platform}</span>
                    <span className="text-muted-foreground">·</span>
                    <Badge variant="secondary" className={getSeverityColor(warning.severity)}>
                      {warning.severity}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{warning.category}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{format(new Date(warning.timestamp), 'p')} ago</span>
                </div>
                <div className="font-medium mb-1">{warning.title}</div>
                <div className="text-sm text-muted-foreground">{warning.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent events</CardTitle>
          <CardDescription>Key checks and platform responses for this client.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-muted-foreground border-b">
              <div className="col-span-2">Time</div>
              <div className="col-span-2">Platform</div>
              <div className="col-span-2">Severity</div>
              <div className="col-span-4">Event</div>
              <div className="col-span-2">Rule / source</div>
            </div>

            {/* Rows */}
            {events.map((event) => (
              <div key={event.id} className="grid grid-cols-12 gap-4 px-4 py-3 border-b last:border-0" data-testid={`event-${event.id}`}>
                <div className="col-span-2 text-sm">{format(new Date(event.timestamp), 'MMM d · HH:mm')}</div>
                <div className="col-span-2 text-sm capitalize">{event.platform}</div>
                <div className="col-span-2">
                  <Badge variant="secondary" className={getSeverityColor(event.severity)}>
                    {event.severity}
                  </Badge>
                </div>
                <div className="col-span-4 text-sm">{event.description}</div>
                <div className="col-span-2 text-sm text-muted-foreground font-mono text-xs">{event.rule}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
