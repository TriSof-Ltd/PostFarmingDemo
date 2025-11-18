import { useState } from 'react';
import { Eye, Heart, MessageCircle, Share2, ChevronRight, RefreshCw, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { SiFacebook, SiInstagram, SiTiktok } from 'react-icons/si';
import { useApp } from '@/lib/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Analytics() {
  const { state, currentClient, refreshAnalytics } = useApp();
  const { analytics } = state;
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();

  if (!currentClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-semibold mb-2">No Client Selected</h2>
        <p className="text-muted-foreground">Please select or add a client to view analytics</p>
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Views',
      value: analytics.totalViews,
      icon: Eye,
      color: 'text-blue-500',
    },
    {
      title: 'Likes',
      value: analytics.totalLikes,
      icon: Heart,
      color: 'text-pink-500',
    },
    {
      title: 'Comments',
      value: analytics.totalComments,
      icon: MessageCircle,
      color: 'text-green-500',
    },
    {
      title: 'Shares',
      value: analytics.totalShares,
      icon: Share2,
      color: 'text-purple-500',
    },
  ];

  const platformData = [
    {
      name: 'Facebook',
      platform: 'facebook',
      icon: SiFacebook,
      color: '#1877F2',
      metrics: analytics.byPlatform.facebook,
    },
    {
      name: 'Instagram',
      platform: 'instagram',
      icon: SiInstagram,
      color: '#E4405F',
      metrics: analytics.byPlatform.instagram,
    },
    {
      name: 'TikTok',
      platform: 'tiktok',
      icon: SiTiktok,
      color: '#000000',
      metrics: analytics.byPlatform.tiktok,
    },
  ];

  const chartData = [
    { name: 'Mon', views: 120, likes: 45, comments: 12 },
    { name: 'Tue', views: 280, likes: 78, comments: 23 },
    { name: 'Wed', views: 190, likes: 52, comments: 18 },
    { name: 'Thu', views: 320, likes: 89, comments: 31 },
    { name: 'Fri', views: 410, likes: 112, comments: 42 },
    { name: 'Sat', views: 380, likes: 98, comments: 38 },
    { name: 'Sun', views: 290, likes: 71, comments: 27 },
  ];

  const handleGenerateReport = () => {
    if (!fromDate || !toDate) {
      return;
    }
    // Open the PDF in a new tab
    window.open('/report.pdf', '_blank');
    setIsReportModalOpen(false);
    // Reset dates
    setFromDate(undefined);
    setToDate(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your social media performance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsReportModalOpen(true)} data-testid="button-generate-report">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button variant="outline" onClick={refreshAnalytics} data-testid="button-refresh">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Generate Report Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="sm:max-w-[500px]" data-testid="modal-generate-report">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>
              Choose the data to generate a report on
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from-date">From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="from-date"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="button-from-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-date">To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="to-date"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="button-to-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsReportModalOpen(false)} data-testid="button-cancel-report">
                Cancel
              </Button>
              <Button
                onClick={handleGenerateReport}
                disabled={!fromDate || !toDate}
                data-testid="button-generate-report-submit"
              >
                Generate Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} data-testid={`card-metric-${metric.title.toLowerCase()}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                <Icon className={`h-5 w-5 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid={`value-${metric.title.toLowerCase()}`}>{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Platform Breakdown */}
      <div className="grid gap-6 md:grid-cols-3">
        {platformData.map((platform) => {
          const Icon = platform.icon;
          const metrics = platform.metrics;

          return (
            <Card key={platform.platform} className="hover-elevate" data-testid={`card-platform-${platform.platform}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: platform.color }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">{platform.name}</CardTitle>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {platform.platform === 'instagram' ? 'Reach' : 'Views'}
                    </div>
                    <div className="text-2xl font-bold" data-testid={`${platform.platform}-views`}>
                      {platform.platform === 'instagram' ? metrics.reach : metrics.views}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Likes</div>
                    <div className="text-2xl font-bold" data-testid={`${platform.platform}-likes`}>{metrics.likes}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Comments</div>
                    <div className="text-2xl font-bold" data-testid={`${platform.platform}-comments`}>{metrics.comments}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Shares</div>
                    <div className="text-2xl font-bold" data-testid={`${platform.platform}-shares`}>{metrics.shares}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="likes" stroke="#ec4899" strokeWidth={2} />
                <Line type="monotone" dataKey="comments" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Facebook', views: analytics.byPlatform.facebook.views, likes: analytics.byPlatform.facebook.likes },
                  { name: 'Instagram', views: analytics.byPlatform.instagram.reach || analytics.byPlatform.instagram.views, likes: analytics.byPlatform.instagram.likes },
                  { name: 'TikTok', views: analytics.byPlatform.tiktok.views, likes: analytics.byPlatform.tiktok.likes },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="views" fill="#3b82f6" />
                <Bar dataKey="likes" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
