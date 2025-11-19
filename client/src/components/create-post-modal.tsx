import { useState, useEffect } from 'react';
import { X, Upload, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import { SiFacebook, SiInstagram, SiTiktok } from 'react-icons/si';
import { useApp } from '@/lib/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { Platform } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

type MediaItemType = "image" | "video" | "report";

interface MediaItem {
  id: string;
  type: MediaItemType;
  label: string;
  thumbnailUrl?: string;
}

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
  const { currentClient, addPost } = useApp();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: "report-1",
      type: "report",
      label: "Security & Account Health – Alat Cars",
      thumbnailUrl: "/placeholder-report-thumbnail.png",
    },
  ]);
  const [primaryMediaId, setPrimaryMediaId] = useState<string | null>("report-1");
  const [previewPlatform, setPreviewPlatform] = useState<Platform | null>(null);

  // Get primary media item
  const primaryMedia = mediaItems.find(item => item.id === primaryMediaId);

  const connectedAccounts = currentClient?.connectedAccounts.filter(acc => acc.isConnected) || [];

  // Guard: Close modal if no client is selected
  useEffect(() => {
    if (open && !currentClient) {
      toast({
        title: 'No client selected',
        description: 'Please select a client before creating posts',
        variant: 'destructive',
      });
      onOpenChange(false);
    }
  }, [open, currentClient, toast, onOpenChange]);

  const toggleAccount = (accountId: string) => {
    setSelectedAccountIds(prev =>
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newMediaItem: MediaItem = {
          id: `upload-${Date.now()}`,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          label: file.name,
          thumbnailUrl: reader.result as string,
        };
        setMediaItems(items => [...items, newMediaItem]);
        // Set as primary if it's the first item
        if (mediaItems.length === 0) {
          setPrimaryMediaId(newMediaItem.id);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSchedule = () => {
    if (!currentClient) {
      toast({
        title: 'No client selected',
        description: 'Please select a client first',
        variant: 'destructive',
      });
      onOpenChange(false);
      return;
    }

    if (!content.trim()) {
      toast({
        title: 'Content required',
        description: 'Please enter some content for your post',
        variant: 'destructive',
      });
      return;
    }

    if (selectedAccountIds.length === 0) {
      toast({
        title: 'Select accounts',
        description: 'Please select at least one account',
        variant: 'destructive',
      });
      return;
    }

    const scheduledDate = selectedDate
      ? new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`)
      : new Date(Date.now() + 3600000); // Default to 1 hour from now

    // Derive platforms from selected account IDs
    const selectedAccounts = connectedAccounts.filter(acc => selectedAccountIds.includes(acc.id));
    const platforms = selectedAccounts.map(acc => acc.platform);

    const newPost = {
      id: Date.now().toString(),
      clientId: currentClient.id,
      platforms,
      content,
      imageUrl: primaryMedia?.thumbnailUrl || undefined,
      scheduledDate,
      status: 'scheduled' as const,
      createdAt: new Date(),
    };

    addPost(newPost);
    toast({
      title: 'Post scheduled',
      description: `Your post has been scheduled for ${format(scheduledDate, 'MMM d, yyyy at h:mm a')}`,
    });

    // Reset form
    setContent('');
    setSelectedAccountIds([]);
    setImagePreview(null);
    setSelectedDate(undefined);
    onOpenChange(false);
  };

  const platformIcons = {
    facebook: { icon: SiFacebook, color: '#1877F2', name: 'Facebook' },
    instagram: { icon: SiInstagram, color: '#E4405F', name: 'Instagram' },
    tiktok: { icon: SiTiktok, color: '#000000', name: 'TikTok' },
  };

  // Don't render if no client
  if (!currentClient) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" data-testid="modal-create-post">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold">Create post</DialogTitle>
          <DialogDescription>
            Plan and schedule posts for your connected accounts.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Form */}
          <div>
            {/* Platform Selection */}
            <div>
              <h3 className="text-sm font-medium text-slate-900 mb-2">Select accounts</h3>
              <p className="text-xs text-slate-500 mb-3">
                Choose which profiles this post will be published to.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {connectedAccounts.map((account) => {
                  const platformInfo = platformIcons[account.platform];
                  const Icon = platformInfo.icon;
                  const isSelected = selectedAccountIds.includes(account.id);

                  return (
                    <button
                      key={account.id}
                      onClick={() => toggleAccount(account.id)}
                      className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all hover:border-primary/50 ${isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:bg-accent/50'
                        }`}
                      data-testid={`platform-${account.platform}`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
                          Selected
                        </div>
                      )}
                      <div className="relative shrink-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={account.avatar} alt={account.username} />
                          <AvatarFallback>{account.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div
                          className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-background"
                          style={{ backgroundColor: platformInfo.color }}
                        >
                          <Icon className="h-2.5 w-2.5 text-white" />
                        </div>
                      </div>
                      <div className="flex flex-col items-start min-w-0">
                        <span className="text-sm font-medium truncate w-full text-left">
                          {account.username}
                        </span>
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {account.platform}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 text-xs text-slate-600">
                {selectedAccountIds.length === 0 ? (
                  <span>No accounts selected yet.</span>
                ) : selectedAccountIds.length === 1 ? (
                  <span>
                    Posting to: <strong>{connectedAccounts.find(a => a.id === selectedAccountIds[0])?.username}</strong>
                  </span>
                ) : (
                  <span>
                    Posting to: <strong>{connectedAccounts.find(a => a.id === selectedAccountIds[0])?.username}</strong>,{' '}
                    <strong>{connectedAccounts.find(a => a.id === selectedAccountIds[1])?.username}</strong>
                    {selectedAccountIds.length > 2 && ` (+${selectedAccountIds.length - 2} more)`}
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="border-t border-slate-200 mt-6 pt-6">
              <h3 className="text-sm font-medium text-slate-900 mb-3">Post content</h3>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Caption
              </label>
              <textarea
                id="content"
                placeholder="Write your caption… (Kurdish, Arabic or English)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                rows={4}
                data-testid="input-post-content"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>{content.length} characters</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 hover:bg-slate-50"
                  onClick={() => console.log('AI suggestion clicked')}
                >
                  <span>✨</span>
                  <span>AI suggestion</span>
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div className="border-t border-slate-200 mt-6 pt-6">
              <h3 className="text-sm font-medium text-slate-900 mb-1">Media</h3>
              <p className="text-xs text-slate-500 mb-3">
                Add images, videos or report snapshots to this post.
              </p>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="mb-3 flex items-center justify-between">
                  <label htmlFor="media-upload">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      onClick={() => document.getElementById('media-upload')?.click()}
                    >
                      <span>＋</span>
                      <span>Add media</span>
                    </button>
                  </label>
                  <input
                    id="media-upload"
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <span className="text-[11px] text-slate-400">
                    Supported: images, videos, report screenshots.
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto">
                  {mediaItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setPrimaryMediaId(item.id)}
                      className="relative w-32 flex-shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100"
                    >
                      <div className="aspect-[4/3] overflow-hidden rounded-t-xl bg-slate-200">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.label}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[11px] text-slate-500">
                            No preview
                          </div>
                        )}
                      </div>
                      <div className="px-2 py-1.5">
                        <p className="line-clamp-2 text-[11px] font-medium text-slate-800">
                          {item.label}
                        </p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                          {item.type === "report"
                            ? "Report snapshot"
                            : item.type === "video"
                              ? "Video"
                              : "Image"}
                        </p>
                      </div>
                      {primaryMediaId === item.id && (
                        <div className="absolute left-1 top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                          Primary
                        </div>
                      )}
                      {/* Remove button */}
                      <button
                        type="button"
                        className="absolute right-1 top-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] text-white hover:bg-black/90"
                        onClick={e => {
                          e.stopPropagation();
                          setMediaItems(items => items.filter(m => m.id !== item.id));
                          if (primaryMediaId === item.id) {
                            setPrimaryMediaId(null);
                          }
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="border-t border-slate-200 mt-6 pt-6">
              <h3 className="text-sm font-medium text-slate-900 mb-4">Schedule</h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium mb-2 block">Schedule Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start" data-testid="button-select-date">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="w-32">
                  <Label htmlFor="time" className="text-sm font-medium mb-2 block">
                    Time
                  </Label>
                  <input
                    id="time"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    data-testid="input-time"
                  />
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t mt-6">
              <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
                Cancel
              </Button>
              <Button variant="outline" className="gap-2" data-testid="button-ai-assistant">
                <Sparkles className="h-4 w-4" />
                AI Assistant
              </Button>
              <Button onClick={handleSchedule} data-testid="button-schedule-post">
                Schedule Post
              </Button>
            </div>
          </div>

          {/* Right Side - Platform Previews */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              {selectedAccountIds.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[400px] text-center p-8 border-2 border-dashed border-border rounded-lg">
                  <div>
                    <p className="text-muted-foreground">Select accounts to see preview</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Platform Switcher */}
                  {selectedAccountIds.length > 1 && (
                    <div className="flex gap-2 mb-4">
                      {Array.from(new Set(connectedAccounts.filter(a => selectedAccountIds.includes(a.id)).map(a => a.platform))).map(platform => (
                        <button
                          key={platform}
                          onClick={() => setPreviewPlatform(platform)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${(previewPlatform || connectedAccounts.find(a => selectedAccountIds.includes(a.id))?.platform) === platform
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Phone Frame Preview */}
                  <div className="rounded-3xl border border-slate-300 bg-slate-50 p-3">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                      {(() => {
                        const activePlatform = previewPlatform || connectedAccounts.find(a => selectedAccountIds.includes(a.id))?.platform;
                        const activeAccount = connectedAccounts.find(a => a.platform === activePlatform && selectedAccountIds.includes(a.id));

                        if (!activeAccount) return null;

                        // Instagram Preview
                        if (activePlatform === 'instagram') {
                          return (
                            <div className="space-y-0">
                              {/* Instagram Header */}
                              <div className="p-3 border-b flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={activeAccount.avatar} />
                                  <AvatarFallback>{activeAccount.username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-sm">{activeAccount.username}</span>
                              </div>

                              {/* Instagram Media */}
                              {primaryMedia ? (
                                <div className="aspect-square bg-gray-100">
                                  <img src={primaryMedia.thumbnailUrl} alt={primaryMedia.label} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="aspect-square bg-gray-50 flex items-center justify-center">
                                  <p className="text-sm text-muted-foreground">No media selected</p>
                                </div>
                              )}

                              {/* Instagram Actions */}
                              <div className="p-3 space-y-2">
                                <div className="flex gap-4">
                                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                  </svg>
                                </div>
                                <p className="text-sm">
                                  <span className="font-semibold mr-1">{activeAccount.username}</span>
                                  {content || 'Your post content will appear here...'}
                                </p>
                              </div>

                              <div className="px-3 pb-3 text-xs text-muted-foreground border-t pt-2">
                                Instagram Preview
                              </div>
                            </div>
                          );
                        }

                        // Facebook Preview
                        if (activePlatform === 'facebook') {
                          return (
                            <div className="space-y-0">
                              {/* Facebook Header */}
                              <div className="p-3 border-b">
                                <div className="flex items-center gap-2 mb-2">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={activeAccount.avatar} />
                                    <AvatarFallback>{activeAccount.username[0].toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold text-sm">{activeAccount.username}</p>
                                    <p className="text-xs text-muted-foreground">Just now · 🌐</p>
                                  </div>
                                </div>
                                {content && (
                                  <p className="text-sm mb-2">{content}</p>
                                )}
                              </div>

                              {/* Facebook Media */}
                              {primaryMedia ? (
                                <div className="bg-gray-100">
                                  <img src={primaryMedia.thumbnailUrl} alt={primaryMedia.label} className="w-full object-cover max-h-96" />
                                </div>
                              ) : (
                                <div className="aspect-video bg-gray-50 flex items-center justify-center">
                                  <p className="text-sm text-muted-foreground">No media selected</p>
                                </div>
                              )}

                              {/* Facebook Reactions */}
                              <div className="p-3 border-t">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <button className="flex items-center gap-1 hover:text-blue-600">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                    Like
                                  </button>
                                  <button className="flex items-center gap-1 hover:text-blue-600">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Comment
                                  </button>
                                  <button className="flex items-center gap-1 hover:text-blue-600">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    Share
                                  </button>
                                </div>
                              </div>

                              <div className="px-3 pb-3 text-xs text-muted-foreground border-t pt-2">
                                Facebook Preview
                              </div>
                            </div>
                          );
                        }

                        // TikTok Preview
                        if (activePlatform === 'tiktok') {
                          return (
                            <div className="space-y-0 bg-black">
                              {/* TikTok Vertical Video */}
                              <div className="relative aspect-[9/16] bg-gray-900">
                                {primaryMedia ? (
                                  <img src={primaryMedia.thumbnailUrl} alt={primaryMedia.label} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <p className="text-sm text-white/70">No media selected</p>
                                  </div>
                                )}

                                {/* TikTok Overlay UI */}
                                <div className="absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-black/60 to-transparent">
                                  {/* Bottom Left - Caption and User */}
                                  <div className="text-white space-y-2 mb-16">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-8 w-8 border-2 border-white">
                                        <AvatarImage src={activeAccount.avatar} />
                                        <AvatarFallback>{activeAccount.username[0].toUpperCase()}</AvatarFallback>
                                      </Avatar>
                                      <span className="font-semibold text-sm">@{activeAccount.username}</span>
                                    </div>
                                    {content && (
                                      <p className="text-sm line-clamp-3">{content}</p>
                                    )}
                                  </div>
                                </div>

                                {/* Right Side Actions */}
                                <div className="absolute right-3 bottom-20 flex flex-col gap-4 items-center text-white">
                                  <div className="flex flex-col items-center">
                                    <svg className="h-8 w-8 mb-1" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                    <span className="text-xs">125K</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <svg className="h-8 w-8 mb-1" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                                    </svg>
                                    <span className="text-xs">1.2K</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <svg className="h-8 w-8 mb-1" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                                    </svg>
                                    <span className="text-xs">Share</span>
                                  </div>
                                </div>
                              </div>

                              <div className="px-3 py-2 text-xs text-white/50 bg-black">
                                TikTok Preview
                              </div>
                            </div>
                          );
                        }

                        // Default fallback
                        return null;
                      })()}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog >
  );
}
