import { useState, useMemo, useEffect } from 'react';
import { Eye, Heart, MessageCircle, Share2, RefreshCw, FileText, Calendar as CalendarIcon, TrendingUp, TrendingDown, Sparkles, Filter, Copy, ArrowRight, ChevronRight } from 'lucide-react';
import { SiFacebook, SiInstagram, SiTiktok } from 'react-icons/si';
import { useApp } from '@/lib/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format, subDays, startOfDay, endOfDay, differenceInDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

type DateRange = 'today' | '7days' | '30days' | 'custom';
type Language = 'en' | 'ku' | 'ar';
type ContentType = 'all' | 'posts' | 'stories' | 'reels' | 'ads' | 'videos';
type MetricType = 'reach' | 'likes' | 'comments' | 'shares' | 'impressions' | 'views' | 'saves';
type PlatformFilter = 'all' | 'instagram' | 'facebook' | 'tiktok';

const translations: Record<Language, Record<string, string>> = {
  en: {
    analytics: 'Analytics',
    trackPerformance: 'Track your social media performance',
    generateReport: 'Generate Report',
    generateAllReport: 'Generate All Report',
    generateInstagramReport: 'Generate Instagram Report',
    generateFacebookReport: 'Generate Facebook Report',
    generateTiktokReport: 'Generate TikTok Report',
    refresh: 'Refresh',
    export: 'Export',
    downloadPDF: 'Download PDF report',
    shareLink: 'Share link with client',
    views: 'Views',
    reach: 'Reach',
    likes: 'Likes',
    comments: 'Comments',
    shares: 'Shares',
    total: 'Total',
    today: 'Today',
    last7Days: '7 days',
    last30Days: '30 days',
    custom: 'Custom',
    vsLastWeek: 'vs last week',
    vsLastMonth: 'vs last month',
    engagementOverTime: 'Engagement Over Time',
    platformComparison: 'Platform Comparison',
    aiInsights: 'AI Insights',
    basicOverallStatistics: 'Basic Overall Statistics',
    basicStatistics: 'Basic Statistics',
    viewStats: 'View stats & generate report',
    viewDetails: 'View details',
    all: 'All',
    dateRange: 'Date range',
    contentType: 'Content type',
    performanceOverview: 'Performance Overview',
    performanceOverviewSubtitle: 'Across selected platforms & date range',
    copyInsight: 'Copy insight',
    addToReport: 'Add to report',
    posts: 'Posts',
    stories: 'Stories',
    reels: 'Reels',
    ads: 'Ads',
    videos: 'Videos',
    impressions: 'Impressions',
    saves: 'Saves',
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
  },
  ku: {
    analytics: 'شیکردنەوە',
    trackPerformance: 'شیکردنەوەی کارکردنی میدیای کۆمەڵایەتی',
    generateReport: 'دروستکردنی راپۆرت',
    generateAllReport: 'دروستکردنی راپۆرتی هەموو',
    generateInstagramReport: 'دروستکردنی راپۆرتی ئینستاگرام',
    generateFacebookReport: 'دروستکردنی راپۆرتی فەیسبووک',
    generateTiktokReport: 'دروستکردنی راپۆرتی تیکتۆک',
    refresh: 'نوێکردنەوە',
    export: 'دەرهێنان',
    downloadPDF: 'داگرتنی راپۆرتی PDF',
    shareLink: 'هاوبەشکردنی لینک لەگەڵ کڕیار',
    views: 'بینین',
    reach: 'گەیشتن',
    likes: 'پێدەوەستن',
    comments: 'کۆمێنت',
    shares: 'هاوبەشکردن',
    total: 'کۆی گشتی',
    today: 'ئەمڕۆ',
    last7Days: '٧ ڕۆژ',
    last30Days: '٣٠ ڕۆژ',
    custom: 'تایبەت',
    vsLastWeek: 'بەراورد لەگەڵ هەفتەی پێشوو',
    vsLastMonth: 'بەراورد لەگەڵ مانگی پێشوو',
    engagementOverTime: 'بەشداری بە درێژایی کات',
    platformComparison: 'بەراوردی پلاتفۆرم',
    aiInsights: 'بینینی AI',
    basicOverallStatistics: 'ئامارە بنەڕەتییەکانی گشتی',
    basicStatistics: 'ئامارە بنەڕەتییەکان',
    viewStats: 'بینینی ئامار و دروستکردنی راپۆرت',
    viewDetails: 'بینینی وردەکارییەکان',
    all: 'هەموو',
    dateRange: 'ماوەی بڕیار',
    contentType: 'جۆری ناوەڕۆک',
    performanceOverview: 'نیشاندانی کارکردن',
    performanceOverviewSubtitle: 'لە پلاتفۆرم و ماوەی بڕیار هەڵبژێردراو',
    copyInsight: 'لەبەرگرتنەوەی بینین',
    addToReport: 'زیادکردن بۆ راپۆرت',
    posts: 'پۆست',
    stories: 'چیرۆک',
    reels: 'ریڵ',
    ads: 'ریکلام',
    videos: 'ڤیدیۆ',
    impressions: 'بەرچاوکەوتن',
    saves: 'پاشەکەوت',
    facebook: 'فەیسبووک',
    instagram: 'ئینستاگرام',
    tiktok: 'تیکتۆک',
  },
  ar: {
    analytics: 'التحليلات',
    trackPerformance: 'تتبع أداء وسائل التواصل الاجتماعي',
    generateReport: 'إنشاء تقرير',
    generateAllReport: 'إنشاء تقرير شامل',
    generateInstagramReport: 'إنشاء تقرير إنستغرام',
    generateFacebookReport: 'إنشاء تقرير فيسبوك',
    generateTiktokReport: 'إنشاء تقرير تيك توك',
    refresh: 'تحديث',
    export: 'تصدير',
    downloadPDF: 'تحميل تقرير PDF',
    shareLink: 'مشاركة رابط مع العميل',
    views: 'المشاهدات',
    reach: 'الوصول',
    likes: 'الإعجابات',
    comments: 'التعليقات',
    shares: 'المشاركات',
    total: 'المجموع',
    today: 'اليوم',
    last7Days: '٧ أيام',
    last30Days: '٣٠ يوم',
    custom: 'مخصص',
    vsLastWeek: 'مقارنة بالأسبوع الماضي',
    vsLastMonth: 'مقارنة بالشهر الماضي',
    engagementOverTime: 'التفاعل بمرور الوقت',
    platformComparison: 'مقارنة المنصات',
    aiInsights: 'رؤى الذكاء الاصطناعي',
    basicOverallStatistics: 'الإحصائيات الأساسية الشاملة',
    basicStatistics: 'الإحصائيات الأساسية',
    viewStats: 'عرض الإحصائيات وإنشاء تقرير',
    viewDetails: 'عرض التفاصيل',
    all: 'الكل',
    dateRange: 'نطاق التاريخ',
    contentType: 'نوع المحتوى',
    performanceOverview: 'نظرة عامة على الأداء',
    performanceOverviewSubtitle: 'عبر المنصات ونطاق التاريخ المحدد',
    copyInsight: 'نسخ الرؤية',
    addToReport: 'إضافة إلى التقرير',
    posts: 'المنشورات',
    stories: 'القصص',
    reels: 'الريلز',
    ads: 'الإعلانات',
    videos: 'الفيديوهات',
    impressions: 'الانطباعات',
    saves: 'الحفظ',
    facebook: 'فيسبوك',
    instagram: 'إنستغرام',
    tiktok: 'تيك توك',
  },
};

