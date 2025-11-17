import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import type { Post } from '@/lib/types';

export default function Calendar() {
  const { state, currentClient } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (!currentClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-semibold mb-2">No Client Selected</h2>
        <p className="text-muted-foreground">Please select or add a client to view the content calendar</p>
      </div>
    );
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad with days from previous/next month to fill the grid
  const startDay = monthStart.getDay();
  const paddingDays = Array.from({ length: startDay }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (startDay - i));
    return date;
  });

  const allDays = [...paddingDays, ...daysInMonth];

  const getPostsForDay = (day: Date): Post[] => {
    return state.posts.filter(post =>
      isSameDay(new Date(post.scheduledDate), day) && post.status === 'scheduled'
    );
  };

  const platformColors = {
    facebook: 'bg-blue-500',
    instagram: 'bg-pink-500',
    tiktok: 'bg-black',
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))} data-testid="button-prev-month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-semibold min-w-[200px] text-center" data-testid="text-current-month">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))} data-testid="button-next-month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Select defaultValue="all" data-testid="select-account-filter">
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All accounts</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Calendar Grid */}
      <Card className="flex-1 p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-px mb-2">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px flex-1 border border-border rounded-md overflow-hidden">
          {allDays.map((day, index) => {
            const posts = getPostsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-border ${
                  !isCurrentMonth ? 'bg-muted/30' : 'bg-background'
                } ${isToday ? 'bg-accent/20' : ''}`}
                data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
              >
                <div className={`text-sm font-medium mb-1 ${!isCurrentMonth ? 'text-muted-foreground' : ''}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="text-xs p-1.5 rounded bg-accent hover-elevate cursor-pointer truncate"
                      data-testid={`post-${post.id}`}
                    >
                      <div className="flex gap-1 mb-1">
                        {post.platforms.map((platform) => (
                          <div key={platform} className={`h-2 w-2 rounded-full ${platformColors[platform]}`} />
                        ))}
                      </div>
                      <div className="truncate text-foreground">{post.content}</div>
                      <div className="text-muted-foreground text-[10px] mt-0.5">
                        {format(new Date(post.scheduledDate), 'h:mm a')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <CreatePostModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  );
}
