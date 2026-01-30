import React, { useState } from 'react';
import { useChannels, useCreateChannel, useUpdateChannel, useDeleteChannel } from '@/hooks/useChannels';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
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
import { Youtube, Plus, Search, Loader2 } from 'lucide-react';
import { YouTubeChannel } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import ChannelCard from '@/components/dashboard/ChannelCard';

const ChannelStore: React.FC = () => {
  const { user, role } = useAuth();
  const { data: channels, isLoading } = useChannels();
  const createChannel = useCreateChannel();
  const updateChannel = useUpdateChannel();
  const deleteChannel = useDeleteChannel();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<YouTubeChannel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [refreshingChannelId, setRefreshingChannelId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    channel_name: '',
    channel_link: '',
    creator_name: '',
    description: '',
  });
  const [editFormData, setEditFormData] = useState({
    channel_name: '',
    channel_link: '',
    creator_name: '',
    description: '',
  });

  const fetchYouTubeData = async (channelLink: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('youtube-channel-data', {
        body: { channel_link: channelLink },
      });

      if (error) throw error;
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch channel data');
      }
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
      return null;
    }
  };

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

    setIsFetchingData(true);
    
    try {
      // Fetch YouTube channel data
      const youtubeData = await fetchYouTubeData(formData.channel_link);
      
      const channelPayload: any = {
        channel_name: youtubeData?.channel_name || formData.channel_name,
        channel_link: formData.channel_link,
        creator_name: formData.creator_name,
        description: youtubeData?.description || formData.description,
      };

      // Add YouTube data if available
      if (youtubeData) {
        channelPayload.youtube_channel_id = youtubeData.youtube_channel_id;
        channelPayload.subscriber_count = youtubeData.subscriber_count;
        channelPayload.video_count = youtubeData.video_count;
        channelPayload.view_count = youtubeData.view_count;
        
        toast({
          title: 'Channel data fetched!',
          description: `Found ${youtubeData.subscriber_count.toLocaleString()} subscribers and ${youtubeData.video_count} videos.`,
        });
      }

      await createChannel.mutateAsync(channelPayload);
      
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
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleRefreshChannelData = async (channel: YouTubeChannel) => {
    setRefreshingChannelId(channel.id);
    
    try {
      const youtubeData = await fetchYouTubeData(channel.channel_link);
      
      if (youtubeData) {
        await updateChannel.mutateAsync({
          id: channel.id,
          youtube_channel_id: youtubeData.youtube_channel_id,
          subscriber_count: youtubeData.subscriber_count,
          video_count: youtubeData.video_count,
          view_count: youtubeData.view_count,
        });
        
        toast({
          title: 'Channel data refreshed!',
          description: `Updated: ${youtubeData.subscriber_count.toLocaleString()} subscribers, ${youtubeData.view_count.toLocaleString()} views.`,
        });
      } else {
        toast({
          title: 'Could not refresh',
          description: 'Unable to fetch latest channel data.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh channel data.',
        variant: 'destructive',
      });
    } finally {
      setRefreshingChannelId(null);
    }
  };

  const handleEdit = (channel: YouTubeChannel) => {
    setEditingChannel(channel);
    setEditFormData({
      channel_name: channel.channel_name,
      channel_link: channel.channel_link,
      creator_name: channel.creator_name,
      description: channel.description || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingChannel) return;
    
    if (!editFormData.channel_name || !editFormData.channel_link || !editFormData.creator_name) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateChannel.mutateAsync({
        id: editingChannel.id,
        ...editFormData,
      });
      toast({
        title: 'Channel updated!',
        description: 'Your channel has been updated successfully.',
      });
      setIsEditDialogOpen(false);
      setEditingChannel(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update channel. Please try again.',
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

  const canEditChannel = (channel: YouTubeChannel) => {
    return channel.user_id === user?.id || role === 'admin' || role === 'manager';
  };

  const canDeleteChannel = (channel: YouTubeChannel) => {
    return channel.user_id === user?.id || role === 'admin' || role === 'manager';
  };


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
                <p className="text-xs text-muted-foreground">
                  We'll automatically fetch subscriber count, views, and video count from YouTube.
                </p>
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
              <Button type="submit" className="w-full" disabled={createChannel.isPending || isFetchingData}>
                {isFetchingData ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fetching YouTube Data...
                  </>
                ) : createChannel.isPending ? (
                  'Adding...'
                ) : (
                  'Add Channel'
                )}
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
            <ChannelCard
              key={channel.id}
              channel={channel}
              canEdit={canEditChannel(channel)}
              canDelete={canDeleteChannel(channel)}
              onEdit={() => handleEdit(channel)}
              onDelete={() => handleDelete(channel.id)}
              onRefresh={() => handleRefreshChannelData(channel)}
              isRefreshing={refreshingChannelId === channel.id}
            />
          ))}
        </div>
      )}

      {/* Edit Channel Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Edit Channel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_creator_name">Your Name *</Label>
              <Input
                id="edit_creator_name"
                placeholder="Enter your name"
                value={editFormData.creator_name}
                onChange={(e) => setEditFormData({ ...editFormData, creator_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_channel_name">Channel Name *</Label>
              <Input
                id="edit_channel_name"
                placeholder="Enter channel name"
                value={editFormData.channel_name}
                onChange={(e) => setEditFormData({ ...editFormData, channel_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_channel_link">Channel Link *</Label>
              <Input
                id="edit_channel_link"
                placeholder="https://youtube.com/@yourchannel"
                value={editFormData.channel_link}
                onChange={(e) => setEditFormData({ ...editFormData, channel_link: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                placeholder="Tell us about your channel..."
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full" disabled={updateChannel.isPending}>
              {updateChannel.isPending ? 'Updating...' : 'Update Channel'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChannelStore;
