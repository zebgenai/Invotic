import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  MessageCircle,
  Plus,
  Users,
  Hash,
  Megaphone,
  Search,
  Globe,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatRoom {
  id: string;
  name: string | null;
  is_group: boolean;
  is_broadcast: boolean;
  is_public?: boolean;
}

interface ChatSidebarProps {
  rooms: ChatRoom[] | undefined;
  roomsLoading: boolean;
  selectedRoom: string | null;
  setSelectedRoom: (roomId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  newRoomName: string;
  setNewRoomName: (name: string) => void;
  newRoomType: 'private' | 'group' | 'broadcast';
  setNewRoomType: (type: 'private' | 'group' | 'broadcast') => void;
  isPublicRoom: boolean;
  setIsPublicRoom: (isPublic: boolean) => void;
  handleCreateRoom: () => void;
  createRoomPending: boolean;
  canCreateRoom: boolean;
  isMobile?: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  rooms,
  roomsLoading,
  selectedRoom,
  setSelectedRoom,
  searchQuery,
  setSearchQuery,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  newRoomName,
  setNewRoomName,
  newRoomType,
  setNewRoomType,
  isPublicRoom,
  setIsPublicRoom,
  handleCreateRoom,
  createRoomPending,
  canCreateRoom,
  isMobile = false,
}) => {
  const getRoomIcon = (room: ChatRoom) => {
    if (room?.is_broadcast) return <Megaphone className="w-4 h-4" />;
    if (room?.is_group) return <Hash className="w-4 h-4" />;
    return <MessageCircle className="w-4 h-4" />;
  };

  const filteredRooms = rooms?.filter((room) =>
    room.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className={cn(
      "flex flex-col bg-card/40 backdrop-blur-xl border-border/50 overflow-hidden",
      isMobile ? "w-full flex-1" : "w-80"
    )}>
      {/* Header with gradient accent */}
      <CardHeader className="pb-3 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-lg font-display">Messages</CardTitle>
            </div>
            {canCreateRoom && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    title="Create Room"
                    className="hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-primary/20">
                  <DialogHeader>
                    <DialogTitle className="font-display">Create Chat Room</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Room Name</Label>
                      <Input
                        placeholder="Enter room name"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        className="input-glow"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Room Type</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { type: 'group' as const, icon: Hash, label: 'Group' },
                          { type: 'private' as const, icon: MessageCircle, label: 'Private' },
                          { type: 'broadcast' as const, icon: Megaphone, label: 'Broadcast' },
                        ].map(({ type, icon: Icon, label }) => (
                          <Button
                            key={type}
                            variant={newRoomType === type ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setNewRoomType(type)}
                            className={cn(
                              "w-full transition-all",
                              newRoomType === type && "shadow-lg shadow-primary/20"
                            )}
                          >
                            <Icon className="w-4 h-4 mr-1" />
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Globe className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <Label htmlFor="public-toggle" className="cursor-pointer font-medium">Public Room</Label>
                          <p className="text-xs text-muted-foreground">All users can access</p>
                        </div>
                      </div>
                      <Switch
                        id="public-toggle"
                        checked={isPublicRoom}
                        onCheckedChange={setIsPublicRoom}
                      />
                    </div>
                    <Button 
                      onClick={handleCreateRoom} 
                      className="w-full shadow-lg shadow-primary/20" 
                      disabled={createRoomPending}
                    >
                      {createRoomPending ? 'Creating...' : 'Create Room'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 bg-secondary/50 border-border/50 input-glow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="px-3 py-2 space-y-1">
            {roomsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-muted-foreground">Loading rooms...</p>
              </div>
            ) : filteredRooms?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              filteredRooms?.map((room, index) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left group',
                    'animate-fade-in',
                    selectedRoom === room.id
                      ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary border border-primary/20 shadow-lg shadow-primary/5'
                      : 'hover:bg-secondary/80 border border-transparent'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                    selectedRoom === room.id 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                      : 'bg-secondary group-hover:bg-primary/10 group-hover:text-primary'
                  )}>
                    {getRoomIcon(room)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{room.name || 'Private Chat'}</p>
                      {room.is_public && (
                        <Globe className="w-3 h-3 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {room.is_broadcast ? 'Broadcast' : room.is_group ? 'Group' : 'Direct'}
                      {room.is_public && ' • Public'}
                    </p>
                  </div>
                  {selectedRoom === room.id && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChatSidebar;
