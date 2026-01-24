import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile, KycStatus } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useProfiles = () => {
  const { role } = useAuth();

  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
    enabled: role === 'admin' || role === 'manager',
  });
};

export const useUpdateKycStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      status 
    }: { 
      userId: string; 
      status: KycStatus;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          kyc_status: status,
          kyc_reviewed_at: new Date().toISOString(),
          kyc_reviewed_by: user?.id,
        })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
};

export const useDeleteKyc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      documentUrl 
    }: { 
      userId: string; 
      documentUrl: string | null;
    }) => {
      // Delete the document from storage if it exists
      if (documentUrl) {
        const { error: storageError } = await supabase.storage
          .from('kyc-documents')
          .remove([documentUrl]);
        
        if (storageError) {
          console.error('Failed to delete KYC document from storage:', storageError);
        }
      }

      // Reset KYC fields in the profile
      const { error } = await supabase
        .from('profiles')
        .update({ 
          kyc_status: 'pending',
          kyc_document_url: null,
          kyc_submitted_at: null,
          kyc_reviewed_at: null,
          kyc_reviewed_by: null,
          kyc_gmail: null,
          kyc_whatsapp: null,
        })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      role 
    }: { 
      userId: string; 
      role: 'admin' | 'manager' | 'user';
    }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    },
  });
};

export const useUserRoles = () => {
  const { role } = useAuth();

  return useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');

      if (error) throw error;
      return data;
    },
    enabled: role === 'admin',
  });
};
