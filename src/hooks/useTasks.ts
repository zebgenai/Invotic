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
      link?: string;
      assigned_to?: string;
      workspace_id?: string;
      priority?: TaskPriority;
      due_date?: string;
      assign_to_all?: boolean;
      all_user_ids?: string[];
    }) => {
      const { assign_to_all, all_user_ids, ...taskData } = task;
      
      // If assigning to all users, create a task for each user
      if (assign_to_all && all_user_ids && all_user_ids.length > 0) {
        const results = [];
        for (const userId of all_user_ids) {
          const { data, error } = await supabase
            .from('tasks')
            .insert({
              ...taskData,
              assigned_by: user?.id,
              assigned_to: userId,
            })
            .select()
            .single();

          if (error) throw error;
          results.push(data);
        }
        return results;
      }
      
      // Single task creation
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
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
