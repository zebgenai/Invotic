import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile, YouTubeChannel, Task } from '@/types/database';

export const useUserProfileDetails = (userId: string | null) => {
  const profile = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId!)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
  });

  const channels = useQuery({
    queryKey: ['user-channels', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .eq('user_id', userId!)
        .order('subscriber_count', { ascending: false });
      if (error) throw error;
      return data as YouTubeChannel[];
    },
    enabled: !!userId,
  });

  const tasks = useQuery({
    queryKey: ['user-tasks', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', userId!)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!userId,
  });

  const forumThreads = useQuery({
    queryKey: ['user-threads', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('author_id', userId!)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const userRole = useQuery({
    queryKey: ['user-role', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId!)
        .single();
      if (error) return null;
      return data?.role as string;
    },
    enabled: !!userId,
  });

  return {
    profile: profile.data,
    channels: channels.data,
    tasks: tasks.data,
    forumThreads: forumThreads.data,
    userRole: userRole.data,
    isLoading: profile.isLoading,
  };
};
