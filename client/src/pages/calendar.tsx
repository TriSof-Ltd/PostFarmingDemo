import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MoreHorizontal, X, Edit, Copy, Trash2 } from 'lucide-react';
import { SiFacebook, SiInstagram, SiTiktok } from 'react-icons/si';
import { useApp } from '@/lib/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreatePostModal } from '@/components/create-post-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import type { Post, Platform } from '@/lib/types';

// --- Types ---
type PlatformColorMap = Record<Platform, string>;

// --- Constants ---
const PLATFORM_COLORS: PlatformColorMap = {
  facebook: 'bg-[#1877F2]',
  instagram: 'bg-[#E4405F]',
  tiktok: 'bg-[#000000]',
};

const PLATFORM_ICONS = {
  facebook: SiFacebook,
  instagram: SiInstagram,
  tiktok: SiTiktok,
};

// --- Components ---

const PlatformLegend = () => (
  <div className="flex items-center gap-3 text-xs text-muted-foreground">
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${PLATFORM_COLORS.facebook}`} />
      <span>Facebook</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${PLATFORM_COLORS.instagram}`} />
      <span>Instagram</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${PLATFORM_COLORS.tiktok}`} />
      <span>TikTok</span>
    </div>
  </div>
);

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const CalendarHeader = ({ currentDate, onPrevMonth, onNextMonth, onToday }: CalendarHeaderProps) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-card border rounded-lg p-1 shadow-sm">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-[140px] text-center font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full px-4 h-9 border-dashed"
        onClick={onToday}
      >
        Today
      </Button>
    </div>

    <div className="flex flex-col items-end gap-2">
      <Select defaultValue="all">
        <SelectTrigger className="w-[180px] h-9 bg-card">
          <SelectValue placeholder="All accounts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All accounts</SelectItem>
          <SelectItem value="facebook">Facebook</SelectItem>
          <SelectItem value="instagram">Instagram</SelectItem>
          <SelectItem value="tiktok">TikTok</SelectItem>
        </SelectContent>
      </Select>
      <PlatformLegend />
    </div>
  </div>
);

interface PostChipProps {
  post: Post;
  onClick: (post: Post, e: React.MouseEvent) => void;
}

const PostChip = ({ post, onClick }: PostChipProps) => {
  return (
    <div
      onClick={(e) => onClick(post, e)}
      className="group relative text-xs p-1.5 rounded-md bg-white dark:bg-secondary border border-border/50 hover:border-primary/50 hover:shadow-sm cursor-pointer transition-all mb-1"
    >
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 hidden group-hover:block">
        <div className="font-semibold mb-1 truncate">{post.content}</div>
        <div className="flex gap-1 mb-1">
          {post.platforms.map(p => (
            <span key={p} className="capitalize text-[10px] bg-muted px-1 rounded">{p}</span>
          ))}
        </div>
        <div className="text-[10px] text-muted-foreground capitalize">{post.status}</div>
      </div>

      <div className="flex items-center justify-between mb-1 opacity-70">
        <span className="text-[10px] font-medium">{format(new Date(post.scheduledDate), 'h:mm a')}</span>
        <div className="flex -space-x-1">
          {post.platforms.map((platform) => (
            <div key={platform} className={`w-1.5 h-1.5 rounded-full ring-1 ring-white dark:ring-secondary ${PLATFORM_COLORS[platform]}`} />
          ))}
        </div>
      </div>
      <div className="truncate font-medium text-[11px] leading-tight">
        {post.content}
      </div>
    </div>
  );
};

interface DayCellProps {
  day: Date;
  currentDate: Date;
  posts: Post[];
  onPostClick: (post: Post, e: React.MouseEvent) => void;
  onCreateClick: (date: Date) => void;
}

const DayCell = ({ day, currentDate, posts, onPostClick, onCreateClick }: DayCellProps) => {
  const isCurrentMonth = isSameMonth(day, currentDate);
  const isTodayDate = isToday(day);
  const maxVisiblePosts = 3;
  const visiblePosts = posts.slice(0, maxVisiblePosts);
  const hiddenCount = Math.max(0, posts.length - maxVisiblePosts);

  return (
    <div
      className={`group min-h-[140px] p-2 border-r border-b border-border/60 relative transition-colors hover:bg-accent/5 ${!isCurrentMonth ? 'bg-muted/10 text-muted-foreground/50' : 'bg-background'
        } ${isTodayDate ? 'ring-2 ring-inset ring-emerald-500/50 bg-emerald-50/10' : ''}`}
      onClick={() => onCreateClick(day)}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isTodayDate ? 'bg-emerald-500 text-white' : ''
          }`}>
          {format(day, 'd')}
        </span>

        {/* Busy Indicator */}
        {posts.length > 0 && (
          <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
            {posts.length}
          </span>
        )}
      </div>

      <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
        {visiblePosts.map((post) => (
          <PostChip key={post.id} post={post} onClick={onPostClick} />
        ))}
        {hiddenCount > 0 && (
          <div className="text-[10px] text-muted-foreground font-medium pl-1">
            +{hiddenCount} more
          </div>
        )}
      </div>

      {/* Create Button (Hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCreateClick(day);
        }}
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full p-1.5 shadow-sm hover:shadow-md hover:scale-105 transform duration-200"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
};

interface PostDetailsPanelProps {
  post: Post | null;
  onClose: () => void;
}

const PostDetailsPanel = ({ post, onClose }: PostDetailsPanelProps) => {
  if (!post) {
    return (
      <div className="w-[360px] border-l bg-background p-6 flex flex-col items-center justify-center text-center h-full fixed right-0 top-0 bottom-0 shadow-xl z-20">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <CalendarIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No post selected</h3>
        <p className="text-sm text-muted-foreground">
          Select a post from the calendar to view details and manage content.
        </p>
      </div>
    );
  }

  return (
    <div className="w-[360px] border-l bg-background h-full fixed right-0 top-0 bottom-0 shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b flex items-start justify-between bg-muted/10">
        <div>
          <h3 className="font-semibold text-lg leading-tight mb-1">Post Details</h3>
          <p className="text-xs text-muted-foreground">ID: {post.id}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
            {post.status}
          </span>
          <div className="flex gap-1">
            {post.platforms.map(p => {
              const Icon = PLATFORM_ICONS[p];
              return (
                <div key={p} className={`p-1.5 rounded-full bg-muted text-muted-foreground`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(new Date(post.scheduledDate), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(post.scheduledDate), 'h:mm a')}</span>
          </div>
        </div>

        {/* Post Content */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Caption</label>
          <div className="p-4 bg-muted/30 rounded-lg border text-sm leading-relaxed">
            {post.content}
          </div>
        </div>

        {/* Media Preview (Dummy) */}
        {post.imageUrl && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Media</label>
            <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
              <img src={post.imageUrl} alt="Post media" className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t bg-muted/10 grid grid-cols-3 gap-2">
        <Button variant="outline" size="sm" className="w-full" onClick={() => console.log('Edit')}>
          <Edit className="h-3.5 w-3.5 mr-2" />
          Edit
        </Button>
        <Button variant="outline" size="sm" className="w-full" onClick={() => console.log('Duplicate')}>
          <Copy className="h-3.5 w-3.5 mr-2" />
          Copy
        </Button>
        <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => console.log('Delete')}>
          <Trash2 className="h-3.5 w-3.5 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default function Calendar() {
  const { state, currentClient } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);

  // --- Calendar Logic ---
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  const getPostsForDay = (day: Date): Post[] => {
    if (!state.posts) return [];
    return state.posts.filter(post =>
      isSameDay(new Date(post.scheduledDate), day) && post.status === 'scheduled'
    );
  };

  const handlePostClick = (post: Post, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPost(post);
    setIsDetailsPanelOpen(true);
  };

  const handleCreateClick = (date: Date) => {
    // In a real app, we'd pass the date to the modal
    console.log('Create post for:', date);
    setIsCreateModalOpen(true);
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  if (!currentClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-semibold mb-2">No Client Selected</h2>
        <p className="text-muted-foreground">Please select or add a client to view the content calendar</p>
      </div>
    );
  }

  const hasPostsInMonth = state.posts.some(post => isSameMonth(new Date(post.scheduledDate), currentDate));

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={() => setCurrentDate(subMonths(currentDate, 1))}
        onNextMonth={() => setCurrentDate(addMonths(currentDate, 1))}
        onToday={handleTodayClick}
      />

      <Card className="flex-1 flex flex-col overflow-hidden shadow-sm border-border/60">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b bg-muted/5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-3 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1 overflow-y-auto relative">
          {calendarDays.map((day, index) => (
            <DayCell
              key={index}
              day={day}
              currentDate={currentDate}
              posts={getPostsForDay(day)}
              onPostClick={handlePostClick}
              onCreateClick={handleCreateClick}
            />
          ))}

          {/* Empty State Overlay */}
          {!hasPostsInMonth && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] z-10 pointer-events-none">
              <div className="bg-background/95 border shadow-lg rounded-xl p-6 text-center max-w-md pointer-events-auto">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No posts scheduled for {format(currentDate, 'MMMM')} yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click any day in the calendar to create your first scheduled post and start planning your content.
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  Create First Post
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Right-side Details Panel */}
      {isDetailsPanelOpen && (
        <>
          {/* Backdrop for mobile/focus */}
          <div
            className="fixed inset-0 bg-black/20 z-10"
            onClick={() => setIsDetailsPanelOpen(false)}
          />
          <PostDetailsPanel
            post={selectedPost}
            onClose={() => setIsDetailsPanelOpen(false)}
          />
        </>
      )}

      <CreatePostModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  );
}
