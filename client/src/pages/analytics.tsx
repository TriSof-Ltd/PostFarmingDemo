import { Eye, Heart, MessageCircle, Share2, ChevronRight, RefreshCw } from 'lucide-react';
import { SiFacebook, SiInstagram, SiTiktok } from 'react-icons/si';
import { useApp } from '@/lib/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Analytics() {
  const { state, currentClient, refreshAnalytics } = useApp();
  const { analytics } = state;

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your social media performance</p>
        </div>
        <Button variant="outline" onClick={refreshAnalytics} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

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
