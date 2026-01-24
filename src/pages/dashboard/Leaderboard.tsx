import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Star, TrendingUp, Crown, Flame, Zap, Target } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Leaderboard: React.FC = () => {
  const { user } = useAuth();

  const { data: leaderboardData } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data: points, error } = await supabase
        .from('user_points')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get profiles for these users
      const userIds = points.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      return points.map((point, index) => ({
        ...point,
        rank: index + 1,
        profile: profiles?.find(p => p.user_id === point.user_id),
      }));
    },
    enabled: !!user,
  });

  const { data: badges } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('points_required', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: myPoints } = useQuery({
    queryKey: ['my-points'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const myRank = leaderboardData?.findIndex(l => l.user_id === user?.id);

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

  const defaultBadges = [
    { id: '1', name: 'First Upload', icon: '🎬', description: 'Uploaded your first video', points_required: 0 },
    { id: '2', name: 'Rising Star', icon: '⭐', description: 'Reached 1,000 subscribers', points_required: 100 },
    { id: '3', name: 'Consistent Creator', icon: '🔥', description: 'Posted 10 videos in a month', points_required: 250 },
    { id: '4', name: 'Community Leader', icon: '👑', description: 'Helped 50 other creators', points_required: 500 },
    { id: '5', name: 'Viral Hit', icon: '🚀', description: 'Video reached 100k views', points_required: 1000 },
    { id: '6', name: 'Engagement Master', icon: '💬', description: '1000+ comments on content', points_required: 1500 },
  ];

  const displayBadges = badges?.length ? badges : defaultBadges;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">Leaderboard</h1>
        <p className="text-muted-foreground mt-1">
          Top creators in the community based on points and achievements.
        </p>
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
                  <p className="text-xl font-bold gradient-text">{leaderboardData[1]?.total_points?.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">points</p>
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
                  <p className="text-2xl font-bold gradient-text">{leaderboardData[0]?.total_points?.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">points</p>
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
                  <p className="text-xl font-bold gradient-text">{leaderboardData[2]?.total_points?.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Full Rankings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardData?.map((entry) => (
                  <div
                    key={entry.id}
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
                    <div className="flex-1">
                      <p className="font-medium">
                        {entry.profile?.full_name || 'Unknown User'}
                        {entry.user_id === user?.id && (
                          <span className="text-primary text-sm ml-2">(You)</span>
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-sm text-muted-foreground">Level {Math.floor(entry.total_points / 500) + 1}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{entry.total_points.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No leaderboard data yet. Start earning points!
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
                  #{myRank !== undefined && myRank >= 0 ? myRank + 1 : 'N/A'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Points</span>
                <span className="font-bold text-xl">{myPoints?.total_points?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Level</span>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-bold">Level {Math.floor((myPoints?.total_points || 0) / 500) + 1}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Next Level Progress</span>
                  <span className="text-primary">{((myPoints?.total_points || 0) % 500) / 5}%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                    style={{ width: `${((myPoints?.total_points || 0) % 500) / 5}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Badges */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Badges to Earn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {badge.points_required} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* How to Earn Points */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Earn Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Complete a task</span>
                  <span className="font-medium text-success">+50 pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Upload a video</span>
                  <span className="font-medium text-success">+25 pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Help a creator</span>
                  <span className="font-medium text-success">+15 pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Forum reply</span>
                  <span className="font-medium text-success">+10 pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Daily login</span>
                  <span className="font-medium text-success">+5 pts</span>
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
