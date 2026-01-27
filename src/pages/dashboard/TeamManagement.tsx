import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/hooks/useProfiles';
import { 
  useTeams, 
  useAllTeamMembers, 
  useCreateTeam, 
  useUpdateTeam, 
  useDeleteTeam, 
  useAddTeamMember, 
  useRemoveTeamMember 
} from '@/hooks/useTeams';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Users, Plus, Trash2, UserPlus, UserMinus, Edit, Search } from 'lucide-react';
import { format } from 'date-fns';

const TeamManagement: React.FC = () => {
  const { role } = useAuth();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: allMembers } = useAllTeamMembers();
  const { data: profiles } = useProfiles();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();
  const { toast } = useToast();

  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [editingTeam, setEditingTeam] = useState<{ id: string; name: string; description: string } | null>(null);
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<string | null>(null);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = role === 'admin';

  const getTeamMembers = (teamId: string) => {
    return allMembers?.filter(m => m.team_id === teamId) || [];
  };

  const getMemberProfile = (userId: string) => {
    return profiles?.find(p => p.user_id === userId);
  };

  const getAvailableUsers = (teamId: string) => {
    const currentMemberIds = getTeamMembers(teamId).map(m => m.user_id);
    return profiles?.filter(p => 
      !currentMemberIds.includes(p.user_id) &&
      p.kyc_status === 'approved'
    ) || [];
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
      });
      toast({
        title: 'Team created',
        description: `Team "${newTeamName}" has been created successfully.`,
      });
      setNewTeamName('');
      setNewTeamDescription('');
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

  const handleAddMember = async (teamId: string) => {
    if (!selectedUserToAdd) return;

    try {
      await addMember.mutateAsync({ teamId, userId: selectedUserToAdd });
      toast({
        title: 'Member added',
        description: 'Member has been added to the team.',
      });
      setSelectedUserToAdd('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add member. They may already be in the team.',
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
            return (
              <Card key={team.id} className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    {team.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {team.description && (
                    <p className="text-sm text-muted-foreground mb-4">{team.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{members.length} members</Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    {members.slice(0, 5).map((member) => {
                      const profile = getMemberProfile(member.user_id);
                      return (
                        <div key={member.id} className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={profile?.avatar_url || ''} />
                            <AvatarFallback className="text-xs">
                              {profile?.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{profile?.full_name || 'Unknown'}</span>
                        </div>
                      );
                    })}
                    {members.length > 5 && (
                      <p className="text-sm text-muted-foreground">+{members.length - 5} more</p>
                    )}
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
            Create and manage teams for your candidates.
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
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {profiles?.filter(p => p.kyc_status === 'approved').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Available Members</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams?.map((team) => {
            const members = getTeamMembers(team.id);
            const availableUsers = getAvailableUsers(team.id);
            
            return (
              <Card key={team.id} className="glass-card">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      {team.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {format(new Date(team.created_at), 'MMM d, yyyy')}
                    </p>
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
                            description: team.description || '' 
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedTeamForMembers(team.id)}>
                          <UserPlus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Member to {team.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {availableUsers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No available users to add. All approved users are already in this team.
                            </p>
                          ) : (
                            <Select value={selectedUserToAdd} onValueChange={setSelectedUserToAdd}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a user to add..." />
                              </SelectTrigger>
                              <SelectContent>
                                {availableUsers.map((user) => (
                                  <SelectItem key={user.user_id} value={user.user_id}>
                                    <div className="flex items-center gap-2">
                                      <span>{user.full_name}</span>
                                      <span className="text-muted-foreground">({user.email})</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button 
                              onClick={() => handleAddMember(team.id)}
                              disabled={!selectedUserToAdd || addMember.isPending}
                            >
                              Add Member
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {members.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No members in this team yet
                        </p>
                      ) : (
                        members.map((member) => {
                          const profile = getMemberProfile(member.user_id);
                          return (
                            <div 
                              key={member.id} 
                              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={profile?.avatar_url || ''} />
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {profile?.full_name?.charAt(0) || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{profile?.full_name || 'Unknown'}</p>
                                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                                </div>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive">
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
