import type { AppState, Client, Post, Comment, SecurityEvent, ClientHealth, Analytics } from './types';

const clientLogos = [
  'https://api.dicebear.com/7.x/initials/svg?seed=T&backgroundColor=ef4444',
  'https://api.dicebear.com/7.x/initials/svg?seed=A&backgroundColor=3b82f6',
  'https://api.dicebear.com/7.x/initials/svg?seed=AP&backgroundColor=06b6d4',
];

export function generateMockData(): AppState {
  const clients: Client[] = [
    {
      id: '1',
      name: 'Tesla',
      logo: clientLogos[0],
      email: 'marketing@tesla.co',
      phone: '07450245053',
      description: 'Tesla Test',
      connectedAccounts: [
        {
          id: '1-fb',
          platform: 'facebook',
          username: 'TriSof Test Page',
          avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=fb',
          isConnected: true,
          connectedAt: new Date('2024-11-01'),
        },
        {
          id: '1-ig',
          platform: 'instagram',
          username: 'uhakdt2025',
          avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=ig',
          isConnected: true,
          connectedAt: new Date('2024-11-01'),
        },
        {
          id: '1-tt',
          platform: 'tiktok',
          username: 'uhakdt',
          avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=tt',
          isConnected: true,
          connectedAt: new Date('2024-11-01'),
        },
      ],
    },
    {
      id: '2',
      name: 'Asiacell',
      logo: clientLogos[1],
      email: 'contact@asiacell.com',
      phone: '1212312313',
      description: 'Asiacell Test',
      connectedAccounts: [],
    },
    {
      id: '3',
      name: 'Apple',
      logo: clientLogos[2],
      email: 'test@gmail.com',
      phone: '1212312313',
      description: 'this is a test test loadn..',
      connectedAccounts: [],
    },
  ];

  const posts: Post[] = [
    {
      id: '1',
      clientId: '1',
      platforms: ['facebook', 'instagram'],
      content: 'Exciting new product launch coming soon! Stay tuned for updates.',
      imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
      scheduledDate: new Date('2025-11-20T10:00:00'),
      status: 'scheduled',
      createdAt: new Date('2025-11-17'),
    },
    {
      id: '2',
      clientId: '1',
      platforms: ['instagram', 'tiktok'],
      content: 'Behind the scenes of our latest campaign',
      scheduledDate: new Date('2025-11-22T14:30:00'),
      status: 'scheduled',
      createdAt: new Date('2025-11-17'),
    },
  ];

  const analytics: Analytics = {
    totalViews: 570,
    totalLikes: 9,
    totalComments: 0,
    totalShares: 0,
    byPlatform: {
      facebook: {
        views: 51,
        likes: 1,
        comments: 0,
        shares: 0,
      },
      instagram: {
        views: 519,
        likes: 8,
        comments: 0,
        shares: 0,
        reach: 519,
      },
      tiktok: {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      },
    },
  };

  const comments: Comment[] = [
    {
      id: '1',
      platform: 'instagram',
      postId: '1',
      author: 'john_doe',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      content: 'This looks amazing! Can\'t wait to see more!',
      createdAt: new Date('2025-11-17T09:30:00'),
      replies: [],
    },
    {
      id: '2',
      platform: 'facebook',
      postId: '1',
      author: 'jane_smith',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
      content: 'Love this! When will it be available?',
      createdAt: new Date('2025-11-17T10:15:00'),
      replies: [],
    },
  ];

  const securityEvents: SecurityEvent[] = [
    {
      id: '1',
      clientId: '1',
      platform: 'tiktok',
      severity: 'critical',
      title: 'New ad account created with card linked to 2 suspended advertisers.',
      description: 'New TikTok ad account shares a billing card with 2 suspended advertisers. High risk of instant suspension on first spend.',
      rule: 'tiktok_bad_actor_link',
      timestamp: new Date('2025-11-17T14:22:00'),
    },
    {
      id: '2',
      clientId: '1',
      platform: 'facebook',
      severity: 'high',
      title: 'BF "Weekend Sale" ad disapproved for misleading claims.',
      description: 'Meta Ad Review',
      rule: 'Meta Ad Review',
      timestamp: new Date('2025-11-17T08:05:00'),
    },
    {
      id: '3',
      clientId: '1',
      platform: 'instagram',
      severity: 'high',
      title: 'Detected hashtag block with spam-style tags (#giveaway, #followfollow).',
      description: 'ig_hashtag_spam_block',
      rule: 'ig_hashtag_spam_block',
      timestamp: new Date('2025-11-16T17:41:00'),
    },
    {
      id: '4',
      clientId: '1',
      platform: 'instagram',
      severity: 'low',
      title: 'Non-follower reach down 62% vs previous 30 days; no strikes found.',
      description: 'reach_anomaly_ig',
      rule: 'reach_anomaly_ig',
      timestamp: new Date('2025-11-15T11:12:00'),
    },
  ];

  const clientHealth: ClientHealth[] = [
    {
      clientId: '1',
      overallScore: 72,
      status: 'attention',
      lastScan: new Date('2025-11-17T16:00:00'),
      warnings: [
        {
          id: 'w1',
          platform: 'tiktok',
          category: 'Environment',
          severity: 'critical',
          title: 'bad actor proximity',
          description: 'New TikTok ad account shares a billing card with 2 suspended advertisers. High risk of instant suspension on first spend.',
          timestamp: new Date('2025-11-17T14:00:00'),
        },
        {
          id: 'w2',
          platform: 'facebook',
          category: 'Account',
          severity: 'high',
          title: 'cold ad account',
          description: 'New ad account, no organic history, weak legal pages and strong "last chance / guaranteed" copy.',
          timestamp: new Date('2025-11-16T10:00:00'),
        },
        {
          id: 'w3',
          platform: 'instagram',
          category: 'Content',
          severity: 'medium',
          title: 'follower quality',
          description: 'Spike in low-quality followers and spammy hashtag blocks; reach down vs last month.',
          timestamp: new Date('2025-11-12T08:00:00'),
        },
      ],
      recentIssues: 'IG: 7 posts in 45 min. TikTok: repeated IG Reels.',
    },
    {
      clientId: '2',
      overallScore: 95,
      status: 'healthy',
      lastScan: new Date('2025-11-17T15:30:00'),
      warnings: [],
      recentIssues: 'No active violations. Ad copy occasionally reviewed for "guaranteed comfort".',
    },
    {
      clientId: '3',
      overallScore: 68,
      status: 'high-risk',
      lastScan: new Date('2025-11-17T14:45:00'),
      warnings: [
        {
          id: 'w4',
          platform: 'facebook',
          category: 'Account',
          severity: 'high',
          title: 'disapproved ads',
          description: 'Meta: 2 disapproved ads. TikTok Ads: shared card with suspended account.',
          timestamp: new Date('2025-11-17T06:00:00'),
        },
      ],
      recentIssues: 'Meta: 2 disapproved ads. TikTok Ads: shared card with suspended account.',
    },
  ];

  return {
    clients,
    posts,
    analytics,
    comments,
    securityEvents,
    clientHealth,
    currentClientId: '1',
  };
}
