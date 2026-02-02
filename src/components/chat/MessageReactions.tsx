import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SmilePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroupedReaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

interface Profile {
  user_id: string;
  full_name: string;
}

interface MessageReactionsProps {
  messageId: string;
  reactions: GroupedReaction[];
  onReact: (emoji: string) => void;
  isOwn: boolean;
  profiles?: Record<string, Profile>;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions,
  onReact,
  isOwn,
  profiles = {},
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const getReactorNames = (userIds: string[]): string => {
    const names = userIds.map((id) => profiles[id]?.full_name || 'Unknown').slice(0, 5);
    if (userIds.length > 5) {
      names.push(`and ${userIds.length - 5} more`);
    }
    return names.join(', ');
  };

  return (
    <div className={cn('flex items-center gap-1 mt-1 flex-wrap', isOwn ? 'justify-end' : 'justify-start')}>
      {/* Existing reactions */}
      <TooltipProvider>
        {reactions.map((reaction) => (
          <Tooltip key={reaction.emoji}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onReact(reaction.emoji)}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all',
                  'border hover:scale-105 active:scale-95',
                  reaction.hasReacted
                    ? 'bg-primary/20 border-primary/40 text-primary'
                    : 'bg-secondary/50 border-border/50 hover:bg-secondary'
                )}
              >
                <span>{reaction.emoji}</span>
                <span className="font-medium">{reaction.count}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {getReactorNames(reaction.users)}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>

      {/* Add reaction button */}
      <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity',
              isOwn ? 'hover:bg-white/20' : 'hover:bg-secondary'
            )}
          >
            <SmilePlus className="w-3.5 h-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          side="top" 
          className="w-auto p-2" 
          align={isOwn ? 'end' : 'start'}
        >
          <div className="flex gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact(emoji);
                  setIsPickerOpen(false);
                }}
                className="text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-secondary"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MessageReactions;

