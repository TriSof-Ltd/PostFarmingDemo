import { useState } from 'react';
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
import { formatDistanceToNow } from 'date-fns';
import type { Comment, Platform } from '@/lib/types';

export default function Inbox() {
  const { state, currentClient, addReplyToComment } = useApp();
  const { toast } = useToast();
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  if (!currentClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-semibold mb-2">No Client Selected</h2>
        <p className="text-muted-foreground">Please select or add a client to view the unified inbox</p>
      </div>
    );
  }

  const clientComments = state.comments.filter(c => c.clientId === currentClient.id);
  const selectedComment = selectedCommentId ? clientComments.find(c => c.id === selectedCommentId) : null;

  const filteredComments = clientComments
    .filter(c => filterPlatform === 'all' || c.platform === filterPlatform)
    .filter(c => 
      searchQuery === '' || 
      c.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(c => {
      if (activeTab === 'all') return true;
      if (activeTab === 'unread') return c.replies.length === 0;
      if (activeTab === 'replied') return c.replies.length > 0;
      return true;
    });

  const handleAISuggestion = () => {
    if (!selectedComment) return;

    const suggestions = [
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
    if (!replyText.trim() || !selectedCommentId) return;

    const comment = clientComments.find(c => c.id === selectedCommentId);
    if (!comment) return;

    addReplyToComment(selectedCommentId, {
      content: replyText,
      isAI: false,
    });

    toast({
      title: 'Reply sent',
      description: `Your reply has been sent to ${comment.author}`,
    });

    setReplyText('');
  };

  const handleLike = (comment: Comment) => {
    toast({
      title: 'Liked',
      description: `You liked ${comment.author}'s comment`,
    });
  };

  const platformIcons = {
    facebook: { icon: SiFacebook, color: 'bg-blue-500' },
    instagram: { icon: SiInstagram, color: 'bg-pink-500' },
    tiktok: { icon: SiTiktok, color: 'bg-black dark:bg-white' },
  };

  const unreadCount = clientComments.filter(c => c.replies.length === 0).length;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold">Unified Inbox</h1>
            <p className="text-muted-foreground mt-1">Manage comments from all platforms</p>
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
              placeholder="Search comments..."
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
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">All ({clientComments.length})</TabsTrigger>
          <TabsTrigger value="unread" data-testid="tab-unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="replied" data-testid="tab-replied">Replied ({clientComments.filter(c => c.replies.length > 0).length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        {/* Comments list */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="border-b py-3">
            <h2 className="font-semibold">Comments</h2>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {filteredComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No comments found</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredComments.map((comment) => {
                  const PlatformIcon = platformIcons[comment.platform].icon;
                  const isSelected = selectedCommentId === comment.id;

                  return (
                    <div
                      key={comment.id}
                      onClick={() => setSelectedCommentId(comment.id)}
                      className={`p-4 cursor-pointer hover-elevate ${
                        isSelected ? 'bg-accent' : ''
                      }`}
                      data-testid={`comment-${comment.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={comment.avatar} alt={comment.author} />
                          <AvatarFallback>{comment.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{comment.author}</span>
                            <div className={`flex items-center justify-center w-5 h-5 rounded ${platformIcons[comment.platform].color}`}>
                              <PlatformIcon className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm line-clamp-2">{comment.content}</p>
                          {comment.replies.length === 0 && (
                            <Badge variant="secondary" className="mt-2 text-xs">Needs reply</Badge>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleLike(comment)}>
                              <Heart className="mr-2 h-4 w-4" />
                              Like
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Hide comment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comment detail & reply */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="border-b py-3">
            <h2 className="font-semibold">Reply</h2>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {selectedComment ? (
              <>
                <div className="p-4 border-b">
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
                <div className="p-4 flex-1 flex flex-col">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 resize-none mb-3"
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
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Select a comment to reply</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
