import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube, Users, Eye, Video, TrendingUp } from 'lucide-react';
import { YouTubeChannel } from '@/types/database';

interface ChannelStatsDashboardProps {
  channels: YouTubeChannel[];
}

const ChannelStatsDashboard: React.FC<ChannelStatsDashboardProps> = ({ channels }) => {
  const totalChannels = channels.length;
  const totalSubscribers = channels.reduce((sum, ch) => sum + (ch.subscriber_count || 0), 0);
  const totalViews = channels.reduce((sum, ch) => sum + (ch.view_count || 0), 0);
  const totalVideos = channels.reduce((sum, ch) => sum + (ch.video_count || 0), 0);

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const stats = [
    {
      title: 'Total Channels',
      value: totalChannels,
      icon: Youtube,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Total Subscribers',
      value: formatNumber(totalSubscribers),
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Views',
      value: formatNumber(totalViews),
      icon: Eye,
      color: 'text-accent-foreground',
      bgColor: 'bg-accent/50',
    },
    {
      title: 'Total Videos',
      value: formatNumber(totalVideos),
      icon: Video,
      color: 'text-secondary-foreground',
      bgColor: 'bg-secondary',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ChannelStatsDashboard;