// Content type multipliers (used for calculations)
const contentTypeMultipliers: Record<ContentType, number> = {
  all: 1,
  posts: 0.6,
  stories: 0.3,
  reels: 0.8,
  ads: 0.5,
  videos: 0.7, // TikTok videos
};

// Platform capabilities - which content types each platform supports
const platformCapabilities: Record<PlatformFilter, ContentType[]> = {
  all: ['all', 'posts', 'stories', 'reels', 'ads', 'videos'],
  instagram: ['all', 'posts', 'stories', 'reels', 'ads'], // Instagram: Posts, Stories, Reels, Ads
  facebook: ['all', 'posts', 'stories', 'reels', 'ads'], // Facebook: Posts, Stories, Reels, Ads
  tiktok: ['all', 'videos', 'reels', 'ads'], // TikTok: Videos (main content), Reels, Ads (no Stories, no Posts)
};

// Platform-specific metric terminology
const getPlatformMetrics = (platform: PlatformFilter) => {
  if (platform === 'instagram') {
    return {
      views: 'Impressions',
      reach: 'Reach',
      likes: 'Likes',
      comments: 'Comments',
      shares: 'Saves', // Instagram uses "Saves" instead of "Shares"
    };
  }
  if (platform === 'facebook') {
    return {
      views: 'Impressions',
      reach: 'Reach',
      likes: 'Likes',
      comments: 'Comments',
      shares: 'Shares',
    };
  }
  if (platform === 'tiktok') {
    return {
      views: 'Views',
      reach: 'Reach',
      likes: 'Likes',
      comments: 'Comments',
      shares: 'Shares',
    };
  }
  // All platforms - use generic terms
  return {
    views: 'Views',
    reach: 'Reach',
    likes: 'Likes',
    comments: 'Comments',
    shares: 'Shares',
  };
};

