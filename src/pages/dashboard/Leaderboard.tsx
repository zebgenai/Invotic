import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Star, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data for leaderboard - in real app this would come from the database
const mockLeaderboard = [
  { id: '1', name: 'Alex Johnson', points: 2450, rank: 1, avatar: null, badges: 12 },
  { id: '2', name: 'Sarah Chen', points: 2180, rank: 2, avatar: null, badges: 10 },
  { id: '3', name: 'Mike Wilson', points: 1950, rank: 3, avatar: null, badges: 8 },
  { id: '4', name: 'Emily Davis', points: 1720, rank: 4, avatar: null, badges: 7 },
  { id: '5', name: 'James Brown', points: 1580, rank: 5, avatar: null, badges: 6 },
  { id: '6', name: 'Lisa Anderson', points: 1450, rank: 6, avatar: null, badges: 5 },
  { id: '7', name: 'David Lee', points: 1320, rank: 7, avatar: null, badges: 5 },
  { id: '8', name: 'Emma Thompson', points: 1180, rank: 8, avatar: null, badges: 4 },
  { id: '9', name: 'Chris Martinez', points: 980, rank: 9, avatar: null, badges: 3 },
  { id: '10', name: 'Amy White', points: 850, rank: 10, avatar: null, badges: 3 },
];

const mockBadges = [
  { id: '1', name: 'First Upload', icon: '🎬', description: 'Uploaded your first video' },
  { id: '2', name: 'Rising Star', icon: '⭐', description: 'Reached 1,000 subscribers' },
  { id: '3', name: 'Consistent Creator', icon: '🔥', description: 'Posted 10 videos in a month' },
  { id: '4', name: 'Community Leader', icon: '👑', description: 'Helped 50 other creators' },
  { id: '5', name: 'Viral Hit', icon: '🚀', description: 'Video reached 100k views' },
  { id: '6', name: 'Engagement Master', icon: '💬', description: '1000+ comments on content' },
];

const Leaderboard: React.FC = () => {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 rounded-full bg-gray-400/20 flex items-center justify-center">
            <Medal className="w-5 h-5 text-gray-400" />
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center">
            <Medal className="w-5 h-5 text-amber-600" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-muted-foreground font-medium">{rank}</span>
          </div>
        );
    }
  };

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
        {/* Leaderboard */}
        <div className="lg:col-span-2 space-y-4">
          {/* Top 3 Highlight */}
          <div className="grid grid-cols-3 gap-4">
            {mockLeaderboard.slice(0, 3).map((user, index) => (
              <Card
                key={user.id}
                className={`glass-card text-center ${
                  index === 0 ? 'border-yellow-500/50' : ''
                }`}
              >
                <CardContent className="pt-6">
                  <div className="relative inline-block">
                    <Avatar className="w-16 h-16 mx-auto">
                      <AvatarImage src={user.avatar || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1">
                      {index === 0 && (
                        <span className="text-2xl">🥇</span>
                      )}
                      {index === 1 && (
                        <span className="text-2xl">🥈</span>
                      )}
                      {index === 2 && (
                        <span className="text-2xl">🥉</span>
                      )}
                    </div>
                  </div>
                  <h3 className="font-medium mt-3">{user.name}</h3>
                  <p className="text-2xl font-bold gradient-text mt-1">
                    {user.points.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">points</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">
                      {user.badges} badges
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full Leaderboard */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockLeaderboard.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    {getRankBadge(user.rank)}
                    <Avatar>
                      <AvatarImage src={user.avatar || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-sm text-muted-foreground">
                          {user.badges} badges
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{user.points.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges */}
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Available Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <p className="font-medium">{badge.name}</p>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Your Stats */}
          <Card className="glass-card border-primary/30">
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Rank</span>
                <Badge className="badge-info">#15</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Points</span>
                <span className="font-bold">1,250</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Badges Earned</span>
                <span className="font-bold">4 / 6</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Points to Next Rank</span>
                <span className="font-bold text-primary">+130</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
