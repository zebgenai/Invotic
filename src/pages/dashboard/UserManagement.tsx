import React, { useState } from 'react';
import { useProfiles, useUpdateKycStatus, useUpdateUserRole, useUserRoles, useDeleteKyc, useDeleteUserProfile } from '@/hooks/useProfiles';
import { supabase } from '@/integrations/supabase/client';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Search, Shield, Users, CheckCircle, XCircle, Clock, Eye, Download, FileText, Image as ImageIcon, Trash2, Mail, Phone, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { AppRole, KycStatus } from '@/types/database';

const UserManagement: React.FC = () => {
  const { data: profiles, isLoading } = useProfiles();
  const { data: userRoles } = useUserRoles();
  const updateKyc = useUpdateKycStatus();
  const updateRole = useUpdateUserRole();
  const deleteKyc = useDeleteKyc();
  const deleteProfile = useDeleteUserProfile();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [kycFilter, setKycFilter] = useState<string>('all');
  const [viewingDocument, setViewingDocument] = useState<{ url: string; name: string; type: string } | null>(null);

  const getDocumentUrl = (filePath: string) => {
    const { data } = supabase.storage.from('kyc-documents').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const getSignedUrl = async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from('kyc-documents')
      .createSignedUrl(filePath, 3600); // 1 hour expiry
    if (error) throw error;
    return data.signedUrl;
  };

  const handleViewDocument = async (filePath: string, userName: string) => {
    try {
      const signedUrl = await getSignedUrl(filePath);
      const fileType = filePath.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';
      setViewingDocument({ url: signedUrl, name: userName, type: fileType });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load document. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadDocument = async (filePath: string, userName: string) => {
    try {
      const signedUrl = await getSignedUrl(filePath);
      const fileExt = filePath.split('.').pop();
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = `KYC_${userName.replace(/\s+/g, '_')}.${fileExt}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download document. Please try again.',
        variant: 'destructive',
      });
    }
  };

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

  const handleDeleteKyc = async (userId: string, documentUrl: string | null, documentBackUrl?: string | null) => {
    try {
      await deleteKyc.mutateAsync({ userId, documentUrl, documentBackUrl });
      toast({
        title: 'KYC deleted',
        description: 'KYC documents and status have been cleared.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete KYC. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProfile = async (userId: string, email: string) => {
    // Prevent deletion of primary owner
    if (email === 'atifcyber7@gmail.com') {
      toast({
        title: 'Cannot delete',
        description: 'The primary owner account cannot be deleted.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteProfile.mutateAsync({ userId });
      toast({
        title: 'Profile deleted',
        description: 'The user profile has been permanently deleted.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete profile. Please try again.',
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
                    <TableHead>Contact Info</TableHead>
                    <TableHead>KYC Document</TableHead>
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
                      <TableCell>
                        {(profile.kyc_gmail || profile.kyc_whatsapp) ? (
                          <div className="space-y-1">
                            {profile.kyc_gmail && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                <a 
                                  href={`mailto:${profile.kyc_gmail}`}
                                  className="text-primary hover:underline truncate max-w-[150px]"
                                  title={profile.kyc_gmail}
                                >
                                  {profile.kyc_gmail}
                                </a>
                              </div>
                            )}
                            {profile.kyc_whatsapp && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                <a 
                                  href={`https://wa.me/${profile.kyc_whatsapp.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                  title={profile.kyc_whatsapp}
                                >
                                  {profile.kyc_whatsapp}
                                </a>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not provided</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {profile.kyc_document_url ? (
                          <div className="space-y-2">
                            {/* Front Side */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-10">Front:</span>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => handleViewDocument(profile.kyc_document_url!, `${profile.full_name} - Front`)}
                                title="View Front"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => handleDownloadDocument(profile.kyc_document_url!, `${profile.full_name}_Front`)}
                                title="Download Front"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                            {/* Back Side */}
                            {profile.kyc_document_back_url && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground w-10">Back:</span>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={() => handleViewDocument(profile.kyc_document_back_url!, `${profile.full_name} - Back`)}
                                  title="View Back"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={() => handleDownloadDocument(profile.kyc_document_back_url!, `${profile.full_name}_Back`)}
                                  title="Download Back"
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No document</span>
                        )}
                      </TableCell>
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
                          {(profile.kyc_document_url || profile.kyc_status !== 'pending') && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive border-destructive/50 hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete KYC
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete KYC Data</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the KYC document and reset the verification status to pending. The user will need to resubmit their KYC documents.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => handleDeleteKyc(profile.user_id, profile.kyc_document_url, profile.kyc_document_back_url)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          
                          {/* Delete Profile Button - Admin only, not for primary owner */}
                          {profile.email !== 'atifcyber7@gmail.com' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive border-destructive/50 hover:bg-destructive/10"
                                >
                                  <UserX className="w-3 h-3 mr-1" />
                                  Delete User
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User Profile</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to permanently delete {profile.full_name}'s profile? This action cannot be undone and will remove all their data including KYC documents, roles, and associated records.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => handleDeleteProfile(profile.user_id, profile.email)}
                                  >
                                    Delete Permanently
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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

      {/* Document Preview Dialog */}
      <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>KYC Document - {viewingDocument?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {viewingDocument?.type === 'pdf' ? (
              <iframe
                src={viewingDocument.url}
                className="w-full h-[70vh] rounded-lg border border-border"
                title="KYC Document"
              />
            ) : (
              <img
                src={viewingDocument?.url}
                alt="KYC Document"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => viewingDocument && window.open(viewingDocument.url, '_blank')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
              <Button onClick={() => setViewingDocument(null)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
