import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Announcement } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useAnnouncements = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Announcement[];
    },
    enabled: !!user,
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (announcement: {
      title: string;
      content: string;
      is_pinned?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          ...announcement,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};
