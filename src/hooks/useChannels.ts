import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { YouTubeChannel } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useChannels = () => {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      let query = supabase
        .from('youtube_channels')
        .select('*')
        .order('created_at', { ascending: false });

      // Users can only see their own channels
      if (role === 'user') {
        query = query.eq('user_id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as YouTubeChannel[];
    },
    enabled: !!user,
  });
};

export const useCreateChannel = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (channel: {
      channel_name: string;
      channel_link: string;
      creator_name: string;
      description?: string;
      workspace_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('youtube_channels')
        .insert({
          ...channel,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });
};

export const useUpdateChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      ...updates 
    }: Partial<YouTubeChannel> & { id: string }) => {
      const { error } = await supabase
        .from('youtube_channels')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });
};

export const useDeleteChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('youtube_channels')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });
};
