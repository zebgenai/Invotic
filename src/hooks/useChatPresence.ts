import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PresenceState {
  [key: string]: {
    user_id: string;
    online_at: string;
    full_name?: string;
  }[];
}

export const useChatPresence = (roomId: string | null) => {
  const { user, profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!roomId || !user) return;

    const channel = supabase.channel(`presence-${roomId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ user_id: string; online_at: string }>();
        const users = Object.values(state).flatMap((presenceList) =>
          presenceList.map((p) => p.user_id)
        );
        const uniqueUsers = [...new Set(users)];
        setOnlineUsers(uniqueUsers);
        setOnlineCount(uniqueUsers.length);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
            full_name: profile?.full_name,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, user, profile?.full_name]);

  return { onlineUsers, onlineCount };
};

// Global presence for the entire app
export const useGlobalPresence = () => {
  const { user, profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('global-presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ user_id: string }>();
        const users = Object.values(state).flatMap((presenceList) =>
          presenceList.map((p) => p.user_id)
        );
        const uniqueUsers = [...new Set(users)];
        setOnlineUsers(uniqueUsers);
        setOnlineCount(uniqueUsers.length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
            full_name: profile?.full_name,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile?.full_name]);

  return { onlineUsers, onlineCount };
};
