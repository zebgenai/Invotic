import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Search, UserPlus, UserMinus, Crown, Loader2, Users, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatRoomMembers, useAddChatRoomMember, useRemoveChatRoomMember } from '@/hooks/useChat';
import { useProfiles } from '@/hooks/useProfiles';
import { useToast } from '@/hooks/use-toast';

interface ChatMembersDialogProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  roomCreatorId: string;
  currentUserId: string | undefined;
  isAdmin: boolean;
  onlineUsers?: string[];
  onlineCount?: number;
  totalMembers?: number;
}

const ChatMembersDialog: React.FC<ChatMembersDialogProps> = ({
  open,
  onClose,
  roomId,
  roomName,
  roomCreatorId,
  currentUserId,
  isAdmin,
  onlineUsers = [],
  onlineCount = 0,
  totalMembers = 0,
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMembers, setShowAddMembers] = useState(false);
  
  const { data: members, isLoading: membersLoading } = useChatRoomMembers(roomId);
  const { data: allProfiles } = useProfiles();
  const addMember = useAddChatRoomMember();
  const removeMember = useRemoveChatRoomMember();

  // Get member user IDs for filtering
  const memberUserIds = new Set(members?.map((m: any) => m.user_id) || []);

  // Filter profiles that are not already members
  const availableProfiles = allProfiles?.filter(
    (p) => !memberUserIds.has(p.user_id) && p.is_active
  ) || [];

  // Filter by search query
  const filteredMembers = members?.filter((m: any) => 
    m.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredAvailableProfiles = availableProfiles.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = async (userId: string) => {
    try {
      await addMember.mutateAsync({ roomId, userId });
      toast({
        title: 'Member added',
        description: 'User has been added to the chat room.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add member. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (memberId: string, userName: string) => {
    try {
      await removeMember.mutateAsync({ roomId, memberId });
      toast({
        title: 'Member removed',
        description: `${userName} has been removed from the chat room.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove member. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const canManageMembers = isAdmin;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {showAddMembers ? 'Add Members' : 'Chat Members'}
          </DialogTitle>
          <DialogDescription>
            {showAddMembers 
              ? `Add new members to ${roomName}`
              : `Manage members in ${roomName}`
            }
          </DialogDescription>
        </DialogHeader>

        {/* Room Stats */}
        {!showAddMembers && (
          <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{members?.length || totalMembers} members</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-3 h-3 fill-success text-success" />
              <span className="text-sm text-success font-medium">{onlineCount} online</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Search and Toggle */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {canManageMembers && (
              <Button
                variant={showAddMembers ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => setShowAddMembers(!showAddMembers)}
                title={showAddMembers ? 'View members' : 'Add members'}
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Members List */}
          <ScrollArea className="h-[300px]">
            {membersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : showAddMembers ? (
              // Available profiles to add
              <div className="space-y-2">
                {filteredAvailableProfiles.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {searchQuery ? 'No users found' : 'All users are already members'}
                  </p>
                ) : (
                  filteredAvailableProfiles.map((profile) => (
                    <div
                      key={profile.user_id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={profile.avatar_url || ''} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {profile.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{profile.full_name}</p>
                          <p className="text-xs text-muted-foreground">{profile.email}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddMember(profile.user_id)}
                        disabled={addMember.isPending}
                        className="gap-1"
                      >
                        {addMember.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <UserPlus className="w-3 h-3" />
                        )}
                        Add
                      </Button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Current members
              <div className="space-y-2">
                {filteredMembers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {searchQuery ? 'No members found' : 'No members in this chat'}
                  </p>
                ) : (
                  filteredMembers.map((member: any) => {
                    const isCreator = member.user_id === roomCreatorId;
                    const isSelf = member.user_id === currentUserId;
                    const canRemove = canManageMembers && !isCreator && !isSelf;

                    const isOnline = onlineUsers.includes(member.user_id);

                    return (
                      <div
                        key={member.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg transition-colors",
                          isCreator ? "bg-primary/5 border border-primary/20" : "bg-secondary/30 hover:bg-secondary/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={member.profiles?.avatar_url || ''} />
                              <AvatarFallback className={cn(
                                isCreator ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                              )}>
                                {member.profiles?.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            {/* Online indicator */}
                            <span
                              className={cn(
                                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                                isOnline ? "bg-success" : "bg-muted"
                              )}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{member.profiles?.full_name}</p>
                              {isCreator && (
                                <Badge variant="secondary" className="text-[10px] gap-1 py-0">
                                  <Crown className="w-2.5 h-2.5" /> Creator
                                </Badge>
                              )}
                              {isSelf && (
                                <Badge variant="outline" className="text-[10px] py-0">
                                  You
                                </Badge>
                              )}
                              {isOnline && (
                                <Badge variant="outline" className="text-[10px] py-0 text-success border-success/50">
                                  Online
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{member.profiles?.email}</p>
                          </div>
                        </div>
                        
                        {canRemove && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                              >
                                <UserMinus className="w-3 h-3" />
                                Remove
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {member.profiles?.full_name} from this chat room?
                                  They will no longer be able to see or send messages in this room.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveMember(member.id, member.profiles?.full_name || 'User')}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </ScrollArea>

          {/* Footer info */}
          {!showAddMembers && members && (
            <p className="text-xs text-muted-foreground text-center">
              {members.length} member{members.length !== 1 ? 's' : ''} in this chat
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatMembersDialog;
