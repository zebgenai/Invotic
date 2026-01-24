import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskStatus, TaskPriority } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useTasks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (task: {
      title: string;
      description?: string;
      assigned_to?: string;
      workspace_id?: string;
      priority?: TaskPriority;
      due_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          assigned_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      ...updates 
    }: Partial<Task> & { id: string }) => {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          completed_at: updates.status === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
