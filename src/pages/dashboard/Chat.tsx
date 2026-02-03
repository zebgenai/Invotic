import React, { useState, useRef, useEffect } from 'react';
import { useChatRooms, useMessages, useSendMessage, useCreateChatRoom, useUpdateChatRoom, useDeleteMessage, useDeleteMessageForMe, useDeleteAllMessages, useDeleteSelectedMessages, useEditMessage, useCreatePrivateChat, useAllProfiles, useDeleteChatRoom, useChatRoomMembers } from '@/hooks/useChat';
import { useProfiles } from '@/hooks/useProfiles';
import { useChatMemberProfiles } from '@/hooks/useChatProfiles';
import { useChatPresence } from '@/hooks/useChatPresence';
import { useRoomMessageReads, useMarkMessagesAsRead } from '@/hooks/useMessageReads';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatArea from '@/components/chat/ChatArea';
import ImageCropper from '@/components/ImageCropper';
import { useIsMobile } from '@/hooks/use-mobile';
import { useChatEnabled, useUpdateAppSetting } from '@/hooks/useAppSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageCircleOff, Settings } from 'lucide-react';

const Chat: React.FC = () => {
  const { user, profile, role } = useAuth();
  const { chatEnabled, isLoading: chatSettingLoading } = useChatEnabled();
  const updateSetting = useUpdateAppSetting();
  const isAdmin = role === 'admin';
  
  // All hooks must be called before any conditional returns
  const { data: rooms, isLoading: roomsLoading } = useChatRooms();
  const { data: adminProfiles } = useProfiles(); // For admins/managers only
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const { data: messages, isLoading: messagesLoading } = useMessages(selectedRoom);
  
  // Get profiles for current room members - works for ALL users
  const { data: roomMemberProfiles } = useChatMemberProfiles(selectedRoom);
  
  // Get room members for total count
  const { data: roomMembers } = useChatRoomMembers(selectedRoom);
  
  // Get presence data for current room
  const { onlineUsers, onlineCount } = useChatPresence(selectedRoom);
  
  // Get message read receipts for current room
  const { data: messageReads } = useRoomMessageReads(selectedRoom);
  const markMessagesAsRead = useMarkMessagesAsRead();
  
  // Get message reactions for current room
  const { getReactionsForMessage, toggleReaction } = useMessageReactions(selectedRoom);
  
  const sendMessage = useSendMessage();
  const createRoom = useCreateChatRoom();
  const updateRoom = useUpdateChatRoom();
  const deleteMessage = useDeleteMessage();
  const deleteMessageForMe = useDeleteMessageForMe();
  const deleteAllMessages = useDeleteAllMessages();
  const deleteSelectedMessages = useDeleteSelectedMessages();
  const editMessage = useEditMessage();
  const createPrivateChat = useCreatePrivateChat();
  const deleteChatRoom = useDeleteChatRoom();
  const { data: allProfiles } = useAllProfiles();
  const { toast } = useToast();
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState<'private' | 'group' | 'broadcast'>('group');
  const [isPublicRoom, setIsPublicRoom] = useState(false);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMobile = useIsMobile();
  
  // Image cropper state
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  // Mark messages as read when entering a room or when new messages arrive
  // IMPORTANT: keep this light to avoid overloading the backend (which can break sending).
  useEffect(() => {
    if (!selectedRoom || !messages || messages.length === 0 || !user?.id) return;
    if (markMessagesAsRead.isPending) return;

    // Get message IDs that the user hasn't read yet (excluding own messages)
    const unreadMessageIds = messages
      .filter((m) => m.sender_id !== user.id)
      .filter((m) => {
        const reads = messageReads?.[m.id] || [];
        return !reads.some((r) => r.user_id === user.id);
      })
      .map((m) => m.id);

    // Only mark a few at a time to prevent DB timeouts/500s
    const MAX_MARK_PER_TICK = 5;
    const limited = unreadMessageIds.slice(-MAX_MARK_PER_TICK);

    if (limited.length > 0) {
      markMessagesAsRead.mutate({ messageIds: limited, roomId: selectedRoom });
    }
  }, [selectedRoom, messages, user?.id, messageReads, markMessagesAsRead.isPending]);

  const handleToggleReaction = (messageId: string, emoji: string) => {
    toggleReaction.mutate({ messageId, emoji });
  };

  const handleToggleChatEnabled = async () => {
    try {
      await updateSetting.mutateAsync({ key: 'chat_enabled', value: !chatEnabled });
    } catch (error) {
      console.error('Failed to toggle chat setting:', error);
    }
  };

  // Show disabled message for non-admin users when chat is disabled
  if (!chatEnabled && !isAdmin) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageCircleOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle>Chat is Currently Disabled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The chat feature has been temporarily disabled by an administrator. 
              Please check back later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    if (!selectedRoom) return;
    if (!user?.id) {
      toast({
        title: 'Please wait',
        description: 'Your session is still loading. Try again in a moment.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await sendMessage.mutateAsync({
        roomId: selectedRoom,
        content: messageInput.trim(),
      });
      setMessageInput('');
    } catch (error) {
      const details = error instanceof Error ? error.message : 'Failed to send message. Please try again.';
      toast({
        title: 'Error',
        description: details,
        variant: 'destructive',
      });
    }
  };

  const handleVoiceRecordingComplete = async (audioBlob: Blob) => {
    if (!selectedRoom || !user) return;

    setIsUploadingVoice(true);
    try {
      const fileName = `voice-messages/${user.id}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName);

      await sendMessage.mutateAsync({
        roomId: selectedRoom,
        content: '🎤 Voice message',
        fileUrl: urlData.publicUrl,
        fileType: 'audio',
      });

      toast({
        title: 'Voice message sent!',
        description: 'Your voice message has been delivered.',
      });
    } catch (error) {
      console.error('Voice upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send voice message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingVoice(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRoom || !user) return;

    // Only allow image files
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Only image files are allowed in chat.',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 10MB.',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    // Show cropper instead of uploading directly
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
    setPendingImageFile(file);
    setShowImageCropper(true);
    e.target.value = '';
  };

  const handleImageCropComplete = async (blob: Blob, _url: string) => {
    if (!selectedRoom || !user || !pendingImageFile) return;

    try {
      const fileName = `attachments/${user.id}/${Date.now()}-${pendingImageFile.name.replace(/\.[^/.]+$/, '')}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName);

      await sendMessage.mutateAsync({
        roomId: selectedRoom,
        content: `📷 Image`,
        fileUrl: urlData.publicUrl,
        fileType: 'image',
      });

      toast({
        title: 'Image sent!',
        description: 'Your image has been delivered.',
      });
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      // Clean up
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(null);
      }
      setPendingImageFile(null);
    }
  };

  const playAudio = (audioUrl: string, messageId: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (playingAudioId === messageId) {
      setPlayingAudioId(null);
      return;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.play();
    setPlayingAudioId(messageId);

    audio.onended = () => {
      setPlayingAudioId(null);
    };
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
        isPublic: isPublicRoom,
      });
      toast({
        title: 'Room created!',
        description: `${newRoomName} has been created${isPublicRoom ? ' as a public room' : ''}.`,
      });
      setNewRoomName('');
      setIsPublicRoom(false);
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create room. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedRoom) return;
    try {
      await deleteMessage.mutateAsync({ messageId, roomId: selectedRoom });
      toast({
        title: 'Message deleted',
        description: 'The message has been removed for everyone.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete message.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteForMe = async (messageId: string) => {
    if (!selectedRoom) return;
    try {
      await deleteMessageForMe.mutateAsync({ messageId, roomId: selectedRoom });
      toast({
        title: 'Message hidden',
        description: 'The message has been removed from your view.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to hide message.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAllMessages = async () => {
    if (!selectedRoom) return;
    try {
      await deleteAllMessages.mutateAsync({ roomId: selectedRoom });
      toast({
        title: 'All messages deleted',
        description: 'All messages in this chat have been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete messages.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSelectedMessages = async (messageIds: string[]) => {
    if (!selectedRoom || messageIds.length === 0) return;
    try {
      await deleteSelectedMessages.mutateAsync({ messageIds, roomId: selectedRoom });
      toast({
        title: 'Messages deleted',
        description: `${messageIds.length} message${messageIds.length > 1 ? 's have' : ' has'} been removed.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete selected messages.',
        variant: 'destructive',
      });
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!selectedRoom) return;
    try {
      await editMessage.mutateAsync({ messageId, content: newContent, roomId: selectedRoom });
      toast({
        title: 'Message updated',
        description: 'Your message has been edited.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to edit message.',
        variant: 'destructive',
      });
    }
  };

  const handleStartDirectChat = async (targetUserId: string, targetUserName: string) => {
    try {
      const room = await createPrivateChat.mutateAsync({ targetUserId, targetUserName });
      setSelectedRoom(room.id);
      toast({
        title: 'Chat opened',
        description: `Started conversation with ${targetUserName}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start conversation.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;
    try {
      await deleteChatRoom.mutateAsync({ roomId: selectedRoom });
      setSelectedRoom(null);
      toast({
        title: 'Room deleted',
        description: 'The chat room and all its messages have been deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete room.',
        variant: 'destructive',
      });
    }
  };

  const getSenderProfile = (senderId: string) => {
    if (senderId === user?.id) return { ...profile, user_id: user.id };
    // First try room member profiles (works for all users)
    const roomProfile = roomMemberProfiles?.find((p) => p.user_id === senderId);
    if (roomProfile) return roomProfile;
    // Fallback to admin profiles if available
    const adminProfile = adminProfiles?.find((p) => p.user_id === senderId);
    if (adminProfile) return adminProfile;
    return null;
  };

  // Build allProfiles list for message read receipts
  const allProfilesList = roomMemberProfiles?.map(p => ({
    user_id: p.user_id,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
  })) || [];

  const selectedRoomData = rooms?.find((r) => r.id === selectedRoom);

  // Transform rooms data to include is_public
  const transformedRooms = rooms?.map(room => ({
    ...room,
    is_public: (room as any).is_public || false,
  }));

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
  };

  const handleBackToRooms = () => {
    setSelectedRoom(null);
  };

  // Mobile: Show sidebar or chat area based on selection
  if (isMobile) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Admin Control Bar */}
        {isAdmin && (
          <div className="flex items-center justify-between p-3 bg-muted/50 border-b border-border rounded-t-lg">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Chat Control</span>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="chat-toggle-mobile" className="text-sm text-muted-foreground">
                {chatEnabled ? 'Enabled' : 'Disabled'}
              </Label>
              <Switch
                id="chat-toggle-mobile"
                checked={chatEnabled}
                onCheckedChange={handleToggleChatEnabled}
                disabled={updateSetting.isPending}
              />
            </div>
          </div>
        )}
        {!selectedRoom ? (
          <ChatSidebar
            rooms={transformedRooms}
            roomsLoading={roomsLoading}
            selectedRoom={selectedRoom}
            setSelectedRoom={handleRoomSelect}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isCreateDialogOpen={isCreateDialogOpen}
            setIsCreateDialogOpen={setIsCreateDialogOpen}
            newRoomName={newRoomName}
            setNewRoomName={setNewRoomName}
            newRoomType={newRoomType}
            setNewRoomType={setNewRoomType}
            isPublicRoom={isPublicRoom}
            setIsPublicRoom={setIsPublicRoom}
            handleCreateRoom={handleCreateRoom}
            createRoomPending={createRoom.isPending}
            canCreateRoom={role === 'admin' || role === 'manager'}
            isMobile={true}
            allProfiles={allProfiles}
            onStartDirectChat={handleStartDirectChat}
          />
        ) : (
          <ChatArea
            selectedRoom={selectedRoom}
            selectedRoomData={selectedRoomData}
            messages={messages}
            messagesLoading={messagesLoading}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            handleSendMessage={handleSendMessage}
            isSending={sendMessage.isPending}
            handleFileUpload={handleFileUpload}
            handleVoiceRecordingComplete={handleVoiceRecordingComplete}
            isUploadingVoice={isUploadingVoice}
            playingAudioId={playingAudioId}
            onPlayAudio={playAudio}
            onDeleteMessage={handleDeleteMessage}
            onDeleteForMe={handleDeleteForMe}
            onEditMessage={handleEditMessage}
            onDeleteAllMessages={handleDeleteAllMessages}
            onDeleteSelectedMessages={handleDeleteSelectedMessages}
            onDeleteRoom={handleDeleteRoom}
            getSenderProfile={getSenderProfile}
            currentUserId={user?.id}
            isAdmin={role === 'admin'}
            isMobile={true}
            onBack={handleBackToRooms}
            onlineCount={onlineCount}
            onlineUsers={onlineUsers}
            totalMembers={roomMembers?.length || 0}
            messageReads={messageReads || {}}
            allProfiles={allProfilesList}
            getReactionsForMessage={getReactionsForMessage}
            onToggleReaction={handleToggleReaction}
          />
        )}

        {/* Image Cropper Dialog for Mobile */}
        {imagePreviewUrl && (
          <ImageCropper
            open={showImageCropper}
            onClose={() => {
              setShowImageCropper(false);
              if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
                setImagePreviewUrl(null);
              }
              setPendingImageFile(null);
            }}
            imageSrc={imagePreviewUrl}
            onCropComplete={handleImageCropComplete}
            title="Crop Image"
            description="Adjust the crop area before sending"
          />
        )}
      </div>
    );
  }

  // Desktop: Side-by-side layout
  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] gap-4">
      {/* Admin Control Bar */}
      {isAdmin && (
        <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-lg">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Chat Control</span>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="chat-toggle-desktop" className="text-sm text-muted-foreground">
              {chatEnabled ? 'Chat Enabled for Users' : 'Chat Disabled for Users'}
            </Label>
            <Switch
              id="chat-toggle-desktop"
              checked={chatEnabled}
              onCheckedChange={handleToggleChatEnabled}
              disabled={updateSetting.isPending}
            />
          </div>
        </div>
      )}
      <div className="flex flex-1 gap-4 min-h-0">
        <ChatSidebar
        rooms={transformedRooms}
        roomsLoading={roomsLoading}
        selectedRoom={selectedRoom}
        setSelectedRoom={handleRoomSelect}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isCreateDialogOpen={isCreateDialogOpen}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
        newRoomName={newRoomName}
        setNewRoomName={setNewRoomName}
        newRoomType={newRoomType}
        setNewRoomType={setNewRoomType}
        isPublicRoom={isPublicRoom}
        setIsPublicRoom={setIsPublicRoom}
        handleCreateRoom={handleCreateRoom}
        createRoomPending={createRoom.isPending}
        canCreateRoom={role === 'admin' || role === 'manager'}
        allProfiles={allProfiles}
        onStartDirectChat={handleStartDirectChat}
      />

      <ChatArea
        selectedRoom={selectedRoom}
        selectedRoomData={selectedRoomData}
        messages={messages}
        messagesLoading={messagesLoading}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        handleSendMessage={handleSendMessage}
        isSending={sendMessage.isPending}
        handleFileUpload={handleFileUpload}
        handleVoiceRecordingComplete={handleVoiceRecordingComplete}
        isUploadingVoice={isUploadingVoice}
        playingAudioId={playingAudioId}
        onPlayAudio={playAudio}
        onDeleteMessage={handleDeleteMessage}
        onDeleteForMe={handleDeleteForMe}
        onEditMessage={handleEditMessage}
        onDeleteAllMessages={handleDeleteAllMessages}
        onDeleteSelectedMessages={handleDeleteSelectedMessages}
        onDeleteRoom={handleDeleteRoom}
        getSenderProfile={getSenderProfile}
        currentUserId={user?.id}
        isAdmin={role === 'admin'}
        onlineCount={onlineCount}
        onlineUsers={onlineUsers}
        totalMembers={roomMembers?.length || 0}
        messageReads={messageReads || {}}
        allProfiles={allProfilesList}
        getReactionsForMessage={getReactionsForMessage}
        onToggleReaction={handleToggleReaction}
      />
      </div>

      {/* Image Cropper Dialog */}
      {imagePreviewUrl && (
        <ImageCropper
          open={showImageCropper}
          onClose={() => {
            setShowImageCropper(false);
            if (imagePreviewUrl) {
              URL.revokeObjectURL(imagePreviewUrl);
              setImagePreviewUrl(null);
            }
            setPendingImageFile(null);
          }}
          imageSrc={imagePreviewUrl}
          onCropComplete={handleImageCropComplete}
          title="Crop Image"
          description="Adjust the crop area before sending"
        />
      )}
    </div>
  );
};

export default Chat;
