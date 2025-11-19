import { useState, useMemo } from 'react';
import { Search, Send, Heart, MessageCircle, Filter, MoreVertical } from 'lucide-react';
import { SiFacebook, SiInstagram, SiTiktok } from 'react-icons/si';
import { useApp } from '@/lib/AppContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, subHours, subDays } from 'date-fns';
import type { Comment, Platform } from '@/lib/types';

type ConversationType = 'comment' | 'message';

interface MessageThreadItem {
  id: string;
  content: string;
  createdAt: Date;
  isFromUser: boolean; // true if from the user (Post Farming), false if from the other person
}

interface InboxItem {
  id: string;
  type: ConversationType;
  platform: Platform;
  authorName: string;
  authorAvatarUrl: string;
  timeAgo: string;
  snippet: string;
  unread: boolean;
  replied: boolean;
  createdAt: Date;
  // For comments
  commentId?: string;
  // For messages
  thread?: MessageThreadItem[];
}

export default function Inbox() {
  const { state, currentClient, addReplyToComment } = useApp();
  const { toast } = useToast();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'replied'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'comments' | 'messages'>('all');

  if (!currentClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-semibold mb-2">No Client Selected</h2>
        <p className="text-muted-foreground">Please select or add a client to view the unified inbox</p>
      </div>
    );
  }

  const clientComments = state.comments.filter(c => c.clientId === currentClient.id);

  // Generate dummy messages data
  const dummyMessages: InboxItem[] = [
    {
      id: 'msg-1',
      type: 'message',
      platform: 'instagram',
      authorName: 'sarah_johnson',
      authorAvatarUrl: '',
      timeAgo: '3 hours ago',
      snippet: 'Hey! Do you have any slots for next week? I\'d like to book a consultation.',
      unread: true,
      replied: true,
      createdAt: subHours(new Date(), 3),
      thread: [
        {
          id: 'thread-1-1',
          content: 'Hey! Do you have any slots for next week? I\'d like to book a consultation.',
          createdAt: subHours(new Date(), 3),
          isFromUser: false,
        },
        {
          id: 'thread-1-2',
          content: 'Hi Sarah! Yes, we have a few openings on Thursday and Friday. What time works best for you?',
          createdAt: subHours(new Date(), 2.5),
          isFromUser: true,
        },
        {
          id: 'thread-1-3',
          content: 'Thursday evening would be perfect. Anytime after 18:00.',
          createdAt: subHours(new Date(), 2),
          isFromUser: false,
        },
      ],
    },
    {
      id: 'msg-2',
      type: 'message',
      platform: 'tiktok',
      authorName: 'mike_wilson',
      authorAvatarUrl: '',
      timeAgo: '2 days ago',
      snippet: 'Thanks for the info! That answers my question.',
      unread: false,
      replied: true,
      createdAt: subDays(new Date(), 2),
      thread: [
        {
          id: 'thread-2-1',
          content: 'Hi, I have a question about your services.',
          createdAt: subDays(new Date(), 2),
          isFromUser: false,
        },
        {
          id: 'thread-2-2',
          content: 'Of course! What would you like to know?',
          createdAt: subDays(new Date(), 2),
          isFromUser: true,
        },
        {
          id: 'thread-2-3',
          content: 'Thanks for the info! That answers my question.',
          createdAt: subDays(new Date(), 2),
          isFromUser: false,
        },
      ],
    },
    {
      id: 'msg-3',
      type: 'message',
      platform: 'facebook',
      authorName: 'emily_chen',
      authorAvatarUrl: '',
      timeAgo: '5 hours ago',
      snippet: 'I\'m interested in learning more about your pricing plans.',
      unread: true,
      replied: false,
      createdAt: subHours(new Date(), 5),
      thread: [
        {
          id: 'thread-3-1',
          content: 'I\'m interested in learning more about your pricing plans.',
          createdAt: subHours(new Date(), 5),
          isFromUser: false,
        },
      ],
    },
  ];

  // Convert comments to InboxItem format
  const commentItems: InboxItem[] = clientComments.map(comment => ({
    id: `comment-${comment.id}`,
    type: 'comment' as ConversationType,
    platform: comment.platform,
    authorName: comment.author,
    authorAvatarUrl: comment.avatar,
    timeAgo: formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }),
    snippet: comment.content,
    unread: comment.replies.length === 0,
    replied: comment.replies.length > 0,
    createdAt: comment.createdAt,
    commentId: comment.id,
  }));

  // Combine all inbox items
  const allInboxItems: InboxItem[] = [...commentItems, ...dummyMessages].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  // Filter inbox items
  const filteredItems = useMemo(() => {
    return allInboxItems
      .filter(item => {
        if (typeFilter === 'comments') return item.type === 'comment';
        if (typeFilter === 'messages') return item.type === 'message';
        return true;
      })
      .filter(item => {
        if (statusFilter === 'unread') return item.unread;
        if (statusFilter === 'replied') return item.replied;
        return true;
      })
      .filter(item => filterPlatform === 'all' || item.platform === filterPlatform)
      .filter(item => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          item.authorName.toLowerCase().includes(query) ||
          item.snippet.toLowerCase().includes(query)
        );
      });
  }, [allInboxItems, typeFilter, statusFilter, filterPlatform, searchQuery]);

  const selectedItem = selectedItemId ? allInboxItems.find(item => item.id === selectedItemId) : null;
  const selectedComment = selectedItem?.type === 'comment' && selectedItem.commentId
    ? clientComments.find(c => c.id === selectedItem.commentId)
    : null;

  const handleAISuggestion = () => {
    if (!selectedItem) return;

    const suggestions = selectedItem.type === 'message'
      ? [
        `Hi! Thanks for reaching out. How can I help you today?`,
        `I'd be happy to assist you with that. Let me get back to you with more details.`,
        `Thanks for your message! I'll look into this and get back to you shortly.`,
        `I appreciate you reaching out. Let's discuss this further.`,
      ]
      : [
        `Thanks for your comment! We're thrilled you enjoyed it. Stay tuned for more great content coming soon!`,
        `We appreciate your feedback! Check out our latest updates on our profile.`,
        `Thank you for the support! Make sure to follow us for exclusive updates and behind-the-scenes content.`,
        `Great question! We'll be sharing more details about this very soon. Thanks for your interest!`,
        `We love hearing from you! Your support means the world to us. More exciting content on the way!`,
        `Thanks so much for reaching out! We'll get back to you with more information shortly.`,
        `Appreciate your engagement! We have some exciting announcements coming up that you won't want to miss.`,
      ];

    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setReplyText(randomSuggestion);

    toast({
      title: 'AI Suggestion Generated',
      description: 'You can edit the suggestion before sending',
    });
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedItemId || !selectedItem) return;

    if (selectedItem.type === 'comment' && selectedItem.commentId) {
      addReplyToComment(selectedItem.commentId, {
        content: replyText,
        isAI: false,
      });

      toast({
        title: 'Reply sent',
        description: `Your reply has been sent to ${selectedItem.authorName}`,
      });
    } else if (selectedItem.type === 'message') {
      // For demo, just log the message
      console.log({ type: 'message', itemId: selectedItemId, text: replyText });

      toast({
        title: 'Message sent',
        description: `Your message has been sent to ${selectedItem.authorName}`,
      });
    }

    setReplyText('');
  };

  const handleLike = (item: InboxItem) => {
    if (item.type === 'comment') {
      toast({
        title: 'Liked',
        description: `You liked ${item.authorName}'s comment`,
      });
    }
  };

  const platformIcons = {
    facebook: { icon: SiFacebook, color: 'bg-blue-500' },
    instagram: { icon: SiInstagram, color: 'bg-pink-500' },
    tiktok: { icon: SiTiktok, color: 'bg-black dark:bg-white' },
  };

  const unreadCount = allInboxItems.filter(item => item.unread).length;
  const repliedCount = allInboxItems.filter(item => item.replied).length;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold">Unified Inbox</h1>
            <p className="text-muted-foreground mt-1">Manage comments and private messages from all platforms.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" data-testid="badge-unread-count">
              {unreadCount} Unread
            </Badge>
            <Button variant="outline" size="icon" data-testid="button-filter">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search comments & messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <Select value={filterPlatform} onValueChange={(value) => setFilterPlatform(value as Platform | 'all')}>
            <SelectTrigger className="w-[160px]" data-testid="select-platform-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              <SelectItem value="facebook">
                <div className="flex items-center gap-2">
                  <SiFacebook className="h-3.5 w-3.5" />
                  Facebook
                </div>
              </SelectItem>
              <SelectItem value="instagram">
                <div className="flex items-center gap-2">
                  <SiInstagram className="h-3.5 w-3.5" />
                  Instagram
                </div>
              </SelectItem>
              <SelectItem value="tiktok">
                <div className="flex items-center gap-2">
                  <SiTiktok className="h-3.5 w-3.5" />
                  TikTok
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)} className="mb-4">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">All ({allInboxItems.length})</TabsTrigger>
          <TabsTrigger value="unread" data-testid="tab-unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="replied" data-testid="tab-replied">Replied ({repliedCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Type Filter */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={typeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTypeFilter('all')}
          className="rounded-full px-3 py-1 text-xs"
        >
          All
        </Button>
        <Button
          variant={typeFilter === 'comments' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTypeFilter('comments')}
          className="rounded-full px-3 py-1 text-xs"
        >
          Comments
        </Button>
        <Button
          variant={typeFilter === 'messages' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTypeFilter('messages')}
          className="rounded-full px-3 py-1 text-xs"
        >
          Messages
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        {/* Inbox list */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="border-b py-3">
            <h2 className="font-semibold">Inbox</h2>
            <p className="text-xs text-muted-foreground mt-1">Comments and direct messages from connected accounts.</p>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No items found</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredItems.map((item) => {
                  const PlatformIcon = platformIcons[item.platform].icon;
                  const isSelected = selectedItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`p-4 cursor-pointer hover-elevate transition-colors ${isSelected ? 'bg-accent' : ''
                        }`}
                      data-testid={`item-${item.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={item.authorAvatarUrl} alt={item.authorName} />
                          <AvatarFallback>{item.authorName[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium">{item.authorName}</span>
                            <div className={`flex items-center justify-center w-5 h-5 rounded ${platformIcons[item.platform].color}`}>
                              <PlatformIcon className="w-3 h-3 text-white" />
                            </div>
                            {item.type === 'message' && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0">Direct message</Badge>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">
                              {item.timeAgo}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{item.snippet}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {item.unread && !item.replied && (
                              <Badge variant="secondary" className="text-xs">Needs reply</Badge>
                            )}
                            {item.replied && (
                              <Badge variant="outline" className="text-xs border-green-500 text-green-700">Replied</Badge>
                            )}
                          </div>
                        </div>
                        {item.type === 'comment' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleLike(item); }}>
                                <Heart className="mr-2 h-4 w-4" />
                                Like
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={(e) => e.stopPropagation()}>
                                Hide comment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comment/Message detail & reply */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="border-b py-3">
            <h2 className="font-semibold">Reply</h2>
            {selectedItem?.type === 'message' && (
              <p className="text-xs text-muted-foreground mt-1">Private conversation</p>
            )}
            {selectedItem?.type === 'comment' && (
              <p className="text-xs text-muted-foreground mt-1">Respond as Post Farming. Replies are sent directly to the platform.</p>
            )}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {selectedItem ? (
              <>
                {selectedItem.type === 'comment' && selectedComment ? (
                  <>
                    <div className="p-4 border-b overflow-y-auto">
                      <div className="flex items-start gap-3 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedComment.avatar} alt={selectedComment.author} />
                          <AvatarFallback>{selectedComment.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{selectedComment.author}</span>
                            {(() => {
                              const PlatformIcon = platformIcons[selectedComment.platform].icon;
                              return (
                                <div className={`flex items-center justify-center w-5 h-5 rounded ${platformIcons[selectedComment.platform].color}`}>
                                  <PlatformIcon className="w-3 h-3 text-white" />
                                </div>
                              );
                            })()}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(selectedComment.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm">{selectedComment.content}</p>
                        </div>
                      </div>

                      {/* Previous replies */}
                      {selectedComment.replies.length > 0 && (
                        <div className="space-y-3 mt-4 pt-4 border-t">
                          <h3 className="text-sm font-medium text-muted-foreground">Previous Replies</h3>
                          {selectedComment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-3 pl-4 border-l-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>You</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">You</span>
                                  {reply.isAI && <Badge variant="secondary" className="text-xs">AI Assisted</Badge>}
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-sm">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reply input */}
                    <div className="p-4 flex-1 flex flex-col border-t">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 resize-none mb-3 min-h-[100px]"
                        data-testid="textarea-reply"
                      />
                      <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm" onClick={handleAISuggestion} data-testid="button-ai-suggest">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          AI Suggestion
                        </Button>
                        <Button onClick={handleReply} disabled={!replyText.trim()} data-testid="button-send-reply">
                          <Send className="mr-2 h-4 w-4" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </>
                ) : selectedItem.type === 'message' ? (
                  <>
                    <div className="p-4 border-b">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedItem.authorAvatarUrl} alt={selectedItem.authorName} />
                          <AvatarFallback>{selectedItem.authorName[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{selectedItem.authorName}</span>
                            {(() => {
                              const PlatformIcon = platformIcons[selectedItem.platform].icon;
                              return (
                                <div className={`flex items-center justify-center w-5 h-5 rounded ${platformIcons[selectedItem.platform].color}`}>
                                  <PlatformIcon className="w-3 h-3 text-white" />
                                </div>
                              );
                            })()}
                            <Badge variant="outline" className="text-xs">Direct message</Badge>
                            <span className="text-xs text-muted-foreground">
                              {selectedItem.timeAgo}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message thread */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {selectedItem.thread?.map((threadItem) => (
                        <div
                          key={threadItem.id}
                          className={`flex ${threadItem.isFromUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${threadItem.isFromUser
                                ? 'bg-emerald-50 dark:bg-emerald-950'
                                : 'bg-slate-100 dark:bg-slate-800'
                              }`}
                          >
                            <p className="text-sm">{threadItem.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(threadItem.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message input */}
                    <div className="p-4 border-t flex flex-col">
                      <Textarea
                        placeholder="Type your message..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 resize-none mb-3 min-h-[100px]"
                        data-testid="textarea-reply"
                      />
                      <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm" onClick={handleAISuggestion} data-testid="button-ai-suggest">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          AI Suggestion
                        </Button>
                        <Button onClick={handleReply} disabled={!replyText.trim()} data-testid="button-send-reply">
                          <Send className="mr-2 h-4 w-4" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </>
                ) : null}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Select a comment or message to reply.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
