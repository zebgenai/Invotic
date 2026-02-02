import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Profile {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
}

interface MessageReadReceiptsProps {
  readers: { user_id: string; read_at: string }[];
  profiles: Record<string, Profile>;
  isOwn: boolean;
  maxVisible?: number;
}

const MessageReadReceipts: React.FC<MessageReadReceiptsProps> = ({
  readers,
  profiles,
  isOwn,
  maxVisible = 3,
}) => {
  if (readers.length === 0) return null;

  const visibleReaders = readers.slice(0, maxVisible);
  const remainingCount = readers.length - maxVisible;

  const getReaderNames = () => {
    return readers
      .map((r) => profiles[r.user_id]?.full_name || 'Unknown')
      .join(', ');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-1 mt-1',
              isOwn ? 'justify-end' : 'justify-start'
            )}
          >
            <Eye className="w-3 h-3 text-muted-foreground" />
            <div className="flex -space-x-1.5">
              {visibleReaders.map((reader) => {
                const profile = profiles[reader.user_id];
                return (
                  <Avatar
                    key={reader.user_id}
                    className="w-4 h-4 border border-background"
                  >
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="text-[8px] bg-muted">
                      {profile?.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                );
              })}
            </div>
            {remainingCount > 0 && (
              <span className="text-[10px] text-muted-foreground">
                +{remainingCount}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-xs">
            <span className="font-medium">Seen by:</span> {getReaderNames()}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MessageReadReceipts;
