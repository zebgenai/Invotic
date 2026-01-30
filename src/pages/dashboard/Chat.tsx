import React, { useState, useRef } from 'react';
import { useChatRooms, useMessages, useSendMessage, useCreateChatRoom, useUpdateChatRoom, useDeleteMessage, useDeleteAllMessages } from '@/hooks/useChat';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatArea from '@/components/chat/ChatArea';
import { useIsMobile } from '@/hooks/use-mobile';

const Chat: React.FC = () => {
  const { user, profile, role } = useAuth();
  const { data: rooms, isLoading: roomsLoading } = useChatRooms();
  const { data: profiles } = useProfiles();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const { data: messages, isLoading: messagesLoading } = useMessages(selectedRoom);
  const sendMessage = useSendMessage();
  const createRoom = useCreateChatRoom();
  const updateRoom = useUpdateChatRoom();
  const deleteMessage = useDeleteMessage();
  const deleteAllMessages = useDeleteAllMessages();
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

    try {
      const fileName = `attachments/${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName);

      await sendMessage.mutateAsync({
        roomId: selectedRoom,
        content: `📷 ${file.name}`,
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
    }

    e.target.value = '';
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
        description: 'The message has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete message.',
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

  const getSenderProfile = (senderId: string) => {
    if (senderId === user?.id) return profile;
    return profiles?.find((p) => p.user_id === senderId);
  };

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
            handleFileUpload={handleFileUpload}
            handleVoiceRecordingComplete={handleVoiceRecordingComplete}
            isUploadingVoice={isUploadingVoice}
            playingAudioId={playingAudioId}
            onPlayAudio={playAudio}
            onDeleteMessage={handleDeleteMessage}
            onDeleteAllMessages={handleDeleteAllMessages}
            getSenderProfile={getSenderProfile}
            currentUserId={user?.id}
            isAdmin={role === 'admin'}
            isMobile={true}
            onBack={handleBackToRooms}
          />
        )}
      </div>
    );
  }

  // Desktop: Side-by-side layout
  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
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
      />

      <ChatArea
        selectedRoom={selectedRoom}
        selectedRoomData={selectedRoomData}
        messages={messages}
        messagesLoading={messagesLoading}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        handleSendMessage={handleSendMessage}
        handleFileUpload={handleFileUpload}
        handleVoiceRecordingComplete={handleVoiceRecordingComplete}
        isUploadingVoice={isUploadingVoice}
        playingAudioId={playingAudioId}
        onPlayAudio={playAudio}
        onDeleteMessage={handleDeleteMessage}
        onDeleteAllMessages={handleDeleteAllMessages}
        getSenderProfile={getSenderProfile}
        currentUserId={user?.id}
        isAdmin={role === 'admin'}
      />
    </div>
  );
};

export default Chat;
