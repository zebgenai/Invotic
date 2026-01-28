import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useChannels } from '@/hooks/useChannels';
import { useYouTubeAnalytics, formatCount, formatDuration } from '@/hooks/useYouTubeAnalytics';
import {
  Youtube,
  Eye,
  Users,
  PlayCircle,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  Clock,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';

interface ChannelAnalyticsCardProps {
  channelLink: string;
  channelName: string;
}

const ChannelAnalyticsCard: React.FC<ChannelAnalyticsCardProps> = ({ channelLink, channelName }) => {
  const { data, isLoading, error, lastFetched, refetch } = useYouTubeAnalytics(channelLink, 0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="glass-card border-destructive/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Youtube className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="font-medium">{channelName}</p>
                <p className="text-sm text-destructive">{error || 'Unable to fetch analytics'}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card hover:border-primary/30 transition-colors">
      <CardContent className="pt-6">
        {/* Channel Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <img
              src={data.thumbnail_url}
              alt={data.channel_name}
              className="w-14 h-14 rounded-full ring-2 ring-primary/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{data.channel_name}</h3>
                {data.custom_url && (
                  <a
                    href={`https://youtube.com/${data.custom_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              {data.country && (
                <Badge variant="outline" className="text-xs mt-1">
                  {data.country}
                </Badge>
              )}
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold">{formatCount(data.subscriber_count)}</p>
            <p className="text-xs text-muted-foreground">Subscribers</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <div className="flex items-center justify-center gap-1 text-info mb-1">
              <Eye className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold">{formatCount(data.view_count)}</p>
            <p className="text-xs text-muted-foreground">Total Views</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <div className="flex items-center justify-center gap-1 text-destructive mb-1">
              <PlayCircle className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold">{formatCount(data.video_count)}</p>
            <p className="text-xs text-muted-foreground">Videos</p>
          </div>
        </div>

        {/* Latest Videos */}
        {data.latest_videos && data.latest_videos.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Latest Videos
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {data.latest_videos.slice(0, 3).map((video) => (
                <a
                  key={video.id}
                  href={`https://youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-20 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{video.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatCount(video.view_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {formatCount(video.like_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(video.duration)}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        {lastFetched && (
          <p className="text-xs text-muted-foreground mt-3 text-right">
            Updated {format(lastFetched, 'MMM d, h:mm a')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const YouTubeAnalyticsSection: React.FC = () => {
  const { data: channels, isLoading } = useChannels();

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-destructive" />
            YouTube Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!channels || channels.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-destructive" />
            YouTube Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Youtube className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No YouTube channels registered yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add channels in the Channel Store to see analytics here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Youtube className="w-5 h-5 text-destructive" />
          YouTube Channel Analytics
        </h2>
        <Badge variant="outline">{channels.length} Channel{channels.length !== 1 ? 's' : ''}</Badge>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {channels.map((channel) => (
          <ChannelAnalyticsCard
            key={channel.id}
            channelLink={channel.channel_link}
            channelName={channel.channel_name}
          />
        ))}
      </div>
    </div>
  );
};

export default YouTubeAnalyticsSection;
