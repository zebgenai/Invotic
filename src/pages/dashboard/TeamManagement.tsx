import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/hooks/useProfiles';
import { useChannels } from '@/hooks/useChannels';
import { 
  useTeams, 
  useAllTeamMembers, 
  useCreateTeam, 
  useUpdateTeam, 
  useDeleteTeam, 
  useAddTeamMember, 
  useRemoveTeamMember,
  useUpdateTeamMemberRole,
} from '@/hooks/useTeams';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Plus, Trash2, UserPlus, UserMinus, Edit, Search, 
  Youtube, FileText, Video, Image, Mic, BarChart3, Settings
} from 'lucide-react';
import { format } from 'date-fns';

const ROLE_OPTIONS = [
  { value: 'script_writer', label: 'Script Writer', icon: FileText, color: 'text-blue-500' },
  { value: 'video_editor', label: 'Video Editor', icon: Video, color: 'text-purple-500' },
  { value: 'thumbnail_designer', label: 'Thumbnail Designer', icon: Image, color: 'text-pink-500' },
  { value: 'voice_over_artist', label: 'Voice Over Artist', icon: Mic, color: 'text-orange-500' },
  { value: 'seo_specialist', label: 'SEO Specialist', icon: BarChart3, color: 'text-green-500' },
  { value: 'channel_manager', label: 'Channel Manager', icon: Settings, color: 'text-cyan-500' },
];

const getRoleConfig = (role: string | null) => {
  return ROLE_OPTIONS.find(r => r.value === role) || null;
};

