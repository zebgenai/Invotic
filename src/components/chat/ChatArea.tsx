import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ChatMessage from './ChatMessage';
import VoiceRecorder from './VoiceRecorder';

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
  getSenderProfile,
  currentUserId,
  isAdmin,
  isMobile = false,
  onBack,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
              <Users className="w-4 h-4" />
            </Button>
          </div>
        </div>
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
            ) : messages?.length === 0 ? (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-primary/60" />
                </div>
                <h4 className="text-lg font-semibold mb-1">No messages yet</h4>
                <p className="text-sm text-muted-foreground">Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages?.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    sender={getSenderProfile(message.sender_id)}
                    isOwn={message.sender_id === currentUserId}
                    isAdmin={isAdmin}
                    playingAudioId={playingAudioId}
                    onPlayAudio={onPlayAudio}
                    onDeleteMessage={onDeleteMessage}
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
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          
          <div className="flex-1 flex items-center gap-2 p-1 rounded-2xl bg-secondary/50 border border-border/50 focus-within:border-primary/30 focus-within:shadow-lg focus-within:shadow-primary/5 transition-all">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
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
    </Card>
  );
};

export default ChatArea;