// Generate dynamic dummy data based on filters
const generateDummyData = (
  dateRange: DateRange,
  contentType: ContentType,
  platformFilter: PlatformFilter,
  fromDate?: Date,
  toDate?: Date
) => {
  // Base multipliers for different date ranges
  const dateMultipliers: Record<DateRange, number> = {
    today: 0.15,
    '7days': 1,
    '30days': 4.2,
    custom: fromDate && toDate ? differenceInDays(toDate, fromDate) / 7 : 1,
  };

  const multiplier = dateMultipliers[dateRange] * contentTypeMultipliers[contentType];

  // Generate platform-specific data with some variation
  const baseFacebook = {
    views: Math.round(51 * multiplier),
    likes: Math.round(1 * multiplier),
    comments: Math.round(0 * multiplier),
    shares: Math.round(0 * multiplier),
  };

  const baseInstagram = {
    views: Math.round(519 * multiplier),
    reach: Math.round(570 * multiplier),
    likes: Math.round(8 * multiplier),
    comments: Math.round(0 * multiplier),
    shares: Math.round(0 * multiplier),
  };

  const baseTiktok = {
    views: Math.round(0 * multiplier),
    likes: Math.round(0 * multiplier),
    comments: Math.round(0 * multiplier),
    shares: Math.round(0 * multiplier),
  };

  // Add some randomness for demo
  const addRandomness = (value: number, variance: number = 0.1) => {
    return Math.max(0, Math.round(value * (1 + (Math.random() - 0.5) * variance)));
  };

  // Filter by platform
  if (platformFilter === 'facebook') {
    return {
      totalViews: addRandomness(baseFacebook.views),
      totalLikes: addRandomness(baseFacebook.likes),
      totalComments: addRandomness(baseFacebook.comments),
      totalShares: addRandomness(baseFacebook.shares),
      byPlatform: {
        facebook: {
          views: addRandomness(baseFacebook.views),
          likes: addRandomness(baseFacebook.likes),
          comments: addRandomness(baseFacebook.comments),
          shares: addRandomness(baseFacebook.shares),
        },
        instagram: { views: 0, reach: 0, likes: 0, comments: 0, shares: 0 },
        tiktok: { views: 0, likes: 0, comments: 0, shares: 0 },
      },
    };
  }

  if (platformFilter === 'instagram') {
    return {
      totalViews: addRandomness(baseInstagram.views),
      totalLikes: addRandomness(baseInstagram.likes),
      totalComments: addRandomness(baseInstagram.comments),
      totalShares: addRandomness(baseInstagram.shares),
      byPlatform: {
        facebook: { views: 0, likes: 0, comments: 0, shares: 0 },
        instagram: {
          views: addRandomness(baseInstagram.views),
          reach: addRandomness(baseInstagram.reach),
          likes: addRandomness(baseInstagram.likes),
          comments: addRandomness(baseInstagram.comments),
          shares: addRandomness(baseInstagram.shares),
        },
        tiktok: { views: 0, likes: 0, comments: 0, shares: 0 },
      },
    };
  }

  if (platformFilter === 'tiktok') {
    return {
      totalViews: addRandomness(baseTiktok.views),
      totalLikes: addRandomness(baseTiktok.likes),
      totalComments: addRandomness(baseTiktok.comments),
      totalShares: addRandomness(baseTiktok.shares),
      byPlatform: {
        facebook: { views: 0, likes: 0, comments: 0, shares: 0 },
        instagram: { views: 0, reach: 0, likes: 0, comments: 0, shares: 0 },
        tiktok: {
          views: addRandomness(baseTiktok.views),
          likes: addRandomness(baseTiktok.likes),
          comments: addRandomness(baseTiktok.comments),
          shares: addRandomness(baseTiktok.shares),
        },
      },
    };
  }

  // All platforms
  return {
    totalViews: addRandomness(baseFacebook.views + baseInstagram.views + baseTiktok.views),
    totalLikes: addRandomness(baseFacebook.likes + baseInstagram.likes + baseTiktok.likes),
    totalComments: addRandomness(baseFacebook.comments + baseInstagram.comments + baseTiktok.comments),
    totalShares: addRandomness(baseFacebook.shares + baseInstagram.shares + baseTiktok.shares),
    byPlatform: {
      facebook: {
        views: addRandomness(baseFacebook.views),
        likes: addRandomness(baseFacebook.likes),
        comments: addRandomness(baseFacebook.comments),
        shares: addRandomness(baseFacebook.shares),
      },
      instagram: {
        views: addRandomness(baseInstagram.views),
        reach: addRandomness(baseInstagram.reach),
        likes: addRandomness(baseInstagram.likes),
        comments: addRandomness(baseInstagram.comments),
        shares: addRandomness(baseInstagram.shares),
      },
      tiktok: {
        views: addRandomness(baseTiktok.views),
        likes: addRandomness(baseTiktok.likes),
        comments: addRandomness(baseTiktok.comments),
        shares: addRandomness(baseTiktok.shares),
      },
    },
  };
};

