import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subDays, format, startOfDay, eachDayOfInterval } from 'date-fns';

export const useActivityLogs = () => {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    enabled: !!user && role === 'admin',
  });
};

export const useUserPoints = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-points'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .order('total_points', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useDashboardStats = () => {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Get profile counts by KYC status
      const { data: profiles } = await supabase
        .from('profiles')
        .select('kyc_status');

      // Get task counts by status
      const { data: tasks } = await supabase
        .from('tasks')
        .select('status');

      // Get channel count
      const { data: channels } = await supabase
        .from('youtube_channels')
        .select('id');

      const kycStats = {
        pending: profiles?.filter(p => p.kyc_status === 'pending').length || 0,
        approved: profiles?.filter(p => p.kyc_status === 'approved').length || 0,
        rejected: profiles?.filter(p => p.kyc_status === 'rejected').length || 0,
      };

      const taskStats = {
        todo: tasks?.filter(t => t.status === 'todo').length || 0,
        inProgress: tasks?.filter(t => t.status === 'in_progress').length || 0,
        completed: tasks?.filter(t => t.status === 'completed').length || 0,
      };

      return {
        totalUsers: profiles?.length || 0,
        kycStats,
        taskStats,
        totalChannels: channels?.length || 0,
      };
    },
    enabled: !!user && (role === 'admin' || role === 'manager'),
  });
};

// Fetch real YouTube channel analytics data
export const useYouTubeAnalytics = () => {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['youtube-analytics'],
    queryFn: async () => {
      // Get all YouTube channels with their stats
      const { data: channels, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .order('subscriber_count', { ascending: false });

      if (error) throw error;

      // Get unique user IDs and their profiles
      const userIds = [...new Set(channels?.map(c => c.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      // Calculate total stats
      const totalSubscribers = channels?.reduce((sum, c) => sum + (c.subscriber_count || 0), 0) || 0;
      const totalViews = channels?.reduce((sum, c) => sum + (Number(c.view_count) || 0), 0) || 0;
      const totalVideos = channels?.reduce((sum, c) => sum + (c.video_count || 0), 0) || 0;
      const totalChannels = channels?.length || 0;

      // Group channels by user for creator stats
      const creatorStats = userIds.map(userId => {
        const userChannels = channels?.filter(c => c.user_id === userId) || [];
        const profile = profiles?.find(p => p.user_id === userId);
        return {
          user_id: userId,
          name: profile?.full_name || 'Unknown',
          avatar_url: profile?.avatar_url,
          channels: userChannels.length,
          subscribers: userChannels.reduce((sum, c) => sum + (c.subscriber_count || 0), 0),
          views: userChannels.reduce((sum, c) => sum + (Number(c.view_count) || 0), 0),
          videos: userChannels.reduce((sum, c) => sum + (c.video_count || 0), 0),
        };
      }).sort((a, b) => b.subscribers - a.subscribers);

      // Create channel distribution for pie chart
      const channelDistribution = channels?.slice(0, 5).map(channel => ({
        name: channel.channel_name,
        value: channel.subscriber_count || 0,
      })) || [];

      // Add "Others" category if there are more than 5 channels
      if (channels && channels.length > 5) {
        const othersSubscribers = channels.slice(5).reduce((sum, c) => sum + (c.subscriber_count || 0), 0);
        if (othersSubscribers > 0) {
          channelDistribution.push({
            name: 'Others',
            value: othersSubscribers,
          });
        }
      }

      // Create creator performance data for bar chart
      const creatorPerformance = creatorStats.slice(0, 6).map(creator => ({
        name: creator.name.split(' ')[0], // First name only for chart
        subscribers: creator.subscribers,
        views: Math.floor(creator.views / 1000), // Convert to K for readability
        videos: creator.videos,
      }));

      // Simulate channel growth over last 7 days based on current data
      const days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date(),
      });

      const channelGrowth = days.map((day, index) => ({
        name: format(day, 'EEE'),
        date: format(day, 'MMM d'),
        // Simulate slight growth trend
        subscribers: Math.floor(totalSubscribers * (0.85 + (index * 0.025))),
        views: Math.floor(totalViews * (0.80 + (index * 0.03))),
      }));

      return {
        totalSubscribers,
        totalViews,
        totalVideos,
        totalChannels,
        totalCreators: userIds.length,
        channels: channels || [],
        creatorStats,
        channelDistribution,
        creatorPerformance,
        channelGrowth,
        topChannels: channels?.slice(0, 5) || [],
      };
    },
    enabled: !!user && role === 'admin',
  });
};

// Generate chart data based on real analytics
export const useChartData = () => {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['chart-data'],
    queryFn: async () => {
      // Get real channel data
      const { data: channels } = await supabase
        .from('youtube_channels')
        .select('*')
        .order('updated_at', { ascending: true });

      // Get real task data
      const { data: tasks } = await supabase
        .from('tasks')
        .select('status, created_at');

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      // Calculate real upload/activity frequency based on channel updates
      const uploadFrequency = days.map((day, i) => {
        const dayChannels = channels?.filter(c => {
          const updateDay = new Date(c.updated_at).getDay();
          // Adjust for Monday start (0 = Sunday in JS)
          const adjustedDay = updateDay === 0 ? 6 : updateDay - 1;
          return adjustedDay === i;
        }) || [];
        
        return {
          name: day,
          uploads: dayChannels.length,
          views: dayChannels.reduce((sum, c) => sum + Math.floor((Number(c.view_count) || 0) / 1000), 0),
        };
      });

      // Real channel growth based on actual data
      const channelGrowth = Array.from({ length: 6 }, (_, i) => {
        const monthsAgo = 5 - i;
        const date = new Date();
        date.setMonth(date.getMonth() - monthsAgo);
        const monthName = format(date, 'MMM');
        
        // Filter channels created before or during this month
        const channelsUpToMonth = channels?.filter(c => {
          const channelDate = new Date(c.created_at);
          return channelDate <= date;
        }) || [];
        
        return {
          month: monthName,
          subscribers: channelsUpToMonth.reduce((sum, c) => sum + (c.subscriber_count || 0), 0),
          videos: channelsUpToMonth.reduce((sum, c) => sum + (c.video_count || 0), 0),
        };
      });

      // Real user contribution based on task status
      const taskStats = {
        completed: tasks?.filter(t => t.status === 'completed').length || 0,
        inProgress: tasks?.filter(t => t.status === 'in_progress').length || 0,
        todo: tasks?.filter(t => t.status === 'todo').length || 0,
        cancelled: tasks?.filter(t => t.status === 'cancelled').length || 0,
      };

      const totalTasks = Object.values(taskStats).reduce((a, b) => a + b, 0);

      const userContribution = [
        { name: 'Completed', value: taskStats.completed, color: 'hsl(142, 76%, 36%)' },
        { name: 'In Progress', value: taskStats.inProgress, color: 'hsl(199, 89%, 48%)' },
        { name: 'To Do', value: taskStats.todo, color: 'hsl(262, 83%, 58%)' },
        { name: 'Cancelled', value: taskStats.cancelled, color: 'hsl(0, 84%, 60%)' },
      ].filter(item => item.value > 0);

      // If no tasks, show placeholder
      if (userContribution.length === 0) {
        userContribution.push({ name: 'No Tasks', value: 1, color: 'hsl(220, 10%, 55%)' });
      }

      return {
        uploadFrequency,
        channelGrowth,
        userContribution,
      };
    },
    enabled: !!user && (role === 'admin' || role === 'manager'),
  });
};
