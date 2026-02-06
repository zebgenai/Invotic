import React, { useState, useRef, useEffect } from 'react';
import { useDiscordChannels, useDiscordMessages, useSendDiscordMessage } from '@/hooks/useDiscord';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Hash, RefreshCw, MessageCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const DiscordChat: React.FC = () => {
  const { profile } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: channels, isLoading: channelsLoading, error: channelsError, refetch: refetchChannels } = useDiscordChannels();
  const { data: messages, isLoading: messagesLoading, error: messagesError, refetch: refetchMessages } = useDiscordMessages(selectedChannel);
  const sendMessage = useSendDiscordMessage();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-select first channel
  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0].id);
    }
  }, [channels, selectedChannel]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChannel) return;

    const content = `[${profile?.full_name || 'User'}]: ${messageInput}`;
    
    try {
      await sendMessage.mutateAsync({ channelId: selectedChannel, content });
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getAvatarUrl = (author: { id: string; avatar: string | null }) => {
    if (!author.avatar) return null;
    return `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-[#5865F2]" />
            Discord Chat
          </h1>
          <p className="text-muted-foreground text-sm">Connected to your Discord server</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchChannels();
            if (selectedChannel) refetchMessages();
          }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-200px)]">
        {/* Channels Sidebar */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Channels</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {channelsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : channelsError ? (
              <div className="text-center py-4">
                <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive">Failed to load channels</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {channelsError instanceof Error ? channelsError.message : 'Unknown error'}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-1">
                  {channels?.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors',
                        selectedChannel === channel.id
                          ? 'bg-[#5865F2]/20 text-[#5865F2]'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Hash className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{channel.name}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="md:col-span-3 flex flex-col">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {selectedChannel && channels ? (
                <>
                  <Hash className="w-4 h-4" />
                  {channels.find(c => c.id === selectedChannel)?.name || 'Channel'}
                </>
              ) : (
                'Select a channel'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messagesError ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
                  <p className="text-destructive">Failed to load messages</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {messagesError instanceof Error ? messagesError.message : 'Unknown error'}
                  </p>
                </div>
              ) : !selectedChannel ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Select a channel to view messages</p>
                </div>
              ) : messages?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No messages in this channel</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages?.map((message) => (
                    <div key={message.id} className="flex gap-3 group">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={getAvatarUrl(message.author) || ''} />
                        <AvatarFallback className="bg-[#5865F2]/20 text-[#5865F2]">
                          {message.author.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm">{message.author.username}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                        {message.attachments?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {message.attachments.map((attachment: any) => (
                              <a
                                key={attachment.id}
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                📎 {attachment.filename}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={selectedChannel ? "Type a message..." : "Select a channel first"}
                  disabled={!selectedChannel || sendMessage.isPending}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!selectedChannel || !messageInput.trim() || sendMessage.isPending}
                  className="bg-[#5865F2] hover:bg-[#4752C4]"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2">
                Messages sent will appear as: [{profile?.full_name || 'User'}]: your message
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiscordChat;
