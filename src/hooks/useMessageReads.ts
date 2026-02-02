import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface MessageRead {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
}

// Hook to get who read a specific message
export const useMessageReads = (messageId: string | null) => {
  return useQuery({
    queryKey: ['message-reads', messageId],
    queryFn: async () => {
      if (!messageId) return [];

      const { data, error } = await supabase
        .from('message_reads')
        .select(`
          id,
          message_id,
          user_id,
          read_at
        `)
        .eq('message_id', messageId);

      if (error) throw error;
      return data as MessageRead[];
    },
    enabled: !!messageId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook to get read counts for multiple messages in a room
export const useRoomMessageReads = (roomId: string | null) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['room-message-reads', roomId],
    queryFn: async () => {
      if (!roomId) return {};

      // Get all message IDs in the room
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .eq('room_id', roomId);

      if (messagesError) throw messagesError;

      const messageIds = messages?.map((m) => m.id) || [];
      if (messageIds.length === 0) return {};

      // Get all reads for those messages
      const { data: reads, error: readsError } = await supabase
        .from('message_reads')
        .select('message_id, user_id, read_at')
        .in('message_id', messageIds);

      if (readsError) throw readsError;

      // Group by message_id
      const readsByMessage: Record<string, { user_id: string; read_at: string }[]> = {};
      (reads || []).forEach((read) => {
        if (!readsByMessage[read.message_id]) {
          readsByMessage[read.message_id] = [];
        }
        readsByMessage[read.message_id].push({
          user_id: read.user_id,
          read_at: read.read_at,
        });
      });

      return readsByMessage;
    },
    enabled: !!roomId,
    staleTime: 10 * 1000, // 10 seconds
  });

  // Subscribe to realtime changes
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`message-reads-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reads',
        },
        () => {
          // Invalidate to refresh read counts
          queryClient.invalidateQueries({ queryKey: ['room-message-reads', roomId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);

  return query;
};

// Hook to mark a message as read
export const useMarkMessageAsRead = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, roomId }: { messageId: string; roomId: string }) => {
      if (!user?.id) return null;

      // Use upsert to avoid duplicates
      const { data, error } = await supabase
        .from('message_reads')
        .upsert(
          {
            message_id: messageId,
            user_id: user.id,
          },
          {
            onConflict: 'message_id,user_id',
          }
        )
        .select()
        .single();

      if (error && !error.message.includes('duplicate')) throw error;
      return { data, roomId };
    },
    onSuccess: (result) => {
      if (result?.roomId) {
        queryClient.invalidateQueries({ queryKey: ['room-message-reads', result.roomId] });
      }
    },
  });
};

// Hook to mark all visible messages as read when entering a room
export const useMarkMessagesAsRead = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageIds, roomId }: { messageIds: string[]; roomId: string }) => {
      if (!user?.id || messageIds.length === 0) return null;

      // Insert read receipts for all messages (ignore duplicates)
      const reads = messageIds.map((messageId) => ({
        message_id: messageId,
        user_id: user.id,
      }));

      const { error } = await supabase
        .from('message_reads')
        .upsert(reads, { onConflict: 'message_id,user_id' });

      if (error && !error.message.includes('duplicate')) throw error;
      return { roomId };
    },
    onSuccess: (result) => {
      if (result?.roomId) {
        queryClient.invalidateQueries({ queryKey: ['room-message-reads', result.roomId] });
      }
    },
  });
};
