import React, { useState, useRef, useEffect } from 'react';
import { useChatRooms, useMessages, useSendMessage, useCreateChatRoom } from '@/hooks/useChat';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  MessageCircle,
  Plus,
  Send,
  Users,
  Hash,
  Megaphone,
  Search,
  MoreVertical,
  Smile,
  Paperclip,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Chat: React.FC = () => {
  const { user, profile, role } = useAuth();
  const { data: rooms, isLoading: roomsLoading } = useChatRooms();
  const { data: profiles } = useProfiles();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const { data: messages, isLoading: messagesLoading } = useMessages(selectedRoom);
  const sendMessage = useSendMessage();
  const createRoom = useCreateChatRoom();
  const { toast } = useToast();
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState<'private' | 'group' | 'broadcast'>('group');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedRoom) return;

    try {
      await sendMessage.mutateAsync({
        roomId: selectedRoom,
        content: messageInput.trim(),
      });
      setMessageInput('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a room name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createRoom.mutateAsync({
        name: newRoomName.trim(),
        isGroup: newRoomType === 'group' || newRoomType === 'broadcast',
        isBroadcast: newRoomType === 'broadcast',
      });
      toast({
        title: 'Room created!',
        description: `${newRoomName} has been created.`,
      });
      setNewRoomName('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create room. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getSenderProfile = (senderId: string) => {
    if (senderId === user?.id) return profile;
    return profiles?.find((p) => p.user_id === senderId);
  };

  const selectedRoomData = rooms?.find((r) => r.id === selectedRoom);

  const getRoomIcon = (room: typeof rooms extends (infer T)[] | undefined ? T : never) => {
    if (room?.is_broadcast) return <Megaphone className="w-4 h-4" />;
    if (room?.is_group) return <Hash className="w-4 h-4" />;
    return <MessageCircle className="w-4 h-4" />;
  };

  const filteredRooms = rooms?.filter((room) =>
    room.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-6">
      {/* Rooms Sidebar */}
      <Card className="glass-card w-80 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Messages</CardTitle>
            {(role === 'admin' || role === 'manager') && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" title="Create Room">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card">
                  <DialogHeader>
                    <DialogTitle>Create Chat Room</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Room Name</Label>
                      <Input
                        placeholder="Enter room name"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Room Type</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={newRoomType === 'group' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setNewRoomType('group')}
                          className="w-full"
                        >
                          <Hash className="w-4 h-4 mr-1" />
                          Group
                        </Button>
                        <Button
                          variant={newRoomType === 'private' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setNewRoomType('private')}
                          className="w-full"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Private
                        </Button>
                        <Button
                          variant={newRoomType === 'broadcast' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setNewRoomType('broadcast')}
                          className="w-full"
                        >
                          <Megaphone className="w-4 h-4 mr-1" />
                          Broadcast
                        </Button>
                      </div>
                    </div>
                    <Button onClick={handleCreateRoom} className="w-full" disabled={createRoom.isPending}>
                      {createRoom.isPending ? 'Creating...' : 'Create Room'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="px-4 space-y-1">
              {roomsLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : filteredRooms?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No rooms yet</p>
              ) : (
                filteredRooms?.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                      selectedRoom === room.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary'
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      {getRoomIcon(room)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{room.name || 'Private Chat'}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {room.is_broadcast ? 'Broadcast' : room.is_group ? 'Group' : 'Direct'}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="glass-card flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {selectedRoomData && getRoomIcon(selectedRoomData)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedRoomData?.name || 'Private Chat'}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {selectedRoomData?.is_broadcast
                        ? 'Broadcast Channel'
                        : selectedRoomData?.is_group
                        ? 'Group Chat'
                        : 'Direct Message'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Users className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-4">
                {messagesLoading ? (
                  <p className="text-center text-muted-foreground py-8">Loading messages...</p>
                ) : messages?.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground">Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages?.map((message) => {
                      const sender = getSenderProfile(message.sender_id);
                      const isOwn = message.sender_id === user?.id;

                      return (
                        <div
                          key={message.id}
                          className={cn(
                            'flex gap-3',
                            isOwn && 'flex-row-reverse'
                          )}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={sender?.avatar_url || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {sender?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={cn(
                              'max-w-[70%] rounded-2xl px-4 py-2',
                              isOwn
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-secondary rounded-bl-md'
                            )}
                          >
                            {!isOwn && (
                              <p className="text-xs font-medium mb-1 opacity-70">
                                {sender?.full_name || 'Unknown'}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p
                              className={cn(
                                'text-[10px] mt-1',
                                isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
                              )}
                            >
                              {format(new Date(message.created_at), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="ghost" size="icon">
                  <Smile className="w-4 h-4" />
                </Button>
                <Button type="submit" size="icon" disabled={!messageInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a chat room from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Chat;
