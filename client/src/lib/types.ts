export type Platform = 'facebook' | 'instagram' | 'tiktok';

export type PostStatus = 'scheduled' | 'published' | 'draft' | 'failed';

export type HealthStatus = 'healthy' | 'attention' | 'high-risk';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Client {
  id: string;
  name: string;
  logo: string;
  email: string;
  phone: string;
  description: string;
  connectedAccounts: ConnectedAccount[];
}

export interface ConnectedAccount {
  id: string;
  platform: Platform;
  username: string;
  avatar: string;
  isConnected: boolean;
  connectedAt?: Date;
}

export interface Post {
  id: string;
  clientId: string;
  platforms: Platform[];
  content: string;
  imageUrl?: string;
  scheduledDate: Date;
  status: PostStatus;
  createdAt: Date;
}

export interface Analytics {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  byPlatform: {
    facebook: PlatformMetrics;
    instagram: PlatformMetrics;
    tiktok: PlatformMetrics;
  };
}

export interface PlatformMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  reach?: number;
}

export interface Comment {
  id: string;
  platform: Platform;
  postId: string;
  author: string;
  authorAvatar: string;
  content: string;
  createdAt: Date;
  replies: Reply[];
}

export interface Reply {
  id: string;
  content: string;
  createdAt: Date;
  isAI?: boolean;
}

export interface SecurityEvent {
  id: string;
  clientId: string;
  platform: Platform;
  severity: SeverityLevel;
  title: string;
  description: string;
  rule: string;
  timestamp: Date;
}

export interface ClientHealth {
  clientId: string;
  overallScore: number;
  status: HealthStatus;
  lastScan: Date;
  warnings: SecurityWarning[];
  recentIssues: string;
}

export interface SecurityWarning {
  id: string;
  platform: Platform;
  category: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  timestamp: Date;
}

export interface AppState {
  clients: Client[];
  posts: Post[];
  analytics: Analytics;
  comments: Comment[];
  securityEvents: SecurityEvent[];
  clientHealth: ClientHealth[];
  currentClientId: string | null;
}