const TeamManagement: React.FC = () => {
  const { role } = useAuth();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: allMembers } = useAllTeamMembers();
  const { data: profiles } = useProfiles();
  const { data: channels } = useChannels();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();
  const updateMemberRole = useUpdateTeamMemberRole();
  const { toast } = useToast();

  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [newTeamChannelId, setNewTeamChannelId] = useState<string>('');
  const [editingTeam, setEditingTeam] = useState<{ id: string; name: string; description: string; channel_id: string | null } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState<{ userId: string; role: string }[]>([]);
  const [addMembersDialogOpen, setAddMembersDialogOpen] = useState<string | null>(null);

  const isAdmin = role === 'admin';

  const getTeamMembers = (teamId: string) => {
    return allMembers?.filter(m => m.team_id === teamId) || [];
  };

  const getMemberProfile = (userId: string) => {
    return profiles?.find(p => p.user_id === userId);
  };

  const getChannelById = (channelId: string | null) => {
    if (!channelId) return null;
    return channels?.find(c => c.id === channelId);
  };

  const getAvailableUsers = (teamId: string) => {
    const currentMemberIds = getTeamMembers(teamId).map(m => m.user_id);
    return profiles?.filter(p => 
      !currentMemberIds.includes(p.user_id) &&
      p.kyc_status === 'approved'
    ) || [];
  };

  const getFilteredAvailableUsers = (teamId: string) => {
    const availableUsers = getAvailableUsers(teamId);
    if (!memberSearchQuery) return availableUsers;
    return availableUsers.filter(user => 
      user.full_name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
    );
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: 'Error',
        description: 'Team name is required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createTeam.mutateAsync({
        name: newTeamName,
        description: newTeamDescription || undefined,
        channel_id: newTeamChannelId || undefined,
      });
      toast({
        title: 'Team created',
        description: `Team "${newTeamName}" has been created successfully.`,
      });
      setNewTeamName('');
      setNewTeamDescription('');
      setNewTeamChannelId('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create team. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam || !editingTeam.name.trim()) return;

    try {
      await updateTeam.mutateAsync({
        teamId: editingTeam.id,
        name: editingTeam.name,
        description: editingTeam.description || undefined,
        channel_id: editingTeam.channel_id,
      });
      toast({
        title: 'Team updated',
        description: 'Team has been updated successfully.',
      });
      setEditingTeam(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update team. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam.mutateAsync(teamId);
      toast({
        title: 'Team deleted',
        description: 'Team has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete team. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddMultipleMembers = async (teamId: string) => {
    if (selectedUsersToAdd.length === 0) return;

    try {
      for (const { userId, role } of selectedUsersToAdd) {
        await addMember.mutateAsync({ teamId, userId, assignedRole: role || undefined });
      }
      toast({
        title: 'Members added',
        description: `${selectedUsersToAdd.length} member(s) have been added to the team.`,
      });
      setSelectedUsersToAdd([]);
      setAddMembersDialogOpen(null);
      setMemberSearchQuery('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add some members. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (teamId: string, userId: string) => {
    try {
      await removeMember.mutateAsync({ teamId, userId });
      toast({
        title: 'Member removed',
        description: 'Member has been removed from the team.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove member. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      await updateMemberRole.mutateAsync({ memberId, assignedRole: newRole || null });
      toast({
        title: 'Role updated',
        description: 'Member role has been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update role. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsersToAdd(prev => {
      const exists = prev.find(u => u.userId === userId);
      if (exists) {
        return prev.filter(u => u.userId !== userId);
      }
      return [...prev, { userId, role: '' }];
    });
  };

  const updateUserRole = (userId: string, role: string) => {
    setSelectedUsersToAdd(prev => 
      prev.map(u => u.userId === userId ? { ...u, role } : u)
    );
  };

  const isUserSelected = (userId: string) => {
    return selectedUsersToAdd.some(u => u.userId === userId);
  };

  const getUserSelectedRole = (userId: string) => {
    return selectedUsersToAdd.find(u => u.userId === userId)?.role || '';
  };

  const handleSelectAll = (teamId: string) => {
    const availableUsers = getFilteredAvailableUsers(teamId);
    const allIds = availableUsers.map(u => u.user_id);
    const allSelected = allIds.every(id => isUserSelected(id));
    
    if (allSelected) {
      setSelectedUsersToAdd([]);
    } else {
      setSelectedUsersToAdd(allIds.map(userId => ({ userId, role: '' })));
    }
  };

  const filteredTeams = teams?.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Teams</h1>
          <p className="text-muted-foreground mt-1">View your team assignments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams?.map((team) => {
            const members = getTeamMembers(team.id);
            const channel = getChannelById(team.channel_id);
            return (
              <Card key={team.id} className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    {team.name}
                  </CardTitle>
                  {channel && (
                    <div className="flex items-center gap-2 mt-2">
                      <Youtube className="w-4 h-4 text-destructive" />
                      <span className="text-sm text-muted-foreground">{channel.channel_name}</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {team.description && (
                    <p className="text-sm text-muted-foreground mb-4">{team.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{members.length} members</Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    {members.map((member) => {
                      const profile = getMemberProfile(member.user_id);
                      const roleConfig = getRoleConfig(member.assigned_role);
                      return (
                        <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={profile?.avatar_url || ''} />
                              <AvatarFallback className="text-xs">
                                {profile?.full_name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{profile?.full_name || 'Unknown'}</span>
                          </div>
                          {roleConfig && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <roleConfig.icon className={`w-3 h-3 ${roleConfig.color}`} />
                              <span className="text-xs">{roleConfig.label}</span>
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Create teams, assign channels, and define member roles.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Name</label>
                <Input
                  placeholder="Enter team name..."
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign Channel</label>
                <Select value={newTeamChannelId} onValueChange={setNewTeamChannelId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a channel to manage..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No channel assigned</SelectItem>
                    {channels?.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        <div className="flex items-center gap-2">
                          <Youtube className="w-4 h-4 text-destructive" />
                          {channel.channel_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  placeholder="Enter team description..."
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleCreateTeam} disabled={createTeam.isPending}>
                  {createTeam.isPending ? 'Creating...' : 'Create Team'}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teams?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Teams</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allMembers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Assignments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Youtube className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {teams?.filter(t => t.channel_id).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Channels Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams Grid */}
      {teamsLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      ) : filteredTeams?.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
            <p className="text-muted-foreground">Create your first team to start grouping candidates.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTeams?.map((team) => {
            const members = getTeamMembers(team.id);
            const availableUsers = getAvailableUsers(team.id);
            const filteredAvailableUsers = getFilteredAvailableUsers(team.id);
            const allFilteredSelected = filteredAvailableUsers.length > 0 && 
              filteredAvailableUsers.every(u => isUserSelected(u.user_id));
            const channel = getChannelById(team.channel_id);
            
            return (
              <Card key={team.id} className="glass-card">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      {team.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {format(new Date(team.created_at), 'MMM d, yyyy')}
                    </p>
                    {channel && (
                      <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-destructive/10">
                        <Youtube className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-medium">{channel.channel_name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => setEditingTeam({ 
                            id: team.id, 
                            name: team.name, 
                            description: team.description || '',
                            channel_id: team.channel_id,
                          })}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Team</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Team Name</label>
                            <Input
                              value={editingTeam?.name || ''}
                              onChange={(e) => setEditingTeam(prev => 
                                prev ? { ...prev, name: e.target.value } : null
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Assign Channel</label>
                            <Select 
                              value={editingTeam?.channel_id || ''} 
                              onValueChange={(value) => setEditingTeam(prev => 
                                prev ? { ...prev, channel_id: value || null } : null
                              )}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a channel..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No channel assigned</SelectItem>
                                {channels?.map((ch) => (
                                  <SelectItem key={ch.id} value={ch.id}>
                                    <div className="flex items-center gap-2">
                                      <Youtube className="w-4 h-4 text-destructive" />
                                      {ch.channel_name}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                              value={editingTeam?.description || ''}
                              onChange={(e) => setEditingTeam(prev => 
                                prev ? { ...prev, description: e.target.value } : null
                              )}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button onClick={handleUpdateTeam}>Save Changes</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Team</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{team.name}"? This will remove all member associations.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDeleteTeam(team.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {team.description && (
                    <p className="text-sm text-muted-foreground mb-4">{team.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary">{members.length} members</Badge>
                    <Dialog 
                      open={addMembersDialogOpen === team.id} 
                      onOpenChange={(open) => {
                        setAddMembersDialogOpen(open ? team.id : null);
                        if (!open) {
                          setSelectedUsersToAdd([]);
                          setMemberSearchQuery('');
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <UserPlus className="w-4 h-4 mr-1" />
                          Add Members
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Add Members to {team.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {availableUsers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No available users to add. All approved users are already in this team.
                            </p>
                          ) : (
                            <>
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                  placeholder="Search users..."
                                  value={memberSearchQuery}
                                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                                  className="pl-10"
                                />
                              </div>

                              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={allFilteredSelected}
                                    onCheckedChange={() => handleSelectAll(team.id)}
                                  />
                                  <span className="text-sm font-medium">
                                    Select All ({filteredAvailableUsers.length})
                                  </span>
                                </div>
                                {selectedUsersToAdd.length > 0 && (
                                  <Badge variant="secondary">
                                    {selectedUsersToAdd.length} selected
                                  </Badge>
                                )}
                              </div>

                              <ScrollArea className="h-[300px]">
                                <div className="space-y-2">
                                  {filteredAvailableUsers.map((user) => (
                                    <div 
                                      key={user.user_id}
                                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                        isUserSelected(user.user_id) 
                                          ? 'bg-primary/10 border border-primary/30' 
                                          : 'hover:bg-muted/50'
                                      }`}
                                    >
                                      <Checkbox
                                        checked={isUserSelected(user.user_id)}
                                        onCheckedChange={() => toggleUserSelection(user.user_id)}
                                      />
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatar_url || ''} />
                                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                          {user.full_name?.charAt(0) || '?'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{user.full_name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                      </div>
                                      {isUserSelected(user.user_id) && (
                                        <Select 
                                          value={getUserSelectedRole(user.user_id)} 
                                          onValueChange={(value) => updateUserRole(user.user_id, value)}
                                        >
                                          <SelectTrigger className="w-[140px] h-8">
                                            <SelectValue placeholder="Assign role..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {ROLE_OPTIONS.map((r) => (
                                              <SelectItem key={r.value} value={r.value}>
                                                <div className="flex items-center gap-2">
                                                  <r.icon className={`w-3 h-3 ${r.color}`} />
                                                  <span className="text-xs">{r.label}</span>
                                                </div>
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </>
                          )}
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setAddMembersDialogOpen(null);
                              setSelectedUsersToAdd([]);
                              setMemberSearchQuery('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => handleAddMultipleMembers(team.id)}
                            disabled={selectedUsersToAdd.length === 0 || addMember.isPending}
                          >
                            {addMember.isPending ? 'Adding...' : `Add ${selectedUsersToAdd.length} Member(s)`}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <ScrollArea className="h-[250px]">
                    <div className="space-y-2">
                      {members.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No members in this team yet
                        </p>
                      ) : (
                        members.map((member) => {
                          const profile = getMemberProfile(member.user_id);
                          const roleConfig = getRoleConfig(member.assigned_role);
                          return (
                            <div 
                              key={member.id} 
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={profile?.avatar_url || ''} />
                                  <AvatarFallback className="text-sm bg-primary/10 text-primary">
                                    {profile?.full_name?.charAt(0) || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{profile?.full_name || 'Unknown'}</p>
                                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Select 
                                  value={member.assigned_role || ''} 
                                  onValueChange={(value) => handleUpdateMemberRole(member.id, value)}
                                >
                                  <SelectTrigger className="w-[150px] h-8">
                                    <SelectValue placeholder="Assign role..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ROLE_OPTIONS.map((r) => (
                                      <SelectItem key={r.value} value={r.value}>
                                        <div className="flex items-center gap-2">
                                          <r.icon className={`w-3 h-3 ${r.color}`} />
                                          <span className="text-xs">{r.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                                      <UserMinus className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to remove {profile?.full_name} from this team?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() => handleRemoveMember(team.id, member.user_id)}
                                      >
                                        Remove
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
