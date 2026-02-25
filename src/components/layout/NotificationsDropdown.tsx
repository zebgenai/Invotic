import React, { useState, useEffect } from 'react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell, Megaphone, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { formatDistanceToNow, differenceInHours, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'announcement' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

const DISMISSED_KEY = 'dismissed_notifications';

const getDismissedIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
  } catch {
    return [];
  }
};

const dismissNotification = (id: string) => {
  const dismissed = getDismissedIds();
  if (!dismissed.includes(id)) {
    dismissed.push(id);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
  }
};

export const NotificationsDropdown: React.FC = () => {
  const { data: announcements, isLoading } = useAnnouncements();
  const [dismissedIds, setDismissedIds] = useState<string[]>(getDismissedIds());

  // Convert announcements to notifications, filter out 48h+ old and dismissed
  const notifications: Notification[] = (announcements || [])
    .filter((a) => {
      const date = new Date(a.created_at);
      if (!isValid(date)) return false;
      const hoursOld = differenceInHours(new Date(), date);
      return hoursOld < 48 && !dismissedIds.includes(a.id);
    })
    .slice(0, 10)
    .map((a) => ({
      id: a.id,
      type: 'announcement' as const,
      title: a.title,
      message: a.content.substring(0, 100) + (a.content.length > 100 ? '...' : ''),
      createdAt: new Date(a.created_at),
      read: false,
    }));

  const unreadCount = notifications.length;

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dismissNotification(id);
    setDismissedIds([...getDismissedIds()]);
  };

  const handleClearAll = () => {
    notifications.forEach((n) => dismissNotification(n.id));
    setDismissedIds([...getDismissedIds()]);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-primary" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-auto py-1 px-2 text-muted-foreground hover:text-foreground"
                onClick={handleClearAll}
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No notifications
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 hover:bg-secondary/50 transition-colors group relative"
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="font-medium text-sm truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDismiss(e, notification.id)}
                      className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsDropdown;