export default function Analytics() {
  const { state, currentClient, refreshAnalytics, language } = useApp();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [dateRange, setDateRange] = useState<DateRange>('7days');
  const [contentType, setContentType] = useState<ContentType>('all');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('reach');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [chartMetrics, setChartMetrics] = useState({
    views: true,
    reach: true,
    likes: true,
    comments: true,
  });

  const t = translations[language];

  // Generate dynamic analytics data based on filters
  const analytics = useMemo(() => {
    return generateDummyData(dateRange, contentType, platformFilter, fromDate, toDate);
  }, [dateRange, contentType, platformFilter, fromDate, toDate]);

  if (!currentClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-semibold mb-2">No Client Selected</h2>
        <p className="text-muted-foreground">Please select or add a client to view analytics</p>
      </div>
    );
  }

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now), label: t.today };
      case '7days':
        return { start: startOfDay(subDays(now, 7)), end: endOfDay(now), label: t.last7Days };
      case '30days':
        return { start: startOfDay(subDays(now, 30)), end: endOfDay(now), label: t.last30Days };
      default:
        return { start: fromDate || startOfDay(subDays(now, 7)), end: toDate || endOfDay(now), label: t.custom };
    }
  };

  const dateRangeInfo = getDateRange();

  // Calculate previous period data for comparison
  const getPreviousPeriodData = useMemo(() => {
    const prevDateRange = dateRange === 'today' ? '7days' : dateRange === '7days' ? '30days' : '30days';
    return generateDummyData(prevDateRange, contentType, platformFilter, fromDate, toDate);
  }, [dateRange, contentType, platformFilter, fromDate, toDate]);

  const getPreviousPeriodChange = (current: number, previous: number) => {
    if (previous === 0) {
      return { change: current > 0 ? 100 : 0, isPositive: current > 0, previousValue: 0 };
    }
    const change = Math.round(((current - previous) / previous) * 100);
    const isPositive = change >= 0;
    return { change: Math.abs(change), isPositive, previousValue: previous };
  };

  // Calculate totals
  const totalReach = analytics.byPlatform.facebook.views + 
    (analytics.byPlatform.instagram.reach || analytics.byPlatform.instagram.views) + 
    analytics.byPlatform.tiktok.views;
  
  const prevTotalReach = getPreviousPeriodData.byPlatform.facebook.views + 
    (getPreviousPeriodData.byPlatform.instagram.reach || getPreviousPeriodData.byPlatform.instagram.views) + 
    getPreviousPeriodData.byPlatform.tiktok.views;

  const totalEngagement = analytics.totalLikes + analytics.totalComments + analytics.totalShares;
  const totalPosts = Math.max(1, Math.round(12 * (dateRange === 'today' ? 0.1 : dateRange === '7days' ? 1 : dateRange === '30days' ? 4 : 1) * contentTypeMultipliers[contentType]));
  const avgEngagementRate = totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(1) : '0';

  // Get platform-specific metric labels
  const platformMetrics = getPlatformMetrics(platformFilter);

  const metricCards = [
    {
      title: platformFilter === 'all' ? t.views : platformMetrics.views,
      value: analytics.totalViews,
      icon: Eye,
      color: 'text-blue-500',
      change: getPreviousPeriodChange(analytics.totalViews, getPreviousPeriodData.totalViews),
    },
    {
      title: platformMetrics.reach,
      value: totalReach,
      icon: Eye,
      color: 'text-indigo-500',
      change: getPreviousPeriodChange(totalReach, prevTotalReach),
    },
    {
      title: platformMetrics.likes,
      value: analytics.totalLikes,
      icon: Heart,
      color: 'text-pink-500',
      change: getPreviousPeriodChange(analytics.totalLikes, getPreviousPeriodData.totalLikes),
    },
    {
      title: platformMetrics.comments,
      value: analytics.totalComments,
      icon: MessageCircle,
      color: 'text-green-500',
      change: getPreviousPeriodChange(analytics.totalComments, getPreviousPeriodData.totalComments),
    },
    {
      title: platformMetrics.shares,
      value: analytics.totalShares,
      icon: Share2,
      color: 'text-purple-500',
      change: getPreviousPeriodChange(analytics.totalShares, getPreviousPeriodData.totalShares),
    },
  ];

  // Generate chart data based on date range and platform filter
  const chartData = useMemo(() => {
    const days = dateRange === 'today' ? 1 : dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : (fromDate && toDate ? differenceInDays(toDate, fromDate) : 7);
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const multiplier = contentTypeMultipliers[contentType];
    
    // Adjust base values based on platform filter
    let baseMultiplier = 1;
    if (platformFilter === 'instagram') baseMultiplier = 10;
    else if (platformFilter === 'facebook') baseMultiplier = 1;
    else if (platformFilter === 'tiktok') baseMultiplier = 0.5;
    
    return Array.from({ length: Math.min(days, 7) }, (_, i) => {
      const baseViews = (50 + Math.random() * 100) * multiplier * baseMultiplier;
      const baseReach = baseViews * 1.2;
      const baseLikes = baseViews * 0.15;
      const baseComments = baseViews * 0.05;
      
      return {
        name: dayNames[i % 7],
        views: Math.round(baseViews),
        reach: Math.round(baseReach),
        likes: Math.round(baseLikes),
        comments: Math.round(baseComments),
      };
    });
  }, [dateRange, contentType, fromDate, toDate, platformFilter]);

  const handleGenerateReport = () => {
    if (!fromDate || !toDate) {
      return;
    }
    window.open('/report.pdf', '_blank');
    setIsReportModalOpen(false);
    setFromDate(undefined);
    setToDate(undefined);
  };

  const generateReport = (platform: PlatformFilter) => {
    // Stub function for report generation - can be connected to backend later
    console.log(`Generating report for: ${platform}`);
    // For demo, just open the PDF
    window.open('/report.pdf', '_blank');
  };

  const toggleChartMetric = (metric: keyof typeof chartMetrics) => {
    setChartMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    if (range !== 'custom') {
      setFromDate(undefined);
      setToDate(undefined);
    }
  };

  const getComparisonLabel = () => {
    if (dateRange === 'today') return t.vsLastWeek;
    if (dateRange === '7days') return t.vsLastWeek;
    return t.vsLastMonth;
  };

  // Get available content types for current platform
  const availableContentTypes = platformCapabilities[platformFilter];

  // Reset content type if current selection is not available for the platform
  useEffect(() => {
    if (!availableContentTypes.includes(contentType)) {
      setContentType('all');
    }
  }, [platformFilter, availableContentTypes, contentType]);

  // Platform filter cards data
  const platformFilterCards = [
    {
      id: 'all' as PlatformFilter,
      name: t.all,
      icon: null,
      color: '#6366f1',
      generateReportLabel: t.generateAllReport,
    },
    {
      id: 'instagram' as PlatformFilter,
      name: t.instagram,
      icon: SiInstagram,
      color: '#E4405F',
      generateReportLabel: t.generateInstagramReport,
    },
    {
      id: 'facebook' as PlatformFilter,
      name: t.facebook,
      icon: SiFacebook,
      color: '#1877F2',
      generateReportLabel: t.generateFacebookReport,
    },
    {
      id: 'tiktok' as PlatformFilter,
      name: t.tiktok,
      icon: SiTiktok,
      color: '#000000',
      generateReportLabel: t.generateTiktokReport,
    },
  ];

  // Get statistics title based on platform filter
  const getStatisticsTitle = () => {
    if (platformFilter === 'all') {
      return t.basicOverallStatistics;
    }
    return `${t.basicStatistics} – ${platformFilterCards.find(p => p.id === platformFilter)?.name}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentClient && (
            <Avatar className="h-12 w-12">
              <AvatarImage src={currentClient.logo} alt={currentClient.name} />
              <AvatarFallback>{currentClient.name[0]}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <h1 className="text-3xl font-semibold">{t.analytics}</h1>
            <p className="text-muted-foreground mt-1">{t.trackPerformance}</p>
          </div>
        </div>
        <div className="flex gap-3">
        <Button variant="outline" onClick={refreshAnalytics} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
            {t.refresh}
        </Button>
        </div>
      </div>

      {/* Platform Filter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platformFilterCards.map((platformCard) => {
          const Icon = platformCard.icon;
          const isActive = platformFilter === platformCard.id;
          const isAll = platformCard.id === 'all';
          
          // Get micro-metric for platform cards
          const getMicroMetric = () => {
            if (platformCard.id === 'all') return null;
            const platformData = analytics.byPlatform[platformCard.id as 'facebook' | 'instagram' | 'tiktok'];
            const metric = platformCard.id === 'instagram' 
              ? (platformData.reach || platformData.views)
              : platformData.views;
            return metric.toLocaleString();
          };
          
          return (
            <Card
              key={platformCard.id}
              className={`cursor-pointer transition-all ${
                isActive
                  ? 'ring-2 ring-primary bg-primary/10 border-primary shadow-md'
                  : 'hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5'
              }`}
              onClick={() => setPlatformFilter(platformCard.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {Icon ? (
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: platformCard.color }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: platformCard.color }}
                      >
                        <span className="text-white font-bold text-sm">ALL</span>
                      </div>
                    )}
                    <CardTitle className="text-lg">{platformCard.name}</CardTitle>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{t.viewStats}</p>
              </CardHeader>
              <CardContent className="pt-0">
                {isAll ? (
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={(e) => {
                      e.stopPropagation();
                      generateReport(platformCard.id);
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {platformCard.generateReportLabel}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        generateReport(platformCard.id);
                      }}
                    >
                      <FileText className="mr-2 h-3 w-3" />
                      {platformCard.generateReportLabel}
                    </Button>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span>Top this period:</span>
                      <span className="font-semibold">{getMicroMetric()} {platformCard.id === 'instagram' ? t.reach : t.views}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters Group */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Date Range Filter */}
        <Card className="p-4">
          <Label className="text-xs font-medium text-muted-foreground mb-3 block">{t.dateRange}</Label>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={dateRange === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDateRangeChange('today')}
            >
              {t.today}
            </Button>
            <Button
              variant={dateRange === '7days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDateRangeChange('7days')}
            >
              {t.last7Days}
            </Button>
            <Button
              variant={dateRange === '30days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDateRangeChange('30days')}
            >
              {t.last30Days}
            </Button>
            <Button
              variant={dateRange === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDateRangeChange('custom')}
            >
              {t.custom}
            </Button>
            {dateRange === 'custom' && (
              <div className="flex items-center gap-2 ml-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-[120px] justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, 'MMM d') : 'From'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-[120px] justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, 'MMM d') : 'To'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {format(dateRangeInfo.start, 'MMM d')} - {format(dateRangeInfo.end, 'MMM d, yyyy')}
          </div>
        </Card>

        {/* Content Type Filter */}
        <Card className="p-4">
          <Label className="text-xs font-medium text-muted-foreground mb-3 block">{t.contentType}</Label>
          <div className="flex items-center gap-2 flex-wrap">
            {availableContentTypes.map((type) => {
              // Map 'videos' to appropriate label for TikTok
              const label = type === 'videos' && platformFilter === 'tiktok' 
                ? 'Videos' 
                : t[type as keyof typeof t];
          return (
                <Button
                  key={type}
                  variant={contentType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setContentType(type)}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Generate Report Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t.generateReport}</DialogTitle>
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
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus />
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
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus />
                  </PopoverContent>
                </Popover>
                  </div>
                </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateReport} disabled={!fromDate || !toDate}>
                Generate Report
              </Button>
                    </div>
                  </div>
        </DialogContent>
      </Dialog>

      {/* Main Statistics Section */}
      <div className="space-y-6">
                  <div>
          <h2 className="text-2xl font-semibold mb-2">{getStatisticsTitle()}</h2>
                  </div>

        {/* Metric Cards with Change Indicators */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {metricCards.map((metric) => {
            const Icon = metric.icon;
            const { change, isPositive } = metric.change;
            return (
              <Card key={metric.title} className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent className="pt-2 pb-4">
                  <div className="text-2xl font-bold mb-1">{metric.value.toLocaleString()}</div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{isPositive ? '↑' : '↓'}</span>
                    <span>{Math.abs(change)}% {getComparisonLabel()}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      </div>

      {/* Performance Overview Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{t.performanceOverview}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t.performanceOverviewSubtitle}</p>
        </div>

        {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t.engagementOverTime}</CardTitle>
                <div className="flex gap-1">
                  <Toggle pressed={chartMetrics.views} onPressedChange={() => toggleChartMetric('views')} size="sm" className="text-xs px-2">
                    {platformFilter === 'all' ? t.views : platformMetrics.views}
                  </Toggle>
                  <Toggle pressed={chartMetrics.reach} onPressedChange={() => toggleChartMetric('reach')} size="sm" className="text-xs px-2">
                    {platformMetrics.reach}
                  </Toggle>
                  <Toggle pressed={chartMetrics.likes} onPressedChange={() => toggleChartMetric('likes')} size="sm" className="text-xs px-2">
                    {platformMetrics.likes}
                  </Toggle>
                  <Toggle pressed={chartMetrics.comments} onPressedChange={() => toggleChartMetric('comments')} size="sm" className="text-xs px-2">
                    {platformMetrics.comments}
                  </Toggle>
                </div>
              </div>
          </CardHeader>
          <CardContent>
              <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
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
                    {chartMetrics.views && (
                      <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} name={platformFilter === 'all' ? t.views : platformMetrics.views} />
                    )}
                    {chartMetrics.reach && (
                      <Line type="monotone" dataKey="reach" stroke="#8b5cf6" strokeWidth={2} name={platformMetrics.reach} />
                    )}
                    {chartMetrics.likes && (
                      <Line type="monotone" dataKey="likes" stroke="#ec4899" strokeWidth={2} name={platformMetrics.likes} />
                    )}
                    {chartMetrics.comments && (
                      <Line type="monotone" dataKey="comments" stroke="#10b981" strokeWidth={2} name={platformMetrics.comments} />
                    )}
                    <Legend />
              </LineChart>
            </ResponsiveContainer>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t.platformComparison}</CardTitle>
                <Select value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as MetricType)}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reach">{platformMetrics.reach}</SelectItem>
                    <SelectItem value="likes">{platformMetrics.likes}</SelectItem>
                    <SelectItem value="comments">{platformMetrics.comments}</SelectItem>
                    <SelectItem value="shares">{platformMetrics.shares}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
          </CardHeader>
          <CardContent>
              <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
              <BarChart
                    data={
                      platformFilter === 'all'
                        ? [
                            {
                              name: t.facebook,
                              reach: analytics.byPlatform.facebook.views,
                              likes: analytics.byPlatform.facebook.likes,
                              comments: analytics.byPlatform.facebook.comments,
                              shares: analytics.byPlatform.facebook.shares,
                            },
                            {
                              name: t.instagram,
                              reach: analytics.byPlatform.instagram.reach || analytics.byPlatform.instagram.views,
                              likes: analytics.byPlatform.instagram.likes,
                              comments: analytics.byPlatform.instagram.comments,
                              shares: analytics.byPlatform.instagram.shares,
                            },
                            {
                              name: t.tiktok,
                              reach: analytics.byPlatform.tiktok.views,
                              likes: analytics.byPlatform.tiktok.likes,
                              comments: analytics.byPlatform.tiktok.comments,
                              shares: analytics.byPlatform.tiktok.shares,
                            },
                          ]
                        : [
                            {
                              name: platformFilterCards.find(p => p.id === platformFilter)?.name || '',
                              reach: platformFilter === 'instagram' 
                                ? (analytics.byPlatform.instagram.reach || analytics.byPlatform.instagram.views)
                                : analytics.byPlatform[platformFilter as 'facebook' | 'tiktok'].views,
                              likes: analytics.byPlatform[platformFilter as 'facebook' | 'instagram' | 'tiktok'].likes,
                              comments: analytics.byPlatform[platformFilter as 'facebook' | 'instagram' | 'tiktok'].comments,
                              shares: analytics.byPlatform[platformFilter as 'facebook' | 'instagram' | 'tiktok'].shares,
                            },
                          ]
                    }
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
                    <Bar dataKey={selectedMetric} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Box */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧠</span>
                <CardTitle className="text-lg">{t.aiInsights}</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const insightText = platformFilter === 'all' 
                      ? `This week: ${t.instagram} drove 87% of engagement. Best performing day: Friday. Suggested: post more Reels on Thu–Fri 18:00–21:00.`
                      : `Best performing day: Friday. Suggested: post more ${platformFilter === 'tiktok' ? 'videos' : 'Reels'} on Thu–Fri 18:00–21:00.`;
                    navigator.clipboard.writeText(insightText);
                  }}
                >
                  <Copy className="mr-1 h-3 w-3" />
                  {t.copyInsight}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  {t.addToReport}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {platformFilter === 'all' ? (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>This week: <strong>{t.instagram}</strong> drove <strong>87%</strong> of engagement.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Best performing day: <strong>Friday</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Suggested: post more <strong>Reels</strong> on <strong>Thu–Fri 18:00–21:00</strong>.</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Best performing day: <strong>Friday</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Suggested: post more <strong>{platformFilter === 'tiktok' ? 'videos' : 'Reels'}</strong> on <strong>Thu–Fri 18:00–21:00</strong>.</span>
                  </li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
