import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Profile {
  user_id: string;
  avatar_url: string | null;
  full_name: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  profiles: Profile[];
  className?: string;
  disabled?: boolean;
}

export interface MentionInputHandle {
  focus: () => void;
}

const MentionInput = forwardRef<MentionInputHandle, MentionInputProps>(({
  value,
  onChange,
  placeholder = "Type a message...",
  profiles,
  className,
  disabled = false,
}, ref) => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const mentionListRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  const filteredProfiles = profiles.filter(profile =>
    profile.full_name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [mentionSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    onChange(newValue);

    // Check if we just typed @
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Check if there's a space before @ or it's at the start
      const charBeforeAt = lastAtIndex > 0 ? newValue[lastAtIndex - 1] : ' ';
      
      if ((charBeforeAt === ' ' || lastAtIndex === 0) && !textAfterAt.includes(' ')) {
        setShowMentions(true);
        setMentionSearch(textAfterAt);
        setMentionStartIndex(lastAtIndex);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleSelectMention = (profile: Profile) => {
    if (mentionStartIndex === -1) return;
    
    const beforeMention = value.slice(0, mentionStartIndex);
    const afterMention = value.slice(mentionStartIndex + mentionSearch.length + 1);
    const newValue = `${beforeMention}@${profile.full_name} ${afterMention}`;
    
    onChange(newValue);
    setShowMentions(false);
    setMentionSearch('');
    setMentionStartIndex(-1);
    
    // Focus back to input
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showMentions || filteredProfiles.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredProfiles.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredProfiles.length - 1
        );
        break;
      case 'Enter':
        if (showMentions && filteredProfiles[selectedIndex]) {
          e.preventDefault();
          handleSelectMention(filteredProfiles[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowMentions(false);
        break;
      case 'Tab':
        if (showMentions && filteredProfiles[selectedIndex]) {
          e.preventDefault();
          handleSelectMention(filteredProfiles[selectedIndex]);
        }
        break;
    }
  };

  const handleBlur = () => {
    // Delay hiding to allow click on mention item
    setTimeout(() => setShowMentions(false), 200);
  };

  return (
    <div className="relative flex-1">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60",
          className
        )}
      />
      
      {/* Mention dropdown */}
      {showMentions && filteredProfiles.length > 0 && (
        <div 
          ref={mentionListRef}
          className="absolute bottom-full left-0 mb-2 w-64 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden"
        >
          <div className="p-2 border-b border-border/50">
            <p className="text-xs text-muted-foreground font-medium">Mention someone</p>
          </div>
          <ScrollArea className="max-h-48">
            <div className="p-1">
              {filteredProfiles.slice(0, 10).map((profile, index) => (
                <button
                  key={profile.user_id}
                  type="button"
                  onClick={() => handleSelectMention(profile)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    index === selectedIndex 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-muted"
                  )}
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {profile.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">
                    {profile.full_name}
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
});

MentionInput.displayName = 'MentionInput';

export default MentionInput;
