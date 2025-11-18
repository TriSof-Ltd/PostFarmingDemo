import { useState, useEffect } from 'react';
import { X, Upload, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import { SiFacebook, SiInstagram, SiTiktok } from 'react-icons/si';
import { useApp } from '@/lib/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { Platform } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
  const { currentClient, addPost } = useApp();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('10:00');

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

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
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

    if (selectedPlatforms.length === 0) {
      toast({
        title: 'Select platforms',
        description: 'Please select at least one platform',
        variant: 'destructive',
      });
      return;
    }

    const scheduledDate = selectedDate
      ? new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`)
      : new Date(Date.now() + 3600000); // Default to 1 hour from now

    const newPost = {
      id: Date.now().toString(),
      clientId: currentClient.id,
      platforms: selectedPlatforms,
      content,
      imageUrl: imagePreview || undefined,
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
    setSelectedPlatforms([]);
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
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Create Post</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Form */}
          <div className="space-y-6">
            {/* Platform Selection */}
            <div>
            <Label className="text-sm font-medium mb-3 block">Select Accounts</Label>
            <div className="flex gap-4">
              {connectedAccounts.map((account) => {
                const platformInfo = platformIcons[account.platform];
                const Icon = platformInfo.icon;
                const isSelected = selectedPlatforms.includes(account.platform);

                return (
                  <button
                    key={account.id}
                    onClick={() => togglePlatform(account.platform)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover-elevate ${
                      isSelected ? 'border-primary bg-accent' : 'border-border'
                    }`}
                    data-testid={`platform-${account.platform}`}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={account.avatar} alt={account.username} />
                        <AvatarFallback>{account.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div
                        className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: platformInfo.color }}
                      >
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <span className="text-xs font-medium">{account.username}</span>
                  </button>
                );
              })}
            </div>
            </div>

            {/* Content */}
            <div>
            <Label htmlFor="content" className="text-sm font-medium mb-2 block">
              What would you like to share?
            </Label>
            <Textarea
              id="content"
              placeholder="What would you like to share?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] resize-none"
              data-testid="input-post-content"
            />
            </div>

            {/* Image Upload */}
            <div>
            <Label className="text-sm font-medium mb-2 block">Media</Label>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full rounded-lg max-h-[300px] object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setImagePreview(null)}
                  data-testid="button-remove-image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover-elevate"
                data-testid="dropzone-image"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Drag & drop or select a file</span>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  data-testid="input-image-upload"
                />
              </label>
            )}
            </div>

            {/* Schedule */}
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

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
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
          <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            {selectedPlatforms.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[400px] text-center p-8 border-2 border-dashed border-border rounded-lg">
                <div>
                  <p className="text-muted-foreground">Select platforms to see preview</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedPlatforms.includes('instagram') && (
                  <div className="border rounded-lg overflow-hidden bg-white" data-testid="preview-instagram">
                    <div className="p-3 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border border-gray-300">
                          <AvatarImage src={connectedAccounts.find(a => a.platform === 'instagram')?.avatar} />
                          <AvatarFallback>IG</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">
                          {connectedAccounts.find(a => a.platform === 'instagram')?.username}
                        </span>
                      </div>
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    {imagePreview ? (
                      <div className="aspect-square bg-gray-100">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-50 flex items-center justify-center border-b">
                        <div className="text-center p-6">
                          <p className="text-sm text-muted-foreground">Nothing to preview, please upload a file</p>
                        </div>
                      </div>
                    )}
                    <div className="p-3">
                      <div className="flex items-center gap-4 mb-2">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <svg className="h-6 w-6 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        <span className="font-semibold mr-1">
                          {connectedAccounts.find(a => a.platform === 'instagram')?.username}
                        </span>
                        {content || 'Your post content will appear here...'}
                      </p>
                    </div>
                    <div className="px-3 pb-3 text-xs text-muted-foreground border-t pt-2">Instagram Preview</div>
                  </div>
                )}

                {selectedPlatforms.includes('facebook') && (
                  <div className="border rounded-lg overflow-hidden bg-white shadow-sm" data-testid="preview-facebook">
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={connectedAccounts.find(a => a.platform === 'facebook')?.avatar} />
                          <AvatarFallback>FB</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {connectedAccounts.find(a => a.platform === 'facebook')?.username}
                          </div>
                          <div className="text-xs text-muted-foreground">Just now · <svg className="inline h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg> Public</div>
                        </div>
                        <svg className="h-5 w-5 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </div>
                      <p className="text-sm whitespace-pre-wrap mb-3">
                        {content || 'Your post content will appear here...'}
                      </p>
                    </div>
                    {imagePreview ? (
                      <div className="bg-gray-100">
                        <img src={imagePreview} alt="Preview" className="w-full object-cover max-h-96" />
                      </div>
                    ) : (
                      <div className="bg-gray-50 border-t border-b flex items-center justify-center min-h-[200px]">
                        <div className="text-center p-6">
                          <p className="text-sm text-muted-foreground">Nothing to preview, please upload a file</p>
                        </div>
                      </div>
                    )}
                    <div className="px-3 py-2 border-t flex items-center gap-6 text-muted-foreground">
                      <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-sm">Like</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-sm">Comment</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342c-.400 0-.811.036-1.219.08v2.102H5.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h2.965a.5.5 0 00.5-.5v-2.102c.408-.044.819-.08 1.219-.08.416 0 .828.036 1.219.08V18.5a.5.5 0 00.5.5h2.965a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-1.219c-.391-.044-.803-.08-1.219-.08zm5.632 0c-.4 0-.811.036-1.219.08v2.102H11.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h2.965a.5.5 0 00.5-.5v-2.102c.408-.044.819-.08 1.219-.08.416 0 .828.036 1.219.08V18.5a.5.5 0 00.5.5h2.965a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-1.219c-.391-.044-.803-.08-1.219-.08z" />
                        </svg>
                        <span className="text-sm">Share</span>
                      </button>
                    </div>
                    <div className="px-3 pb-3 pt-2 text-xs text-muted-foreground">Facebook Preview</div>
                  </div>
                )}

                {selectedPlatforms.includes('tiktok') && (
                  <div className="border rounded-lg overflow-hidden bg-black text-white" data-testid="preview-tiktok">
                    <div className="relative">
                      {imagePreview ? (
                        <div className="aspect-[9/16] max-h-[500px] bg-black">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="aspect-[9/16] max-h-[500px] bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                          <div className="text-center p-6">
                            <p className="text-sm text-white/70">Nothing to preview, please upload a file</p>
                          </div>
                        </div>
                      )}
                      {imagePreview && (
                        <div className="absolute top-4 right-4 flex flex-col gap-3">
                          <div className="flex flex-col items-center gap-1">
                            <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.12-5.91 3.22-2.34.09-4.68-.31-6.72-1.74-.98-.84-1.8-1.79-2.38-2.93-1.14-1.83-1.61-3.99-1.58-6.15.02-1.4.24-2.8.68-4.12.88-2.65 2.7-4.89 5.32-6.05 1.52-.69 3.17-1.04 4.84-1.18v-.01zm-.47 1.98c-1.5.02-2.99.2-4.43.62-2.22.84-4.07 2.5-5.09 4.65-.82 1.72-1.05 3.63-.68 5.49.37 1.87 1.18 3.63 2.37 5.1 1.19 1.47 2.8 2.68 4.6 3.49 2.27 1.02 4.86 1.18 7.25.5 2.39-.68 4.5-2.25 5.88-4.4 1.38-2.15 1.65-4.68.77-7.05-.88-2.37-2.65-4.4-4.9-5.75-1.25-.75-2.65-1.22-4.08-1.44z"/>
                              </svg>
                            </div>
                            <span className="text-xs font-semibold">0</span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                            </div>
                            <span className="text-xs font-semibold">0</span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                            </div>
                            <span className="text-xs font-semibold">0</span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                            </div>
                            <span className="text-xs font-semibold">0</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-8 w-8 border-2 border-white">
                            <AvatarImage src={connectedAccounts.find(a => a.platform === 'tiktok')?.avatar} />
                            <AvatarFallback>TT</AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-sm">
                            @{connectedAccounts.find(a => a.platform === 'tiktok')?.username.replace('@', '')}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {content || 'Your post content will appear here...'}
                        </p>
                      </div>
                    </div>
                    <div className="px-3 pb-3 pt-2 text-xs text-white/50">TikTok Preview</div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
