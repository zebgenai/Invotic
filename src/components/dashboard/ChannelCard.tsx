import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCount, formatDuration } from '@/hooks/useYouTubeAnalytics';
import { YouTubeChannel } from '@/types/database';
import {
  Youtube,
  ExternalLink,
  Trash2,
  Users,
  Video,
  Pencil,
  Eye,
  RefreshCw,
  TrendingUp,
  ThumbsUp,
  Clock,
  PlayCircle,
} from 'lucide-react';
import { safeFormatDate } from '@/lib/utils';

interface ChannelCardProps {
  channel: YouTubeChannel;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onCreatorClick?: () => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onRefresh,
  isRefreshing,
  onCreatorClick,
}) => {
  const [showVideos, setShowVideos] = useState(false);

  // Use stored database data (no live API calls to save Cloud resources)
  const displayData = {
    channel_name: channel.channel_name,
    thumbnail_url: null as string | null,
    subscriber_count: channel.subscriber_count || 0,
    video_count: channel.video_count || 0,
    view_count: channel.view_count || 0,
    country: null as string | null,
    custom_url: null as string | null,
    latest_videos: [] as any[],
  };
  const isLoadingLive = false;

  return (
    <Card className="glass-card-hover group overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {isLoadingLive ? (
              <Skeleton className="w-12 h-12 rounded-full" />
            ) : displayData.thumbnail_url ? (
              <img
                src={displayData.thumbnail_url}
                alt={channel.channel_name}
                className="w-12 h-12 rounded-full ring-2 ring-primary/20 object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Youtube className="w-6 h-6 text-destructive" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg line-clamp-1">
                  {displayData.channel_name || channel.channel_name}
                </CardTitle>
                {displayData.country && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    {displayData.country}
                  </Badge>
                )}
              </div>
              <p
                className={`text-sm text-muted-foreground ${onCreatorClick ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                onClick={onCreatorClick}
              >by {channel.creator_name}</p>
            </div>
          </div>
          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-secondary/50 text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <Users className="w-3 h-3" />
            </div>
            {isLoadingLive ? (
              <Skeleton className="h-5 w-12 mx-auto" />
            ) : (
              <p className="text-sm font-bold">{formatCount(displayData.subscriber_count)}</p>
            )}
            <p className="text-xs text-muted-foreground">Subs</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/50 text-center">
            <div className="flex items-center justify-center gap-1 text-info mb-1">
              <Eye className="w-3 h-3" />
            </div>
            {isLoadingLive ? (
              <Skeleton className="h-5 w-12 mx-auto" />
            ) : (
              <p className="text-sm font-bold">{formatCount(displayData.view_count)}</p>
            )}
            <p className="text-xs text-muted-foreground">Views</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/50 text-center">
            <div className="flex items-center justify-center gap-1 text-destructive mb-1">
              <PlayCircle className="w-3 h-3" />
            </div>
            {isLoadingLive ? (
              <Skeleton className="h-5 w-12 mx-auto" />
            ) : (
              <p className="text-sm font-bold">{formatCount(displayData.video_count)}</p>
            )}
            <p className="text-xs text-muted-foreground">Videos</p>
          </div>
        </div>

        {/* Latest Videos Toggle */}
        {/* Latest videos section removed - data only available on manual refresh */}

        {/* Description */}
        {channel.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {channel.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.open(channel.channel_link, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit
          </Button>
          {canEdit && (
            <Button variant="outline" size="icon" onClick={onEdit}>
              <Pencil className="w-4 h-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          Added {safeFormatDate(channel.created_at, 'MMM d, yyyy')}
        </p>
      </CardContent>
    </Card>
  );
};

export default ChannelCard;