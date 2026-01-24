import React, { useState } from 'react';
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '@/hooks/useAnnouncements';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Megaphone, Plus, Pin, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const Announcements: React.FC = () => {
  const { role } = useAuth();
  const { data: announcements, isLoading } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_pinned: false,
  });

  const isAdmin = role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createAnnouncement.mutateAsync(formData);
      toast({
        title: 'Announcement published!',
        description: 'Your announcement has been sent to all users.',
      });
      setFormData({ title: '', content: '', is_pinned: false });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish announcement. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement.mutateAsync(id);
      toast({
        title: 'Announcement deleted',
        description: 'The announcement has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete announcement. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const pinnedAnnouncements = announcements?.filter((a) => a.is_pinned) || [];
  const regularAnnouncements = announcements?.filter((a) => !a.is_pinned) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Announcements</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? 'Broadcast messages to all users.' : 'Stay updated with the latest news.'}
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter announcement title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your announcement..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={5}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_pinned"
                      checked={formData.is_pinned}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_pinned: checked })}
                    />
                    <Label htmlFor="is_pinned">Pin this announcement</Label>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createAnnouncement.isPending}>
                  {createAnnouncement.isPending ? 'Publishing...' : 'Publish Announcement'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading announcements...</p>
        </div>
      ) : announcements?.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No announcements yet</h3>
            <p className="text-muted-foreground">
              {isAdmin
                ? 'Create your first announcement to notify users.'
                : 'Check back later for updates.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pinned Announcements */}
          {pinnedAnnouncements.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                <Pin className="w-4 h-4 text-primary" />
                Pinned
              </h2>
              {pinnedAnnouncements.map((announcement) => (
                <Card key={announcement.id} className="glass-card border-primary/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="badge-info">Pinned</Badge>
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      </div>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(announcement.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                      Published {format(new Date(announcement.created_at), 'MMMM d, yyyy • h:mm a')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Regular Announcements */}
          {regularAnnouncements.length > 0 && (
            <div className="space-y-4">
              {pinnedAnnouncements.length > 0 && (
                <h2 className="text-lg font-display font-semibold">Recent</h2>
              )}
              {regularAnnouncements.map((announcement) => (
                <Card key={announcement.id} className="glass-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(announcement.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                      Published {format(new Date(announcement.created_at), 'MMMM d, yyyy • h:mm a')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Announcements;
