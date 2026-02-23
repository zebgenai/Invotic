import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserProfileDetails } from '@/hooks/useUserProfile';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Youtube,
  CheckSquare,
  MessageSquare,
  Users,
  Eye,
  Mail,
  Phone,
  Shield,
  Calendar,
  FileCheck,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface UserProfileDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const UserProfileDialog: React.FC<UserProfileDialogProps> = ({ userId, open, onOpenChange }) => {
  const { profile, channels, tasks, forumThreads, userRole, isLoading } = useUserProfileDetails(open ? userId : null);

  const getKycBadge = () => {
    if (!profile) return null;
    switch (profile.kyc_status) {
      case 'approved':
        return <Badge className="badge-success"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge className="badge-warning"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="badge-error"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];
  const pendingTasks = tasks?.filter(t => t.status === 'todo' || t.status === 'in_progress') || [];
  const totalSubs = channels?.reduce((sum, c) => sum + (c.subscriber_count || 0), 0) || 0;
  const totalViews = channels?.reduce((sum, c) => sum + (Number(c.view_count) || 0), 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">User Profile</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 ring-4 ring-primary/20">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {profile.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                {profile.handle && (
                  <p className="text-muted-foreground">@{profile.handle}</p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {getKycBadge()}
                  {userRole && (
                    <Badge variant="outline" className="capitalize">
                      <Shield className="w-3 h-3 mr-1" />
                      {userRole}
                    </Badge>
                  )}
                  {profile.specialty && (
                    <Badge variant="secondary" className="capitalize">
                      {profile.specialty.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                {profile.email}
              </span>
              {profile.kyc_whatsapp && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  {profile.kyc_whatsapp}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Joined {format(new Date(profile.created_at), 'MMM d, yyyy')}
              </span>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="bg-secondary/50">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{channels?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Channels</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/50">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold">{formatNumber(totalSubs)}</p>
                  <p className="text-xs text-muted-foreground">Subscribers</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/50">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold">{completedTasks.length}</p>
                  <p className="text-xs text-muted-foreground">Tasks Done</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/50">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold">{forumThreads?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Threads</p>
                </CardContent>
              </Card>
            </div>

            {/* Detail Tabs */}
            <Tabs defaultValue="channels" className="w-full">
              <TabsList className="w-full bg-secondary">
                <TabsTrigger value="channels" className="flex-1 gap-1.5">
                  <Youtube className="w-3.5 h-3.5" />
                  Channels
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex-1 gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="threads" className="flex-1 gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Threads
                </TabsTrigger>
              </TabsList>

              <TabsContent value="channels" className="mt-4 space-y-3">
                {channels && channels.length > 0 ? channels.map((ch) => (
                  <div key={ch.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <Youtube className="w-5 h-5 text-destructive flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{ch.channel_name}</p>
                      <p className="text-xs text-muted-foreground">by {ch.creator_name}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        {formatNumber(ch.subscriber_count || 0)}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="w-3.5 h-3.5" />
                        {formatNumber(Number(ch.view_count) || 0)}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-6">No channels added yet.</p>
                )}
              </TabsContent>

              <TabsContent value="tasks" className="mt-4 space-y-3">
                {tasks && tasks.length > 0 ? tasks.slice(0, 10).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'in_progress' ? 'bg-blue-500' : 'bg-muted-foreground'
                      }`} />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.due_date ? `Due ${format(new Date(task.due_date), 'MMM d, yyyy')}` : 'No due date'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={task.status === 'completed' ? 'default' : 'secondary'} className="text-xs capitalize shrink-0">
                      {task.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-6">No tasks assigned.</p>
                )}
              </TabsContent>

              <TabsContent value="threads" className="mt-4 space-y-3">
                {forumThreads && forumThreads.length > 0 ? forumThreads.map((thread) => (
                  <div key={thread.id} className="p-3 rounded-lg bg-secondary/50">
                    <p className="font-medium">{thread.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{format(new Date(thread.created_at), 'MMM d, yyyy')}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{thread.view_count}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-6">No forum threads.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">User not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
