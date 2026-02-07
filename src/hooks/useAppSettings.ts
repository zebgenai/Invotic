import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AppSetting {
  id: string;
  key: string;
  value: boolean | string | number | object;
  updated_at: string;
  updated_by: string | null;
}

export const useAppSettings = () => {
  return useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*');
      
      if (error) throw error;
      
      // Convert to a key-value map
      const settings: Record<string, any> = {};
      data?.forEach((setting: AppSetting) => {
        settings[setting.key] = setting.value;
      });
      
      return settings;
    },
  });
};

export const useSignupEnabled = () => {
  const { data: settings, isLoading } = useAppSettings();
  
  return {
    signupEnabled: settings?.signup_enabled ?? true,
    isLoading,
  };
};


export const useUpdateAppSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('app_settings')
        .update({ 
          value, 
          updated_at: new Date().toISOString(),
          updated_by: user?.id 
        })
        .eq('key', key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
    },
  });
};
