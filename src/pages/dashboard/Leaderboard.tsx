import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, TrendingUp, Crown, Zap, Target, Youtube, Eye, Users, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { subDays, subWeeks, subMonths, isAfter } from 'date-fns';

type TimeFilter = 'daily' | 'weekly' | 'monthly' | 'all';

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  // Fetch YouTube channels with user profiles for leaderboard
  const { data: leaderboardData } = useQuery({
    queryKey: ['youtube-leaderboard', timeFilter],
    queryFn: async () => {
      // Calculate date filter
      let dateThreshold: Date | null = null;
      const now = new Date();
      
      switch (timeFilter) {
        case 'daily':
          dateThreshold = subDays(now, 1);
          break;
        case 'weekly':
          dateThreshold = subWeeks(now, 1);
          break;
        case 'monthly':
          dateThreshold = subMonths(now, 1);
          break;
        default:
          dateThreshold = null;
      }

      // Get all YouTube channels
      let query = supabase
        .from('youtube_channels')
        .select('*')
        .order('subscriber_count', { ascending: false });
      
      // Apply date filter if not "all time"
      if (dateThreshold) {
        query = query.gte('updated_at', dateThreshold.toISOString());
      }
      
      const { data: channels, error } = await query;

      if (error) throw error;
      if (!channels || channels.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(channels.map(c => c.user_id))];
      
      // Get profiles for these users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      // Aggregate stats per user (sum all their channels)
      const userStats = userIds.map(userId => {
        const userChannels = channels.filter(c => c.user_id === userId);
        const totalSubscribers = userChannels.reduce((sum, c) => sum + (c.subscriber_count || 0), 0);
        const totalViews = userChannels.reduce((sum, c) => sum + (Number(c.view_count) || 0), 0);
        const totalVideos = userChannels.reduce((sum, c) => sum + (c.video_count || 0), 0);
        const profile = profiles?.find(p => p.user_id === userId);
        
        // Get the top channel by subscribers for display
        const topChannel = userChannels.reduce((top, current) => 
          (current.subscriber_count || 0) > (top?.subscriber_count || 0) ? current : top
        , userChannels[0]);
        
        return {
          user_id: userId,
          profile,
          channels: userChannels,
          top_channel: topChannel,
          channel_count: userChannels.length,
          total_subscribers: totalSubscribers,
          total_views: totalViews,
          total_videos: totalVideos,
          // Score based on subscribers + views (views weighted less)
          score: totalSubscribers + Math.floor(totalViews / 1000),
        };
      });

      // Sort by score (subscribers + views)
      return userStats
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));
    },
    enabled: !!user,
  });

  const myEntry = leaderboardData?.find(l => l.user_id === user?.id);
  const myRank = myEntry?.rank;

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <Crown className="w-6 h-6 text-yellow-900" />
          </div>
        );
      case 2:
        return (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg shadow-gray-400/30">
            <Medal className="w-6 h-6 text-gray-800" />
          </div>
        );
      case 3:
        return (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Medal className="w-6 h-6 text-amber-900" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-lg font-bold text-muted-foreground">{rank}</span>
          </div>
        );
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'daily': return 'Today';
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      default: return 'All Time';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Channel Leaderboard</h1>
          <p className="text-muted-foreground mt-1">
            Top creators ranked by YouTube channel performance.
          </p>
        </div>
        
        {/* Time Filter Tabs */}
        <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="daily" className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top 3 Podium */}
          {leaderboardData && leaderboardData.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 items-end">
              {/* 2nd Place */}
              <Card className="glass-card text-center order-1">
                <CardContent className="pt-6 pb-4">
                  <div className="relative inline-block mb-3">
                    <Avatar className="w-16 h-16 ring-4 ring-gray-400/30">
                      <AvatarImage src={leaderboardData[1]?.profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-gray-400/10 text-gray-300 text-xl">
                        {leaderboardData[1]?.profile?.full_name?.charAt(0) || '2'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 text-2xl">🥈</div>
                  </div>
                  <h3 className="font-medium truncate text-sm">{leaderboardData[1]?.profile?.full_name || 'User'}</h3>
                  <p className="text-xs text-muted-foreground truncate">@{(leaderboardData[1]?.profile as any)?.handle || leaderboardData[1]?.profile?.full_name?.toLowerCase().replace(/\s+/g, '_')}</p>
                  <p className="text-lg font-bold text-primary mt-1">{formatNumber(leaderboardData[1]?.total_subscribers)}</p>
                  <p className="text-xs text-muted-foreground">subscribers</p>
                </CardContent>
              </Card>

              {/* 1st Place */}
              <Card className="glass-card text-center order-2 border-yellow-500/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent" />
                <CardContent className="pt-8 pb-6 relative">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2">
                    <Crown className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="relative inline-block mb-3">
                    <Avatar className="w-20 h-20 ring-4 ring-yellow-500/50">
                      <AvatarImage src={leaderboardData[0]?.profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-yellow-500/10 text-yellow-500 text-2xl">
                        {leaderboardData[0]?.profile?.full_name?.charAt(0) || '1'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 text-3xl">🥇</div>
                  </div>
                  <h3 className="font-semibold truncate">{leaderboardData[0]?.profile?.full_name || 'User'}</h3>
                  <p className="text-xs text-muted-foreground truncate">@{(leaderboardData[0]?.profile as any)?.handle || leaderboardData[0]?.profile?.full_name?.toLowerCase().replace(/\s+/g, '_')}</p>
                  <p className="text-2xl font-bold gradient-text mt-1">{formatNumber(leaderboardData[0]?.total_subscribers)}</p>
                  <p className="text-xs text-muted-foreground">subscribers</p>
                </CardContent>
              </Card>

              {/* 3rd Place */}
              <Card className="glass-card text-center order-3">
                <CardContent className="pt-6 pb-4">
                  <div className="relative inline-block mb-3">
                    <Avatar className="w-16 h-16 ring-4 ring-amber-600/30">
                      <AvatarImage src={leaderboardData[2]?.profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-amber-600/10 text-amber-500 text-xl">
                        {leaderboardData[2]?.profile?.full_name?.charAt(0) || '3'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 text-2xl">🥉</div>
                  </div>
                  <h3 className="font-medium truncate text-sm">{leaderboardData[2]?.profile?.full_name || 'User'}</h3>
                  <p className="text-xs text-muted-foreground truncate">@{(leaderboardData[2]?.profile as any)?.handle || leaderboardData[2]?.profile?.full_name?.toLowerCase().replace(/\s+/g, '_')}</p>
                  <p className="text-lg font-bold text-primary mt-1">{formatNumber(leaderboardData[2]?.total_subscribers)}</p>
                  <p className="text-xs text-muted-foreground">subscribers</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Full Rankings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Rankings
                </span>
                <Badge variant="outline" className="font-normal">
                  {getTimeFilterLabel()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardData && leaderboardData.length > 0 ? (
                  leaderboardData.map((entry) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                        entry.user_id === user?.id
                          ? 'bg-primary/10 border border-primary/30'
                          : 'bg-secondary/50 hover:bg-secondary'
                      }`}
                    >
                      {getRankBadge(entry.rank)}
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={entry.profile?.avatar_url || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {entry.profile?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">
                            {entry.profile?.full_name || 'Unknown User'}
                          </p>
                          {entry.user_id === user?.id && (
                            <Badge variant="secondary" className="text-xs shrink-0">You</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          @{(entry.profile as any)?.handle || entry.profile?.full_name?.toLowerCase().replace(/\s+/g, '_')}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="font-bold text-lg flex items-center gap-1 justify-center">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            {formatNumber(entry.total_views)}
                          </p>
                          <p className="text-xs text-muted-foreground">views</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-lg flex items-center gap-1 justify-center text-primary">
                            <Users className="w-4 h-4" />
                            {formatNumber(entry.total_subscribers)}
                          </p>
                          <p className="text-xs text-muted-foreground">subscribers</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Youtube className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No channel activity for {getTimeFilterLabel().toLowerCase()}.</p>
                    <p className="text-sm">Try selecting a different time period.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Your Stats */}
          <Card className="glass-card border-primary/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Rank</span>
                <Badge className="badge-info">
                  #{myRank || 'N/A'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Channels</span>
                <span className="font-bold text-xl">{myEntry?.channel_count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Subscribers</span>
                <span className="font-bold text-xl text-primary">{formatNumber(myEntry?.total_subscribers || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Views</span>
                <span className="font-bold">{formatNumber(myEntry?.total_views || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Videos</span>
                <span className="font-bold">{myEntry?.total_videos || 0}</span>
              </div>
              {myEntry?.top_channel && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Top Channel</p>
                  <div className="flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-destructive" />
                    <span className="font-medium text-sm truncate">{myEntry.top_channel.channel_name}</span>
                  </div>
                </div>
              )}
              {!myEntry && (
                <div className="pt-4 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Add your YouTube channel to start competing!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Channels */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Top Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardData && leaderboardData.length > 0 ? (
                  leaderboardData.slice(0, 5).flatMap(entry => 
                    entry.channels.slice(0, 1).map(channel => (
                      <div
                        key={channel.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                          <Youtube className="w-5 h-5 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{channel.channel_name}</p>
                          <p className="text-xs text-muted-foreground truncate">by {entry.profile?.full_name || channel.creator_name}</p>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {formatNumber(channel.subscriber_count || 0)} subs
                        </Badge>
                      </div>
                    ))
                  )
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No channels yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* How to Climb */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                How to Climb
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-muted-foreground">Add your YouTube channel to the Channel Store</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-muted-foreground">Grow your subscribers and views</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-muted-foreground">Stats refresh automatically to update your rank</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
