import React, { useState, useRef, useEffect } from 'react';
import { useDiscordChannels, useDiscordMessages, useSendDiscordMessage, DiscordMessage } from '@/hooks/useDiscord';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Send, 
  Hash, 
  RefreshCw, 
  MessageCircle, 
  AlertCircle, 
  Image as ImageIcon,
  X,
  AtSign,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DiscordChat: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) { // 8MB limit for Discord
        toast({
          title: 'File too large',
          description: 'Discord allows files up to 8MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const insertMention = (mention: string) => {
    setMessageInput(prev => prev + mention + ' ');
    inputRef.current?.focus();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageInput.trim() && !selectedImage) || !selectedChannel) return;

    let content = messageInput.trim();
    if (content) {
      content = `[${profile?.full_name || 'User'}]: ${content}`;
    }
    
    try {
      let imageBase64: string | undefined;
      let imageName: string | undefined;

      if (selectedImage) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            // Remove the data:image/xxx;base64, prefix
            const base64 = result.split(',')[1];
            resolve(base64);
          };
        });
        reader.readAsDataURL(selectedImage);
        imageBase64 = await base64Promise;
        imageName = selectedImage.name;
      }

      await sendMessage.mutateAsync({ 
        channelId: selectedChannel, 
        content: content || undefined,
        imageBase64,
        imageName
      });
      setMessageInput('');
      clearImage();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Failed to send',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const getAvatarUrl = (author: { id: string; avatar: string | null }) => {
    if (!author.avatar) return null;
    return `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png`;
  };

  const renderMessageContent = (message: DiscordMessage) => {
    const content = message.content || '';
    
    // Parse message content into safe React elements
    const parseContent = (text: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      let remaining = text;
      let keyIndex = 0;

      // Build a combined regex for all mention patterns
      const mentionPatterns: { regex: RegExp; label: string }[] = [];
      
      if (message.mention_everyone) {
        mentionPatterns.push({ regex: /@everyone/g, label: '@everyone' });
        mentionPatterns.push({ regex: /@here/g, label: '@here' });
      }
      
      message.mentions?.forEach(mention => {
        mentionPatterns.push({ 
          regex: new RegExp(`<@!?${mention.id}>`, 'g'), 
          label: `@${mention.username}` 
        });
      });

      if (mentionPatterns.length === 0) {
        return [<span key="text">{text}</span>];
      }

      // Find all mention matches and sort by position
      const matches: { index: number; length: number; label: string }[] = [];
      for (const pattern of mentionPatterns) {
        let match;
        const regex = new RegExp(pattern.regex.source, 'g');
        while ((match = regex.exec(text)) !== null) {
          matches.push({ index: match.index, length: match[0].length, label: pattern.label });
        }
      }
      matches.sort((a, b) => a.index - b.index);

      let lastIndex = 0;
      for (const m of matches) {
        if (m.index > lastIndex) {
          parts.push(<span key={keyIndex++}>{remaining.slice(lastIndex - (text.length - remaining.length), m.index - (text.length - remaining.length))}</span>);
        }
        parts.push(
          <span key={keyIndex++} className="bg-[#5865F2]/30 text-[#5865F2] px-1 rounded">
            {m.label}
          </span>
        );
        lastIndex = m.index + m.length;
      }

      // Rebuild using absolute positions
      parts.length = 0;
      keyIndex = 0;
      let pos = 0;
      for (const m of matches) {
        if (m.index > pos) {
          parts.push(<span key={keyIndex++}>{text.slice(pos, m.index)}</span>);
        }
        parts.push(
          <span key={keyIndex++} className="bg-[#5865F2]/30 text-[#5865F2] px-1 rounded">
            {m.label}
          </span>
        );
        pos = m.index + m.length;
      }
      if (pos < text.length) {
        parts.push(<span key={keyIndex++}>{text.slice(pos)}</span>);
      }

      return parts;
    };

    return (
      <div className="space-y-2">
        {content && (
          <p className="text-sm break-words">
            {parseContent(content)}
          </p>
        )}
        {message.attachments?.map((attachment) => (
          <div key={attachment.id} className="mt-2">
            {attachment.content_type?.startsWith('image/') ? (
              <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                <img 
                  src={attachment.proxy_url || attachment.url} 
                  alt={attachment.filename}
                  className="max-w-xs md:max-w-sm rounded-lg border border-border hover:opacity-90 transition-opacity"
                  style={{ maxHeight: '300px' }}
                />
              </a>
            ) : (
              <a 
                href={attachment.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm truncate">{attachment.filename}</span>
              </a>
            )}
          </div>
        ))}
      </div>
    );
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
        <Card className="md:col-span-1 bg-[#2B2D31] border-[#1E1F22]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#B5BAC1]">TEXT CHANNELS</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {channelsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full bg-[#3B3D44]" />
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
                <div className="space-y-0.5">
                  {channels?.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left transition-colors group',
                        selectedChannel === channel.id
                          ? 'bg-[#404249] text-white'
                          : 'text-[#949BA4] hover:bg-[#35373C] hover:text-[#DBDEE1]'
                      )}
                    >
                      <Hash className="w-5 h-5 flex-shrink-0 text-[#80848E]" />
                      <span className="truncate">{channel.name}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="md:col-span-3 flex flex-col bg-[#313338] border-[#1E1F22]">
          <CardHeader className="pb-2 border-b border-[#3B3D44]">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
              {selectedChannel && channels ? (
                <>
                  <Hash className="w-5 h-5 text-[#80848E]" />
                  <span className="font-semibold">
                    {channels.find(c => c.id === selectedChannel)?.name || 'Channel'}
                  </span>
                </>
              ) : (
                'Select a channel'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-10 h-10 rounded-full bg-[#3B3D44]" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32 bg-[#3B3D44]" />
                        <Skeleton className="h-4 w-full bg-[#3B3D44]" />
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
                <div className="text-center py-8 text-[#949BA4]">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Select a channel to view messages</p>
                </div>
              ) : messages?.length === 0 ? (
                <div className="text-center py-8 text-[#949BA4]">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No messages in this channel</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages?.map((message) => (
                    <div
                      key={message.id}
                      className="flex gap-3 hover:bg-[#2E3035] p-1 -mx-1 rounded group"
                    >
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={getAvatarUrl(message.author) || undefined} />
                        <AvatarFallback className="bg-[#5865F2] text-white">
                          {message.author.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-[#F2F3F5] hover:underline cursor-pointer">
                            {message.author.username}
                          </span>
                          <span className="text-xs text-[#949BA4]">
                            {format(new Date(message.timestamp), 'MM/dd/yyyy h:mm a')}
                          </span>
                        </div>
                        <div className="text-[#DBDEE1]">
                          {renderMessageContent(message)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Image Preview */}
            {imagePreview && (
              <div className="px-4 pb-2">
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-32 rounded-lg border border-[#3B3D44]"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full text-white hover:bg-destructive/90"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 pt-0">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-[#383A40] rounded-lg px-4">
                  {/* Image Upload Button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#B5BAC1] hover:text-white transition-colors p-1"
                    title="Upload image"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  {/* Mention Button */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="text-[#B5BAC1] hover:text-white transition-colors p-1"
                        title="Mention"
                      >
                        <AtSign className="w-5 h-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2 bg-[#2B2D31] border-[#1E1F22]">
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => insertMention('@everyone')}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded hover:bg-[#404249] text-[#DBDEE1]"
                        >
                          <span className="text-[#5865F2]">@</span>
                          everyone
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMention('@here')}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded hover:bg-[#404249] text-[#DBDEE1]"
                        >
                          <span className="text-[#5865F2]">@</span>
                          here
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Input
                    ref={inputRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Message #${channels?.find(c => c.id === selectedChannel)?.name || 'channel'}`}
                    disabled={!selectedChannel || sendMessage.isPending}
                    className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[#DBDEE1] placeholder:text-[#6D6F78]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={(!messageInput.trim() && !selectedImage) || !selectedChannel || sendMessage.isPending}
                  className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiscordChat;
