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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="modal-create-post">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Create Post</DialogTitle>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
}
