import { useState } from 'react';
import { X, Edit2, Trash2, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { SiFacebook, SiInstagram, SiTiktok } from 'react-icons/si';
import { useApp } from '@/lib/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { Post, Platform } from '@/lib/types';

interface PostDetailModalProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostDetailModal({ post, open, onOpenChange }: PostDetailModalProps) {
  const { updatePost, deletePost } = useApp();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  if (!post) return null;

  const platformIcons = {
    facebook: { icon: SiFacebook, color: '#1877F2', name: 'Facebook' },
    instagram: { icon: SiInstagram, color: '#E4405F', name: 'Instagram' },
    tiktok: { icon: SiTiktok, color: '#000000', name: 'TikTok' },
  };

  const handleEdit = () => {
    setEditedContent(post.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const updatedPost = {
      ...post,
      content: editedContent,
    };
    
    updatePost(updatedPost);
    
    toast({
      title: 'Post updated',
      description: 'Your post has been updated successfully',
    });
    
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePost(post.id);
      onOpenChange(false);
      
      toast({
        title: 'Post deleted',
        description: 'The post has been removed from your schedule',
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="modal-post-detail">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Post Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Platforms */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Platforms</Label>
            <div className="flex gap-2">
              {post.platforms.map((platform) => {
                const PlatformIcon = platformIcons[platform].icon;
                return (
                  <Badge key={platform} variant="secondary" className="gap-2">
                    <PlatformIcon className="h-3 w-3" />
                    {platformIcons[platform].name}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Scheduled Date */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Scheduled For</Label>
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(post.scheduledDate), 'EEEE, MMMM d, yyyy')}</span>
              <Clock className="h-4 w-4 text-muted-foreground ml-2" />
              <span>{format(new Date(post.scheduledDate), 'h:mm a')}</span>
            </div>
          </div>

          {/* Status */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Status</Label>
            <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
              {post.status}
            </Badge>
          </div>

          {/* Content */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Content</Label>
            {isEditing ? (
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[120px] resize-none"
                data-testid="textarea-edit-content"
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                {post.content}
              </p>
            )}
          </div>

          {/* Image Preview */}
          {post.imageUrl && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Image</Label>
              <img
                src={post.imageUrl}
                alt="Post"
                className="rounded-md max-h-64 object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit} data-testid="button-cancel-edit">
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} data-testid="button-save-edit">
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close">
                  Close
                </Button>
                <Button variant="outline" onClick={handleEdit} className="gap-2" data-testid="button-edit-post">
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={handleDelete} className="gap-2" data-testid="button-delete-post">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
