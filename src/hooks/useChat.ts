import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChatRoom, Message } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export const useChatRooms = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['chat-rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_room_members!inner(user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (ChatRoom & { chat_room_members: { user_id: string }[] })[];
    },
    enabled: !!user,
  });
};

export const useMessages = (roomId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);

  const query = useQuery({
    queryKey: ['messages', roomId],
    queryFn: async () => {
      if (!roomId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user && !!roomId,
  });

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`messages-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setRealtimeMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const allMessages = [...(query.data || []), ...realtimeMessages.filter(
    (rm) => !(query.data || []).some((m) => m.id === rm.id)
  )];

  return {
    ...query,
    data: allMessages,
  };
};

export const useSendMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      roomId, 
      content, 
      fileUrl, 
      fileType 
    }: { 
      roomId: string; 
      content?: string; 
      fileUrl?: string;
      fileType?: string;
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          sender_id: user?.id,
          content,
          file_url: fileUrl,
          file_type: fileType,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.roomId] });
    },
  });
};

export const useCreateChatRoom = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      name, 
      isGroup = false,
      isBroadcast = false,
      isPublic = false,
      memberIds = []
    }: { 
      name?: string; 
      isGroup?: boolean;
      isBroadcast?: boolean;
      isPublic?: boolean;
      memberIds?: string[];
    }) => {
      // Create room
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name,
          is_group: isGroup,
          is_broadcast: isBroadcast,
          is_public: isPublic,
          created_by: user?.id,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add creator as member (trigger will add others for public rooms)
      const allMembers = [user?.id, ...memberIds].filter(Boolean);
      
      for (const memberId of allMembers) {
        await supabase
          .from('chat_room_members')
          .insert({
            room_id: room.id,
            user_id: memberId,
            can_post: !isBroadcast || memberId === user?.id,
          });
      }

      return room;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
    },
  });
};

export const useUpdateChatRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      roomId, 
      isPublic 
    }: { 
      roomId: string; 
      isPublic: boolean;
    }) => {
      const { data, error } = await supabase
        .from('chat_rooms')
        .update({ is_public: isPublic })
        .eq('id', roomId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
    },
  });
};

export const useMessageReactions = (messageId: string) => {
  return useQuery({
    queryKey: ['message-reactions', messageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId);

      if (error) throw error;
      return data;
    },
  });
};

export const useAddReaction = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user?.id,
          emoji,
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['message-reactions', variables.messageId] });
    },
  });
};
