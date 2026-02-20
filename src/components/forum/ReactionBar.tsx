import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SmilePlus } from 'lucide-react';
import { ForumReaction } from '@/types/database';
import { useToggleReaction } from '@/hooks/useForum';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '🎉', '🤔', '👀', '🔥', '💯'];

interface ReactionBarProps {
  reactions: ForumReaction[];
  threadId?: string;
  replyId?: string;
}

const ReactionBar: React.FC<ReactionBarProps> = ({ reactions, threadId, replyId }) => {
  const { user } = useAuth();
  const toggleReaction = useToggleReaction();

  // Group reactions by emoji
  const grouped = reactions.reduce<Record<string, { count: number; userReacted: boolean }>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, userReacted: false };
    acc[r.emoji].count++;
    if (r.user_id === user?.id) acc[r.emoji].userReacted = true;
    return acc;
  }, {});

  const handleToggle = (emoji: string) => {
    toggleReaction.mutate({ emoji, threadId, replyId });
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {Object.entries(grouped).map(([emoji, { count, userReacted }]) => (
        <Button
          key={emoji}
          variant="outline"
          size="sm"
          className={cn(
            'h-7 px-2 text-xs gap-1 rounded-full',
            userReacted && 'bg-primary/10 border-primary/30'
          )}
          onClick={() => handleToggle(emoji)}
        >
          <span>{emoji}</span>
          <span>{count}</span>
        </Button>
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
            <SmilePlus className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" side="top">
          <div className="flex gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                className="text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-muted"
                onClick={() => handleToggle(emoji)}
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

export default ReactionBar;
