import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Play, Pause, Trash2, CheckCheck, Download } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Profile {
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

interface ChatMessageProps {
  message: Message;
  sender: Profile | null | undefined;
  isOwn: boolean;
  isAdmin: boolean;
  playingAudioId: string | null;
  onPlayAudio: (audioUrl: string, messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onDeleteForMe: (messageId: string) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (messageId: string) => void;
  canDeleteOwn?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  sender,
  isOwn,
  isAdmin,
  playingAudioId,
  onPlayAudio,
  onDeleteMessage,
  onDeleteForMe,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
  canDeleteOwn = true,
}) => {
  // User can delete for everyone if: they own the message OR they are admin
  const canDeleteForEveryone = isOwn || isAdmin;

  return (
    <div
      className={cn(
        'flex gap-3 group animate-fade-in items-start',
        isOwn && 'flex-row-reverse',
        isSelected && 'bg-primary/5 rounded-lg p-2 -m-2'
      )}
    >
      {/* Selection checkbox */}
      {isSelectionMode && isAdmin && (
        <div className="flex items-center pt-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect?.(message.id)}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
      )}
      <Avatar className={cn(
        'w-9 h-9 ring-2 ring-offset-2 ring-offset-background transition-all',
        isOwn ? 'ring-primary/30' : 'ring-secondary'
      )}>
        <AvatarImage src={sender?.avatar_url || ''} />
        <AvatarFallback className={cn(
          'text-xs font-medium',
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
        )}>
          {sender?.full_name?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn('flex items-end gap-1.5 max-w-[70%]', isOwn && 'flex-row-reverse')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 relative overflow-hidden',
            isOwn
              ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md shadow-lg shadow-primary/20'
              : 'bg-secondary/80 backdrop-blur-sm rounded-bl-md border border-border/50'
          )}
        >
          {/* Subtle shine effect for own messages */}
          {isOwn && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          )}
          
          {!isOwn && (
            <p className="text-xs font-semibold mb-1.5 text-primary">
              {sender?.full_name || 'Unknown'}
            </p>
          )}
          
          {/* Voice message */}
          {message.file_type === 'audio' && message.file_url && (
            <div className="flex items-center gap-3 mb-2 p-2 rounded-lg bg-black/10">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-full",
                  isOwn 
                    ? "bg-white/20 text-white hover:bg-white/30" 
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                )}
                onClick={() => onPlayAudio(message.file_url!, message.id)}
              >
                {playingAudioId === message.id ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </Button>
              <div className="flex-1 flex items-center gap-1">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1 rounded-full transition-all",
                      isOwn ? "bg-white/40" : "bg-primary/40",
                      playingAudioId === message.id && "animate-pulse"
                    )}
                    style={{ 
                      height: `${Math.random() * 16 + 8}px`,
                      animationDelay: `${i * 100}ms`
                    }}
                  />
                ))}
              </div>
              <span className={cn(
                "text-xs",
                isOwn ? "text-white/60" : "text-muted-foreground"
              )}>
                0:15
              </span>
            </div>
          )}

          {/* Image attachment */}
          {message.file_type === 'image' && message.file_url && (
            <div className="mb-2 -mx-2 -mt-1 relative group/image">
              <img 
                src={message.file_url} 
                alt="Attachment" 
                className="max-w-full rounded-xl max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              />
              {/* Admin download button */}
              {isAdmin && (
                <a
                  href={message.file_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity",
                    "p-2 rounded-lg backdrop-blur-sm",
                    "bg-black/50 hover:bg-black/70 text-white"
                  )}
                  title="Download image"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          <p className="text-sm whitespace-pre-wrap relative z-10">{message.content}</p>
          
          <div className={cn(
            'flex items-center gap-1.5 mt-1.5',
            isOwn ? 'justify-end' : 'justify-start'
          )}>
            <span className={cn(
              'text-[10px]',
              isOwn ? 'text-white/60' : 'text-muted-foreground'
            )}>
              {format(new Date(message.created_at), 'h:mm a')}
            </span>
            {isOwn && (
              <CheckCheck className={cn(
                "w-3.5 h-3.5",
                message.is_read ? "text-info" : "text-white/40"
              )} />
            )}
          </div>
        </div>
        
        {/* Delete button with dropdown for options */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
              title="Delete message"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-card">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Message</AlertDialogTitle>
              <AlertDialogDescription>
                How would you like to delete this message?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
              <AlertDialogAction
                onClick={() => onDeleteForMe(message.id)}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                Delete for Me
              </AlertDialogAction>
              {canDeleteForEveryone && (
                <AlertDialogAction
                  onClick={() => onDeleteMessage(message.id)}
                  className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete for Everyone
                </AlertDialogAction>
              )}
              <AlertDialogCancel className="w-full mt-0">Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ChatMessage;
