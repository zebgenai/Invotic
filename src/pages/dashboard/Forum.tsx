import React, { useState } from 'react';
import { useForumThreads, useForumReplies, useCreateThread, useCreateReply, useDeleteThread } from '@/hooks/useForum';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  MessageSquare,
  Plus,
  ArrowLeft,
  Pin,
  Lock,
  Eye,
  MessageCircle,
  Search,
  Trash2,
  Send,
} from 'lucide-react';
import { format } from 'date-fns';

const Forum: React.FC = () => {
  const { user, profile, role } = useAuth();
  const { data: threads, isLoading } = useForumThreads();
  const { data: profiles } = useProfiles();
  const createThread = useCreateThread();
  const createReply = useCreateReply();
  const deleteThread = useDeleteThread();
  const { toast } = useToast();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newThread, setNewThread] = useState({ title: '', content: '' });
  const [replyContent, setReplyContent] = useState('');

  const { data: replies } = useForumReplies(selectedThread || '');

  const getAuthorProfile = (authorId: string) => {
    if (authorId === user?.id) return profile;
    return profiles?.find((p) => p.user_id === authorId);
  };

  const handleCreateThread = async () => {
    if (!newThread.title.trim() || !newThread.content.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createThread.mutateAsync(newThread);
      toast({
        title: 'Thread created!',
        description: 'Your discussion has been posted.',
      });
      setNewThread({ title: '', content: '' });
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create thread. Make sure your KYC is approved.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateReply = async () => {
    if (!replyContent.trim() || !selectedThread) return;

    try {
      await createReply.mutateAsync({
        threadId: selectedThread,
        content: replyContent.trim(),
      });
      toast({
        title: 'Reply posted!',
        description: 'Your reply has been added.',
      });
      setReplyContent('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post reply. Make sure your KYC is approved.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    try {
      await deleteThread.mutateAsync(threadId);
      toast({
        title: 'Thread deleted',
        description: 'The thread has been removed.',
      });
      setSelectedThread(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete thread.',
        variant: 'destructive',
      });
    }
  };

  const filteredThreads = threads?.filter(
    (thread) =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentThread = threads?.find((t) => t.id === selectedThread);

  const canPost = profile?.kyc_status === 'approved' || role === 'admin' || role === 'manager';

  if (selectedThread && currentThread) {
    const author = getAuthorProfile(currentThread.author_id);

    return (
      <div className="space-y-6">
        {/* Back button */}
        <Button variant="ghost" onClick={() => setSelectedThread(null)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Forum
        </Button>

        {/* Thread */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {currentThread.is_pinned && (
                    <Badge className="badge-info">
                      <Pin className="w-3 h-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                  {currentThread.is_locked && (
                    <Badge className="badge-warning">
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{currentThread.title}</CardTitle>
              </div>
              {(currentThread.author_id === user?.id || role === 'admin') && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteThread(currentThread.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Avatar>
                <AvatarImage src={author?.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {author?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{author?.full_name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(currentThread.created_at), 'MMMM d, yyyy • h:mm a')}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{currentThread.content}</p>
            <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {currentThread.view_count} views
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {replies?.length || 0} replies
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Replies */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Replies ({replies?.length || 0})</h3>
          
          {replies?.map((reply) => {
            const replyAuthor = getAuthorProfile(reply.author_id);
            
            return (
              <Card key={reply.id} className="glass-card">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={replyAuthor?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {replyAuthor?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{replyAuthor?.full_name || 'Unknown'}</p>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(reply.created_at), 'MMM d, yyyy • h:mm a')}
                        </span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Reply Input */}
          {!currentThread.is_locked && canPost && (
            <Card className="glass-card">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={3}
                    />
                    <Button
                      onClick={handleCreateReply}
                      disabled={!replyContent.trim() || createReply.isPending}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {createReply.isPending ? 'Posting...' : 'Post Reply'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!canPost && (
            <Card className="glass-card border-warning/50">
              <CardContent className="py-6 text-center">
                <p className="text-warning">
                  Your KYC must be approved to post replies.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Discussion Forum</h1>
          <p className="text-muted-foreground mt-1">
            Share ideas, ask questions, and connect with the community.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canPost}>
              <Plus className="w-4 h-4 mr-2" />
              New Thread
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>Create New Thread</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="Enter thread title"
                  value={newThread.title}
                  onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  placeholder="Write your discussion..."
                  value={newThread.content}
                  onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                  rows={6}
                />
              </div>
              <Button onClick={handleCreateThread} className="w-full" disabled={createThread.isPending}>
                {createThread.isPending ? 'Creating...' : 'Create Thread'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Threads List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading threads...</p>
        </div>
      ) : filteredThreads?.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No threads yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to start a discussion!
            </p>
            {canPost && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Thread
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredThreads?.map((thread) => {
            const author = getAuthorProfile(thread.author_id);
            
            return (
              <Card
                key={thread.id}
                className="glass-card-hover cursor-pointer"
                onClick={() => setSelectedThread(thread.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={author?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {author?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {thread.is_pinned && (
                          <Badge className="badge-info text-xs">
                            <Pin className="w-3 h-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                        {thread.is_locked && (
                          <Badge className="badge-warning text-xs">
                            <Lock className="w-3 h-3" />
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                        {thread.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-2 mt-1">
                        {thread.content}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span>{author?.full_name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{format(new Date(thread.created_at), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {thread.view_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Forum;
