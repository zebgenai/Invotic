import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const GUILD_ID = '1469169775996440701';

interface DiscordMessage {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar: string | null;
    discriminator: string;
  };
  timestamp: string;
  attachments: any[];
}

interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  position: number;
}

export const useDiscordChannels = () => {
  return useQuery({
    queryKey: ['discord-channels'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('discord', {
        body: { action: 'getChannels', channelId: GUILD_ID },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data.channels as DiscordChannel[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useDiscordMessages = (channelId: string | null) => {
  return useQuery({
    queryKey: ['discord-messages', channelId],
    queryFn: async () => {
      if (!channelId) return [];
      
      const { data, error } = await supabase.functions.invoke('discord', {
        body: { action: 'getMessages', channelId, limit: 50 },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      // Discord returns messages newest first, reverse for chat display
      return (data.messages as DiscordMessage[]).reverse();
    },
    enabled: !!channelId,
    refetchInterval: 5000, // Poll every 5 seconds
  });
};

export const useSendDiscordMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ channelId, content }: { channelId: string; content: string }) => {
      const { data, error } = await supabase.functions.invoke('discord', {
        body: { action: 'sendMessage', channelId, content },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data.message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discord-messages', variables.channelId] });
    },
  });
};
