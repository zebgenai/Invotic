import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ForumThread, ForumReply } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useForumThreads = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['forum-threads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_threads')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ForumThread[];
    },
    enabled: !!user,
  });
};

export const useForumThread = (threadId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['forum-thread', threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('id', threadId)
        .single();

      if (error) throw error;
      return data as ForumThread;
    },
    enabled: !!user && !!threadId,
  });
};

export const useForumReplies = (threadId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['forum-replies', threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ForumReply[];
    },
    enabled: !!user && !!threadId,
  });
};

export const useCreateThread = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      const { data, error } = await supabase
        .from('forum_threads')
        .insert({
          title,
          content,
          author_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] });
    },
  });
};

export const useCreateReply = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, content }: { threadId: string; content: string }) => {
      const { data, error } = await supabase
        .from('forum_replies')
        .insert({
          thread_id: threadId,
          content,
          author_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forum-replies', variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] });
    },
  });
};

export const useDeleteThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadId: string) => {
      const { error } = await supabase
        .from('forum_threads')
        .delete()
        .eq('id', threadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] });
    },
  });
};
