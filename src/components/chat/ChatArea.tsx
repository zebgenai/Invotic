import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
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
import {
  MessageCircle,
  Send,
  Users,
  Hash,
  Megaphone,
  Paperclip,
  Loader2,
  Sparkles,
  Smile,
  ArrowLeft,
  Trash2,
  CalendarIcon,
  CheckSquare,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isWithinInterval, parseISO, format, startOfDay, endOfDay } from 'date-fns';
import ChatMessage from './ChatMessage';
import ChatMembersDialog from './ChatMembersDialog';
import VoiceRecorder from './VoiceRecorder';
import type { DateRange } from 'react-day-picker';

interface Profile {
  user_id: string;
  avatar_url: string | null;
  full_name: string;
}

interface Message {
  id: string;
  content: string | null;
  sender_id: string;
  created_at: string;
  file_url: string | null;
  file_type: string | null;
  is_read: boolean;
}

interface ChatRoom {
  id: string;
  name: string | null;
  is_group: boolean;
  is_broadcast: boolean;
  created_by: string;
}

interface ChatAreaProps {
  selectedRoom: string | null;
  selectedRoomData: ChatRoom | undefined;
  messages: Message[] | undefined;
  messagesLoading: boolean;
  messageInput: string;
  setMessageInput: (value: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVoiceRecordingComplete: (blob: Blob) => void;
  isUploadingVoice: boolean;
  playingAudioId: string | null;
  onPlayAudio: (audioUrl: string, messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onDeleteForMe: (messageId: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteAllMessages?: () => void;
  onDeleteSelectedMessages?: (messageIds: string[]) => void;
  getSenderProfile: (senderId: string) => Profile | null | undefined;
  currentUserId: string | undefined;
  isAdmin: boolean;
  isMobile?: boolean;
  onBack?: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedRoom,
  selectedRoomData,
  messages,
  messagesLoading,
  messageInput,
  setMessageInput,
  handleSendMessage,
  handleFileUpload,
  handleVoiceRecordingComplete,
  isUploadingVoice,
  playingAudioId,
  onPlayAudio,
  onDeleteMessage,
  onDeleteForMe,
  onEditMessage,
  onDeleteAllMessages,
  onDeleteSelectedMessages,
  getSenderProfile,
  currentUserId,
  isAdmin,
  isMobile = false,
  onBack,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
  const [showMembersDialog, setShowMembersDialog] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset selection when room changes
  useEffect(() => {
    setSelectedMessageIds(new Set());
    setIsSelectionMode(false);
  }, [selectedRoom]);

  // Filter messages by date range
  const filteredMessages = useMemo(() => {
    if (!messages) return [];
    if (!dateRange?.from) return messages;

    return messages.filter((message) => {
      const messageDate = parseISO(message.created_at);
      const start = startOfDay(dateRange.from!);
      const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from!);
      return isWithinInterval(messageDate, { start, end });
    });
  }, [messages, dateRange]);

  const handleToggleSelect = (messageId: string) => {
    setSelectedMessageIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedMessageIds.size === filteredMessages.length) {
      setSelectedMessageIds(new Set());
    } else {
      setSelectedMessageIds(new Set(filteredMessages.map((m) => m.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (onDeleteSelectedMessages && selectedMessageIds.size > 0) {
      onDeleteSelectedMessages(Array.from(selectedMessageIds));
      setSelectedMessageIds(new Set());
      setIsSelectionMode(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectedMessageIds(new Set());
    setIsSelectionMode(false);
  };

  const clearDateRange = () => {
    setDateRange(undefined);
  };

  const getRoomIcon = (room: ChatRoom) => {
    if (room?.is_broadcast) return <Megaphone className="w-5 h-5" />;
    if (room?.is_group) return <Hash className="w-5 h-5" />;
    return <MessageCircle className="w-5 h-5" />;
  };

  if (!selectedRoom) {
    return (
      <Card className="flex-1 flex flex-col bg-card/40 backdrop-blur-xl border-border/50 overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
                <MessageCircle className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center animate-bounce">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-display font-bold mb-2">Welcome to Chat</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Select a conversation from the sidebar to start messaging with your team
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex-1 flex flex-col bg-card/40 backdrop-blur-xl border-border/50 overflow-hidden">
      {/* Chat Header */}
      <CardHeader className="border-b border-border/50 pb-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            {isMobile && onBack && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onBack}
                className="rounded-xl hover:bg-primary/10 hover:text-primary"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-primary/20 to-primary/10 text-primary",
              "shadow-lg shadow-primary/10"
            )}>
              {selectedRoomData && getRoomIcon(selectedRoomData)}
            </div>
            <div>
              <CardTitle className="text-base md:text-lg font-display flex items-center gap-2">
                {selectedRoomData?.name || 'Private Chat'}
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              </CardTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Users className="w-3 h-3" />
                {selectedRoomData?.is_broadcast
                  ? 'Broadcast Channel'
                  : selectedRoomData?.is_group
                  ? 'Group Chat'
                  : 'Direct Message'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Delete All Messages - Admin Only */}
            {isAdmin && onDeleteAllMessages && messages && messages.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
                    title="Delete all messages"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Messages</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete all messages in this chat room? 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={onDeleteAllMessages}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl hover:bg-primary/10 hover:text-primary"
              onClick={() => setShowMembersDialog(true)}
              title="Manage members"
            >
              <Users className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Date Range Filter & Selection Mode - Admin Only */}
        {isAdmin && (
          <div className="relative z-10 mt-4 flex flex-wrap items-center gap-2">
            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 text-xs">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
                      </>
                    ) : (
                      format(dateRange.from, 'MMM d, yyyy')
                    )
                  ) : (
                    'Filter by date'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={isMobile ? 1 : 2}
                />
              </PopoverContent>
            </Popover>

            {dateRange?.from && (
              <Button variant="ghost" size="sm" onClick={clearDateRange} className="h-9 px-2">
                <X className="w-3.5 h-3.5" />
              </Button>
            )}

            {/* Selection Mode Toggle */}
            <Button
              variant={isSelectionMode ? 'secondary' : 'outline'}
              size="sm"
              className="h-9 gap-2 text-xs"
              onClick={() => setIsSelectionMode(!isSelectionMode)}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              {isSelectionMode ? 'Cancel Selection' : 'Select Messages'}
            </Button>

            {/* Selection Actions */}
            {isSelectionMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs"
                  onClick={handleSelectAll}
                >
                  {selectedMessageIds.size === filteredMessages.length ? 'Deselect All' : 'Select All'}
                </Button>

                {selectedMessageIds.size > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-9 gap-2 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete {selectedMessageIds.size} message{selectedMessageIds.size > 1 ? 's' : ''}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Messages</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {selectedMessageIds.size} selected message{selectedMessageIds.size > 1 ? 's' : ''}? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteSelected}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Selected
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            )}

            {/* Show selected count badge */}
            {isSelectionMode && selectedMessageIds.size > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedMessageIds.size} selected
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-4">
            {messagesLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-muted-foreground">Loading messages...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-primary/60" />
                </div>
                <h4 className="text-lg font-semibold mb-1">
                  {messages?.length === 0 ? 'No messages yet' : 'No messages in selected date range'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {messages?.length === 0 ? 'Start the conversation!' : 'Try selecting a different date range'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    sender={getSenderProfile(message.sender_id)}
                    isOwn={message.sender_id === currentUserId}
                    isAdmin={isAdmin}
                    playingAudioId={playingAudioId}
                    onPlayAudio={onPlayAudio}
                    onDeleteMessage={onDeleteMessage}
                    onDeleteForMe={onDeleteForMe}
                    onEditMessage={onEditMessage}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedMessageIds.has(message.id)}
                    onToggleSelect={handleToggleSelect}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="p-4 border-t border-border/50 bg-card/60 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*"
          />
          
          <div className="flex-1 flex items-center gap-2 p-1 rounded-2xl bg-secondary/50 border border-border/50 focus-within:border-primary/30 focus-within:shadow-lg focus-within:shadow-primary/5 transition-all">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="Attach image"
              className="rounded-xl hover:bg-primary/10 hover:text-primary ml-1"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
            />
            
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              className="rounded-xl hover:bg-primary/10 hover:text-primary"
            >
              <Smile className="w-4 h-4" />
            </Button>
            
            {/* Voice Recording */}
            {isUploadingVoice ? (
              <Button variant="ghost" size="icon" disabled className="rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin" />
              </Button>
            ) : (
              <VoiceRecorder 
                onRecordingComplete={handleVoiceRecordingComplete}
                disabled={!selectedRoom}
              />
            )}
          </div>
          
          <Button 
            type="submit" 
            size="icon" 
            disabled={!messageInput.trim()}
            className={cn(
              "rounded-xl h-11 w-11 transition-all",
              messageInput.trim() 
                ? "bg-primary shadow-lg shadow-primary/30 hover:shadow-primary/40" 
                : "bg-muted"
            )}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Members Dialog */}
      {selectedRoomData && (
        <ChatMembersDialog
          open={showMembersDialog}
          onClose={() => setShowMembersDialog(false)}
          roomId={selectedRoom}
          roomName={selectedRoomData.name || 'Private Chat'}
          roomCreatorId={selectedRoomData.created_by || ''}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      )}
    </Card>
  );
};

export default ChatArea;
