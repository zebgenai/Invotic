import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ForumThread, ForumReply, ForumReaction } from '@/types/database';
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

export const useForumReactions = (threadId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['forum-reactions', threadId],
    queryFn: async () => {
      // Get reactions for the thread itself
      const { data: threadReactions, error: e1 } = await supabase
        .from('forum_reactions')
        .select('*')
        .eq('thread_id', threadId);

      if (e1) throw e1;

      // Get reactions for all replies in this thread
      const { data: replies } = await supabase
        .from('forum_replies')
        .select('id')
        .eq('thread_id', threadId);

      const replyIds = replies?.map((r: any) => r.id) || [];
      let replyReactions: ForumReaction[] = [];

      if (replyIds.length > 0) {
        const { data, error: e2 } = await supabase
          .from('forum_reactions')
          .select('*')
          .in('reply_id', replyIds);

        if (e2) throw e2;
        replyReactions = (data || []) as ForumReaction[];
      }

      return [...(threadReactions || []), ...replyReactions] as ForumReaction[];
    },
    enabled: !!user && !!threadId,
  });
};

export const useCreateThread = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, content, is_locked }: { title: string; content: string; is_locked?: boolean }) => {
      const { data, error } = await supabase
        .from('forum_threads')
        .insert({
          title,
          content,
          author_id: user?.id,
          is_locked: is_locked || false,
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

export const useToggleThreadLock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, is_locked }: { threadId: string; is_locked: boolean }) => {
      const { error } = await supabase
        .from('forum_threads')
        .update({ is_locked })
        .eq('id', threadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] });
      queryClient.invalidateQueries({ queryKey: ['forum-thread'] });
    },
  });
};

export const useToggleReaction = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ emoji, threadId, replyId }: { emoji: string; threadId?: string; replyId?: string }) => {
      if (!user) throw new Error('Not authenticated');

      // Check if reaction exists
      let query = supabase
        .from('forum_reactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('emoji', emoji);

      if (threadId) query = query.eq('thread_id', threadId);
      if (replyId) query = query.eq('reply_id', replyId);

      const { data: existing } = await query;

      if (existing && existing.length > 0) {
        // Remove reaction
        const { error } = await supabase
          .from('forum_reactions')
          .delete()
          .eq('id', existing[0].id);
        if (error) throw error;
      } else {
        // Add reaction
        const insertData: any = { user_id: user.id, emoji };
        if (threadId) insertData.thread_id = threadId;
        if (replyId) insertData.reply_id = replyId;

        const { error } = await supabase
          .from('forum_reactions')
          .insert(insertData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-reactions'] });
    },
  });
};
