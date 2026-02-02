import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

interface GroupedReaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

export const useMessageReactions = (roomId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all reactions for a room's messages
  const { data: reactions = [], isLoading } = useQuery({
    queryKey: ['message-reactions', roomId],
    queryFn: async () => {
      if (!roomId) return [];

      // First get all message IDs in the room
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .eq('room_id', roomId);

      if (messagesError) throw messagesError;
      if (!messages || messages.length === 0) return [];

      const messageIds = messages.map((m) => m.id);

      // Then get reactions for those messages
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .in('message_id', messageIds);

      if (error) throw error;
      return data as Reaction[];
    },
    enabled: !!roomId,
  });

  // Group reactions by message and emoji
  const getReactionsForMessage = (messageId: string): GroupedReaction[] => {
    const messageReactions = reactions.filter((r) => r.message_id === messageId);
    const grouped: Record<string, { count: number; users: string[] }> = {};

    messageReactions.forEach((reaction) => {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = { count: 0, users: [] };
      }
      grouped[reaction.emoji].count++;
      grouped[reaction.emoji].users.push(reaction.user_id);
    });

    return Object.entries(grouped).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      users: data.users,
      hasReacted: user ? data.users.includes(user.id) : false,
    }));
  };

  // Add or remove a reaction
  const toggleReaction = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!user) throw new Error('Must be logged in to react');

      // Check if user already reacted with this emoji
      const existingReaction = reactions.find(
        (r) => r.message_id === messageId && r.user_id === user.id && r.emoji === emoji
      );

      if (existingReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (error) throw error;
        return { action: 'removed', emoji };
      } else {
        // Add reaction
        const { error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            emoji,
          });

        if (error) throw error;
        return { action: 'added', emoji };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-reactions', roomId] });
    },
  });

  return {
    reactions,
    isLoading,
    getReactionsForMessage,
    toggleReaction,
  };
};
