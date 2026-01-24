import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

      // Get message count for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentMessages } = await supabase
        .from('messages')
        .select('id')
        .gte('created_at', sevenDaysAgo.toISOString());

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
        weeklyMessages: recentMessages?.length || 0,
      };
    },
    enabled: !!user && (role === 'admin' || role === 'manager'),
  });
};

// Generate mock chart data for analytics
export const useChartData = () => {
  return useQuery({
    queryKey: ['chart-data'],
    queryFn: async () => {
      // In a real app, this would fetch actual analytics data
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      const uploadFrequency = days.map((day, i) => ({
        name: day,
        uploads: Math.floor(Math.random() * 50) + 10,
        views: Math.floor(Math.random() * 1000) + 200,
      }));

      const channelGrowth = Array.from({ length: 12 }, (_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        subscribers: Math.floor(Math.random() * 5000) + 1000 + i * 500,
        videos: Math.floor(Math.random() * 20) + 5 + i * 2,
      }));

      const userContribution = [
        { name: 'Videos', value: 35, color: 'hsl(262, 83%, 58%)' },
        { name: 'Comments', value: 25, color: 'hsl(199, 89%, 48%)' },
        { name: 'Likes', value: 20, color: 'hsl(142, 76%, 36%)' },
        { name: 'Shares', value: 20, color: 'hsl(38, 92%, 50%)' },
      ];

      return {
        uploadFrequency,
        channelGrowth,
        userContribution,
      };
    },
  });
};
