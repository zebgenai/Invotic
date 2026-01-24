import React, { useState } from 'react';
import { useProfiles, useUpdateKycStatus, useUpdateUserRole, useUserRoles } from '@/hooks/useProfiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Search, Shield, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { AppRole, KycStatus } from '@/types/database';

const UserManagement: React.FC = () => {
  const { data: profiles, isLoading } = useProfiles();
  const { data: userRoles } = useUserRoles();
  const updateKyc = useUpdateKycStatus();
  const updateRole = useUpdateUserRole();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [kycFilter, setKycFilter] = useState<string>('all');

  const getUserRole = (userId: string): AppRole => {
    const roleEntry = userRoles?.find((r) => r.user_id === userId);
    return (roleEntry?.role as AppRole) || 'user';
  };

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    try {
      await updateRole.mutateAsync({ userId, role: newRole });
      toast({
        title: 'Role updated',
        description: `User role has been changed to ${newRole}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update role. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleKycAction = async (userId: string, status: KycStatus) => {
    try {
      await updateKyc.mutateAsync({ userId, status });
      toast({
        title: 'KYC status updated',
        description: `KYC has been ${status}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update KYC status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredProfiles = profiles?.filter((profile) => {
    const matchesSearch =
      profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchQuery.toLowerCase());

    const userRole = getUserRole(profile.user_id);
    const matchesRole = roleFilter === 'all' || userRole === roleFilter;
    const matchesKyc = kycFilter === 'all' || profile.kyc_status === kycFilter;

    return matchesSearch && matchesRole && matchesKyc;
  });

  const getKycBadge = (status: KycStatus) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="badge-success">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="badge-warning">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="badge-error">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage users, roles, and KYC verification.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profiles?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {profiles?.filter((p) => p.kyc_status === 'approved').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {profiles?.filter((p) => p.kyc_status === 'pending').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Pending KYC</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {userRoles?.filter((r) => r.role === 'admin').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="KYC Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Users ({filteredProfiles?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles?.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={profile.avatar_url || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {profile.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{profile.full_name}</p>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={getUserRole(profile.user_id)}
                          onValueChange={(value) =>
                            handleRoleChange(profile.user_id, value as AppRole)
                          }
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{getKycBadge(profile.kyc_status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(profile.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {profile.kyc_status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-success border-success/50 hover:bg-success/10"
                                onClick={() => handleKycAction(profile.user_id, 'approved')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive/50 hover:bg-destructive/10"
                                onClick={() => handleKycAction(profile.user_id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {profile.kyc_status === 'rejected' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleKycAction(profile.user_id, 'pending')}
                            >
                              Reset KYC
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
