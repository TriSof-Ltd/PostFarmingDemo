import { useRoute, Link } from 'wouter';
import { Shield, AlertCircle, Clock, Check, AlertTriangle, XCircle, Filter, ArrowRight } from 'lucide-react';
import { SiFacebook, SiInstagram, SiTiktok } from 'react-icons/si';
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

  const platformIcons = {
    facebook: SiFacebook,
    instagram: SiInstagram,
    tiktok: SiTiktok,
  };

  const getRecommendedActionText = (title: string) => {
    const normalizedTitle = title.toLowerCase();
    if (normalizedTitle.includes('bad actor')) return t.badActorProximityAction;
    if (normalizedTitle.includes('cold ad')) return t.coldAdAccountAction;
    if (normalizedTitle.includes('follower')) return t.followerQualityAction;
    return t.badActorProximityAction; // Fallback
  };

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
    return `${t.highRisk} - ${t.actBeforePosting}`;
  };

  const filteredWarnings = health.warnings
    .filter(w => severityFilter === 'all' || w.severity === severityFilter)
    .filter(w => platformFilter === 'all' || w.platform === platformFilter)
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });



  const criticalRiskCount = health.warnings.filter(w => w.severity === 'critical').length;

  return (
    <div className="space-y-10">
      {/* Overall Health Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Score & Risk */}
            <div className="flex items-center gap-6">
              <div className={`text-6xl font-bold ${getScoreColor(health.overallScore)}`}>
                {health.overallScore}
              </div>
              <div>
                <div className={`text-xl font-bold ${getScoreColor(health.overallScore)} mb-2`}>
                  {getHealthStatus(health.overallScore)}
                </div>
                <div className="flex gap-3">
                  {(['tiktok', 'facebook', 'instagram'] as Platform[]).map(p => {
                    const risk = getPlatformRisk(p);
                    const Icon = platformIcons[p];
                    return (
                      <div key={p} className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${risk.dot}`} />
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="capitalize text-sm font-medium text-muted-foreground">{p}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Summary Stats */}
            <div className="flex flex-col justify-center border-l pl-8 border-border/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t.activeWarnings}</span>
                <span className="font-semibold">{health.warnings.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t.environment} {t.critical}</span>
                <span className={`font-semibold ${criticalRiskCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {criticalRiskCount > 0 ? `${criticalRiskCount} ${t.critical}` : t.noCriticalRisk}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t.lastScanHeader}</span>
                <span className="font-medium">{format(new Date(health.lastScan), 'p')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Active Warnings */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{t.activeWarnings}</h2>
            <p className="text-sm text-muted-foreground">{t.activeWarningsDesc}</p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Platform Filter */}
            <div className="flex items-center bg-muted/50 rounded-lg p-1">
              {(['all', 'tiktok', 'facebook', 'instagram'] as const).map((p) => {
                const Icon = p !== 'all' ? platformIcons[p] : null;
                return (
                  <button
                    key={p}
                    onClick={() => setPlatformFilter(p)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize flex items-center gap-1.5 ${platformFilter === p
                      ? 'bg-black text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {p === 'all' ? t.all : p}
                  </button>
                );
              })}
            </div>

            {/* Severity Filter */}
            <div className="flex items-center bg-muted/50 rounded-lg p-1">
              {(['all', 'critical', 'high', 'medium'] as const).map((s) => {
                const count = s === 'all'
                  ? health.warnings.length
                  : health.warnings.filter(w => w.severity === s).length;

                return (
                  <button
                    key={s}
                    onClick={() => setSeverityFilter(s)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${severityFilter === s
                      ? 'bg-black text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {s === 'all' ? t.all : `${t[s]} (${count})`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredWarnings.map((warning, index) => {
            const styles = getSeverityStyles(warning.severity);
            // Mock linking logic based on index/platform
            const linkedActionId = warning.platform === 'tiktok' ? 1 : warning.platform === 'facebook' ? 2 : 3;
            const warningId = warning.platform === 'tiktok' ? 'warning-tiktok' : warning.platform === 'facebook' ? 'warning-fb' : 'warning-insta';

            return (
              <div
                key={warning.id}
                id={warningId}
                className={`rounded-lg border shadow-sm ${styles.border} ${styles.bg} overflow-hidden transition-all`}
              >
                <div className="p-5">
                  {/* Header Row */}
                  <div className="flex items-center gap-3 mb-3 text-sm">
                    <div className="flex items-center gap-2 font-medium capitalize">
                      {(() => {
                        const Icon = platformIcons[warning.platform];
                        return (
                          <>
                            <Icon className="h-4 w-4" />
                            {warning.platform}
                          </>
                        );
                      })()}
                    </div>
                    <span className="text-muted-foreground/40">|</span>
                    <Badge variant="secondary" className={`${styles.badge} border-0 px-2 py-0.5 h-5 text-[10px] uppercase tracking-wider font-bold`}>
                      {t[warning.severity]}
                    </Badge>
                    <span className="text-muted-foreground/40">|</span>
                    <span className="text-muted-foreground">{format(new Date(warning.timestamp), 'p')}</span>
                    <span className="text-muted-foreground/40">|</span>
                    <span className="text-muted-foreground">{t.environment}</span>

                    {/* Linked Action Note */}
                    <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                      <span>{t.linkedToAction} #{linkedActionId}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="mb-4">
                    <h3 className="font-bold text-base mb-1">{warning.title}</h3>
                    <p className="text-muted-foreground text-sm">{warning.description}</p>
                  </div>

                  {/* Footer: Recommended Action */}
                  <div className="bg-muted/30 -mx-5 -mb-5 px-5 py-3 border-t mt-4 flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded uppercase tracking-wider">
                      {t.recommendedAction}
                    </span>
                    <span className="text-sm text-foreground/90">
                      {getRecommendedActionText(warning.title)}
                    </span>
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
