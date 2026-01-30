import React from 'react';
import { useChartData, useDashboardStats, useActivityLogs, useYouTubeAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BarChart3,
  TrendingUp,
  Users,
  Youtube,
  MessageCircle,
  CheckSquare,
  Clock,
  Activity,
  Eye,
  Video,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['hsl(262, 83%, 58%)', 'hsl(199, 89%, 48%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(280, 65%, 60%)'];

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const Analytics: React.FC = () => {
  const { role } = useAuth();
  const { data: stats } = useDashboardStats();
  const { data: chartData } = useChartData();
  const { data: activityLogs } = useActivityLogs();
  const { data: youtubeAnalytics } = useYouTubeAnalytics();

  // Only admins can access analytics
  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <BarChart3 className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
        <p className="text-muted-foreground max-w-md">
          Analytics dashboard is only available to administrators. Please contact your admin if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Real-time performance metrics from your YouTube channels and community.
        </p>
      </div>

      {/* YouTube Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
                <p className="text-3xl font-bold mt-1">{formatNumber(youtubeAnalytics?.totalSubscribers || 0)}</p>
                <p className="text-xs text-success mt-1">Across all channels</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-3xl font-bold mt-1">{formatNumber(youtubeAnalytics?.totalViews || 0)}</p>
                <p className="text-xs text-info mt-1">Lifetime views</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <Eye className="w-6 h-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Videos</p>
                <p className="text-3xl font-bold mt-1">{formatNumber(youtubeAnalytics?.totalVideos || 0)}</p>
                <p className="text-xs text-warning mt-1">Published content</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Video className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Channels</p>
                <p className="text-3xl font-bold mt-1">{youtubeAnalytics?.totalChannels || 0}</p>
                <p className="text-xs text-success mt-1">{youtubeAnalytics?.totalCreators || 0} creators</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Youtube className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                <p className="text-3xl font-bold mt-1">{stats?.taskStats?.completed || 0}</p>
                <p className="text-xs text-success mt-1">{stats?.taskStats?.inProgress || 0} in progress</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Growth Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Channel Growth (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={youtubeAnalytics?.channelGrowth || []}>
                  <defs>
                    <linearGradient id="subscriberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 22%)" />
                  <XAxis dataKey="name" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} tickFormatter={(v) => formatNumber(v)} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(220, 18%, 12%)',
                      border: '1px solid hsl(220, 16%, 22%)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatNumber(value), '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="subscribers"
                    stroke="hsl(262, 83%, 58%)"
                    strokeWidth={2}
                    fill="url(#subscriberGradient)"
                    name="Subscribers"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Creator Performance Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Top Creator Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={youtubeAnalytics?.creatorPerformance || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 22%)" />
                  <XAxis dataKey="name" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} tickFormatter={(v) => formatNumber(v)} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(220, 18%, 12%)',
                      border: '1px solid hsl(220, 16%, 22%)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'views' ? formatNumber(value * 1000) : formatNumber(value),
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                  />
                  <Bar dataKey="subscribers" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} name="Subscribers" />
                  <Bar dataKey="views" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} name="Views (K)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel Distribution Pie Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Channel Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={youtubeAnalytics?.channelDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {youtubeAnalytics?.channelDistribution?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(220, 18%, 12%)',
                      border: '1px solid hsl(220, 16%, 22%)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatNumber(value) + ' subs', '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {youtubeAnalytics?.channelDistribution?.slice(0, 5).map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground truncate max-w-[80px]">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Creators */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Top Creators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {youtubeAnalytics?.creatorStats?.slice(0, 5).map((creator, index) => (
                <div key={creator.user_id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                  <span className="text-sm font-bold text-muted-foreground w-5">#{index + 1}</span>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={creator.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {creator.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{creator.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {creator.channels} channel{creator.channels !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{formatNumber(creator.subscribers)}</p>
                    <p className="text-xs text-muted-foreground">subs</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No creators yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity / KYC Status */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              KYC & Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">Approved</p>
                    <p className="text-sm text-muted-foreground">Verified users</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-success">{stats?.kycStats?.approved || 0}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium">Pending</p>
                    <p className="text-sm text-muted-foreground">Awaiting review</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-warning">{stats?.kycStats?.pending || 0}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="font-medium">Weekly Messages</p>
                    <p className="text-sm text-muted-foreground">Active chats</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-info">{stats?.weeklyMessages || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Channels Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-destructive" />
            Top Performing Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Channel</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Creator</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Subscribers</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Views</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Videos</th>
                </tr>
              </thead>
              <tbody>
                {youtubeAnalytics?.topChannels?.map((channel, index) => (
                  <tr key={channel.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <Badge variant={index < 3 ? 'default' : 'secondary'} className="w-8 justify-center">
                        {index + 1}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-destructive" />
                        <span className="font-medium">{channel.channel_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{channel.creator_name}</td>
                    <td className="py-3 px-4 text-right font-bold">{formatNumber(channel.subscriber_count || 0)}</td>
                    <td className="py-3 px-4 text-right">{formatNumber(Number(channel.view_count) || 0)}</td>
                    <td className="py-3 px-4 text-right">{channel.video_count || 0}</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No channels registered yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
