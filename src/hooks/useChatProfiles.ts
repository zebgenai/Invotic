import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Hook to get profiles for chat members - works for ALL authenticated users
// This fetches profiles of users who are in the same chat rooms as the current user
export const useChatMemberProfiles = (roomId: string | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['chat-member-profiles', roomId],
    queryFn: async () => {
      if (!roomId) return [];

      // Get member user IDs from the room
      const { data: members, error: membersError } = await supabase
        .from('chat_room_members')
        .select('user_id')
        .eq('room_id', roomId);

      if (membersError) throw membersError;

      const memberIds = members?.map((m) => m.user_id) || [];
      if (memberIds.length === 0) return [];

      // Get profiles for those members
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', memberIds);

      if (profilesError) throw profilesError;
      return profiles || [];
    },
    enabled: !!user && !!roomId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Hook to get all profiles the user can see in chats they belong to
export const useAccessibleProfiles = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['accessible-profiles'],
    queryFn: async () => {
      // Get all rooms the user is a member of
      const { data: userRooms, error: roomsError } = await supabase
        .from('chat_room_members')
        .select('room_id')
        .eq('user_id', user?.id || '');

      if (roomsError) throw roomsError;

      const roomIds = userRooms?.map((r) => r.room_id) || [];
      if (roomIds.length === 0) return [];

      // Get all member user IDs from those rooms
      const { data: allMembers, error: membersError } = await supabase
        .from('chat_room_members')
        .select('user_id')
        .in('room_id', roomIds);

      if (membersError) throw membersError;

      const memberIds = [...new Set(allMembers?.map((m) => m.user_id) || [])];
      if (memberIds.length === 0) return [];

      // Get profiles for all those members
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, email')
        .in('user_id', memberIds);

      if (profilesError) throw profilesError;
      return profiles || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};
