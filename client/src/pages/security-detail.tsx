import { useRoute, Link } from 'wouter';
import { Shield, AlertCircle, Clock, Check, AlertTriangle, XCircle, Filter } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { SeverityLevel, Platform } from '@/lib/types';
import { translations } from '@/lib/translations';
import { useState } from 'react';

export default function SecurityDetail() {
  const [, params] = useRoute('/security/:id');
  const { state, language } = useApp();
  const t = translations[language];

  const clientId = params?.id;
  const client = state.clients.find((c) => c.id === clientId);
  const health = state.clientHealth.find((h) => h.clientId === clientId);

  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'all'>('all');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');

  if (!client || !health) {
    return <div>Client not found</div>;
  }

  // Helper to get max severity for a platform
  const getPlatformRisk = (platform: Platform) => {
    const platformWarnings = health.warnings.filter(w => w.platform === platform);
    if (platformWarnings.some(w => w.severity === 'critical')) return { label: t.highRisk, color: 'text-red-600', dot: 'bg-red-500' };
    if (platformWarnings.some(w => w.severity === 'high')) return { label: t.needsAttention, color: 'text-orange-600', dot: 'bg-orange-500' };
    if (platformWarnings.some(w => w.severity === 'medium')) return { label: t.needsAttention, color: 'text-yellow-600', dot: 'bg-yellow-500' };
    return { label: t.healthy, color: 'text-green-600', dot: 'bg-green-500' };
  };

  const getSeverityStyles = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical':
        return { border: 'border-l-red-500', badge: 'bg-red-100 text-red-700', bg: 'bg-red-50/30' };
      case 'high':
        return { border: 'border-l-orange-500', badge: 'bg-orange-100 text-orange-700', bg: 'bg-white' };
      case 'medium':
        return { border: 'border-l-yellow-500', badge: 'bg-yellow-100 text-yellow-700', bg: 'bg-white' };
      default:
        return { border: 'border-l-blue-500', badge: 'bg-blue-100 text-blue-700', bg: 'bg-white' };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthStatus = (score: number) => {
    if (score >= 90) return t.healthy;
    if (score >= 70) return t.needsAttention;
    return t.highRisk;
  };

  const filteredWarnings = health.warnings
    .filter(w => severityFilter === 'all' || w.severity === severityFilter)
    .filter(w => platformFilter === 'all' || w.platform === platformFilter)
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

  const recommendedActions = [
    { id: 1, text: t.pauseNewTiktokSpend, link: '#warning-tiktok' },
    { id: 2, text: t.reduceAggressiveCopy, link: '#warning-fb' },
    { id: 3, text: t.slowDownFollowerGrowth, link: '#warning-insta' },
  ];

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">{t.appName}</Link>
        <span>›</span>
        <Link href="/connections" className="hover:text-foreground">{t.connectionsTitle}</Link>
        <span>›</span>
        <span className="text-foreground">{t.securityTitle}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold">{t.securityTitle}</h1>
            <Badge variant="secondary" className="text-sm font-normal">
              {client.name}
            </Badge>
          </div>
        </div>
      </div>

      {/* Overall Health Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
            {/* Left: Score */}
            <div className="flex items-center gap-4 min-w-[200px]">
              <div className={`text-5xl font-bold ${getScoreColor(health.overallScore)}`}>
                {health.overallScore}
              </div>
              <div>
                <div className={`text-lg font-semibold ${getScoreColor(health.overallScore)}`}>
                  {getHealthStatus(health.overallScore)}
                </div>
                <div className="flex gap-3 mt-1 text-xs">
                  {(['tiktok', 'facebook', 'instagram'] as Platform[]).map(p => {
                    const risk = getPlatformRisk(p);
                    return (
                      <div key={p} className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${risk.dot}`} />
                        <span className="capitalize text-muted-foreground">{p}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Middle: Summary */}
            <div className="flex-1 border-l pl-8 border-border/50">
              <div className="font-medium text-lg mb-1">
                {health.warnings.length} {t.activeWarnings} · {health.warnings.filter(w => w.severity === 'critical').length} {t.critical} {t.environment} risk
              </div>
              <p className="text-muted-foreground text-sm">
                {t.mainDrivers}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Actions (Today) */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t.recommendedActionsToday}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {recommendedActions.map((action, index) => (
            <Card key={action.id} className="bg-white border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-snug">{action.text}</p>
                    <a href={action.link} className="text-xs text-muted-foreground hover:text-blue-600 hover:underline block mt-1">
                      {t.whyItMatters} →
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Warnings */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{t.activeWarnings}</h2>

          <div className="flex flex-wrap gap-2">
            {/* Platform Filter */}
            <div className="flex items-center bg-muted/50 rounded-lg p-1">
              {(['all', 'tiktok', 'facebook', 'instagram'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${platformFilter === p
                    ? 'bg-white shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {p === 'all' ? t.all : p}
                </button>
              ))}
            </div>

            {/* Severity Filter */}
            <div className="flex items-center bg-muted/50 rounded-lg p-1">
              {(['all', 'critical', 'high', 'medium'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverityFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${severityFilter === s
                    ? 'bg-white shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {s === 'all' ? t.all : t[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredWarnings.map((warning) => {
            const styles = getSeverityStyles(warning.severity);
            return (
              <div
                key={warning.id}
                className={`rounded-lg border shadow-sm ${styles.border} ${styles.bg} overflow-hidden`}
              >
                <div className="p-5">
                  {/* Header Row */}
                  <div className="flex items-center gap-3 mb-3 text-sm">
                    <div className="flex items-center gap-2 font-medium capitalize">
                      {/* Platform Icon Placeholder - could use actual icons */}
                      {warning.platform}
                    </div>
                    <span className="text-muted-foreground/40">|</span>
                    <Badge variant="secondary" className={`${styles.badge} border-0 px-2 py-0.5 h-5 text-[10px] uppercase tracking-wider font-bold`}>
                      {t[warning.severity]}
                    </Badge>
                    <span className="text-muted-foreground/40">|</span>
                    <span className="text-muted-foreground">{t.environment}</span>
                    <span className="text-muted-foreground ml-auto">{format(new Date(warning.timestamp), 'p')}</span>
                  </div>

                  {/* Body */}
                  <div className="mb-4">
                    <h3 className="font-bold text-base mb-1">{warning.title}</h3>
                    <p className="text-muted-foreground text-sm">{warning.description}</p>
                  </div>

                  {/* Footer: Recommended Action */}
                  <div className="bg-muted/30 -mx-5 -mb-5 px-5 py-3 border-t mt-4">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5 shrink-0">
                        {t.recommendedAction}:
                      </span>
                      <span className="text-sm text-foreground/90">
                        {t.badActorProximityAction} {/* Using generic action for demo, ideally dynamic */}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
