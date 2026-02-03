import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef, useCallback } from 'react';

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
    staleTime: 60 * 1000, // 1 minute
  });
};

// Hook to get read counts for multiple messages in a room
export const useRoomMessageReads = (roomId: string | null) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['room-message-reads', roomId],
    queryFn: async () => {
      if (!roomId) return {};

      // Get all message IDs in the room (limit to recent messages for performance)
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(100);

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
    staleTime: 60 * 1000, // 1 minute (increased from 10s)
    refetchOnWindowFocus: false,
  });

  // Subscribe to realtime changes - debounced
  useEffect(() => {
    if (!roomId) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

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
          // Debounce invalidations to prevent rapid re-fetches
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['room-message-reads', roomId] });
          }, 2000);
        }
      )
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
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
        .maybeSingle();

      // Ignore constraint/duplicate errors
      if (error && !error.message.includes('duplicate') && !error.code?.startsWith('23')) {
        throw error;
      }
      return { data, roomId };
    },
    onSuccess: (result) => {
      if (result?.roomId) {
        // Debounce query invalidation
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['room-message-reads', result.roomId] });
        }, 1000);
      }
    },
  });
};

// Hook to mark all visible messages as read when entering a room - with debouncing
export const useMarkMessagesAsRead = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const pendingIdsRef = useRef<Set<string>>(new Set());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRoomIdRef = useRef<string | null>(null);

  const flushPending = useCallback(async (roomId: string) => {
    if (!user?.id || pendingIdsRef.current.size === 0) return;

    const messageIds = Array.from(pendingIdsRef.current);
    pendingIdsRef.current.clear();

    // Limit batch size to prevent DB overload
    const BATCH_SIZE = 10;
    const batch = messageIds.slice(0, BATCH_SIZE);

    if (batch.length === 0) return;

    try {
      const reads = batch.map((messageId) => ({
        message_id: messageId,
        user_id: user.id,
      }));

      const { error } = await supabase
        .from('message_reads')
        .upsert(reads, { onConflict: 'message_id,user_id', ignoreDuplicates: true });

      // Ignore constraint/duplicate errors
      if (error && !error.message.includes('duplicate') && !error.code?.startsWith('23')) {
        console.error('Error marking messages as read:', error);
      }
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [user?.id]);

  return useMutation({
    mutationFn: async ({ messageIds, roomId }: { messageIds: string[]; roomId: string }) => {
      if (!user?.id || messageIds.length === 0) return null;

      // Add to pending set
      messageIds.forEach(id => pendingIdsRef.current.add(id));
      lastRoomIdRef.current = roomId;

      // Debounce the actual API call
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        flushPending(roomId);
      }, 1500); // Wait 1.5s before sending

      return { roomId };
    },
    onSuccess: (result) => {
      if (result?.roomId) {
        // Delay query invalidation significantly to reduce churn
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['room-message-reads', result.roomId] });
        }, 3000);
      }
    },
  });
};
