import React, { useState } from 'react';
import { useChannels, useCreateChannel, useDeleteChannel } from '@/hooks/useChannels';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Youtube, Plus, ExternalLink, Trash2, Users, Video, Search } from 'lucide-react';
import { format } from 'date-fns';

const ChannelStore: React.FC = () => {
  const { role } = useAuth();
  const { data: channels, isLoading } = useChannels();
  const createChannel = useCreateChannel();
  const deleteChannel = useDeleteChannel();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    channel_name: '',
    channel_link: '',
    creator_name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.channel_name || !formData.channel_link || !formData.creator_name) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createChannel.mutateAsync(formData);
      toast({
        title: 'Channel added!',
        description: 'Your channel has been added to the store.',
      });
      setFormData({
        channel_name: '',
        channel_link: '',
        creator_name: '',
        description: '',
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add channel. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteChannel.mutateAsync(id);
      toast({
        title: 'Channel removed',
        description: 'The channel has been removed from the store.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove channel. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredChannels = channels?.filter(
    (channel) =>
      channel.channel_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.creator_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Channel Store</h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage YouTube channels in the community.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Channel
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>Add Your Channel</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="creator_name">Your Name *</Label>
                <Input
                  id="creator_name"
                  placeholder="Enter your name"
                  value={formData.creator_name}
                  onChange={(e) => setFormData({ ...formData, creator_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="channel_name">Channel Name *</Label>
                <Input
                  id="channel_name"
                  placeholder="Enter channel name"
                  value={formData.channel_name}
                  onChange={(e) => setFormData({ ...formData, channel_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="channel_link">Channel Link *</Label>
                <Input
                  id="channel_link"
                  placeholder="https://youtube.com/@yourchannel"
                  value={formData.channel_link}
                  onChange={(e) => setFormData({ ...formData, channel_link: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your channel..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createChannel.isPending}>
                {createChannel.isPending ? 'Adding...' : 'Add Channel'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search channels or creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Channels Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading channels...</p>
        </div>
      ) : filteredChannels?.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <Youtube className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No channels yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to add your channel to the store!
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your Channel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChannels?.map((channel) => (
            <Card key={channel.id} className="glass-card-hover group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <Youtube className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <CardTitle className="text-lg line-clamp-1">
                        {channel.channel_name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">by {channel.creator_name}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {channel.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {channel.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{channel.subscriber_count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    <span>{channel.video_count}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(channel.channel_link, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Channel
                  </Button>
                  {(role === 'admin' || role === 'manager') && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(channel.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Added {format(new Date(channel.created_at), 'MMM d, yyyy')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChannelStore;
