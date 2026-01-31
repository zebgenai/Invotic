import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Resource } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useResources = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Resource[];
    },
    enabled: !!user,
  });
};

export const useCreateResource = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resource: {
      title: string;
      description?: string;
      file_url: string;
      file_type: string;
      workspace_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('resources')
        .insert({
          ...resource,
          uploaded_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};

export const useUpdateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      title, 
      description, 
      file_url, 
      file_type 
    }: { 
      id: string;
      title: string;
      description?: string;
      file_url: string;
      file_type: string;
    }) => {
      const { data, error } = await supabase
        .from('resources')
        .update({ title, description, file_url, file_type })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};

export const useDeleteResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};
