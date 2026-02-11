import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, specialty?: string, specialties?: string[]) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, retryCount = 0) => {
    const maxRetries = 2;
    const baseDelay = 500;
    
    try {
      // Fetch profile and role in parallel for speed
      const [profileResult, roleResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
      ]);

      if (profileResult.error || roleResult.error) {
        if (retryCount < maxRetries) {
          const delay = baseDelay * Math.pow(2, retryCount);
          setTimeout(() => fetchProfile(userId, retryCount + 1), delay);
          return;
        }
        console.error('Profile/role fetch failed after retries');
        setProfile({ user_id: userId, full_name: 'User', kyc_status: 'pending' } as Profile);
        setRole('user' as AppRole);
        return;
      }

      setProfile(profileResult.data as Profile | null);
      setRole(roleResult.data?.role as AppRole | null);
    } catch (error) {
      if (retryCount < maxRetries) {
        setTimeout(() => fetchProfile(userId, retryCount + 1), baseDelay * Math.pow(2, retryCount));
        return;
      }
      console.error('Error in fetchProfile after retries:', error);
      setProfile({ user_id: userId, full_name: 'User', kyc_status: 'pending' } as Profile);
      setRole('user' as AppRole);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    let isMounted = true;

    // Check if this is a new browser session (browser was closed and reopened)
    // We use sessionStorage to track if the session has been validated in this browser session
    const SESSION_VALIDATED_KEY = 'partnerunityx-session-validated';
    const isNewBrowserSession = !sessionStorage.getItem(SESSION_VALIDATED_KEY);

    // IMPORTANT: keep this callback synchronous (no await / no extra backend calls)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!isMounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (event === 'SIGNED_OUT' || !currentSession?.user) {
          setProfile(null);
          setRole(null);
          // Clear the session validation flag on sign out
          sessionStorage.removeItem(SESSION_VALIDATED_KEY);
          return;
        }

        // Mark session as validated for this browser session
        sessionStorage.setItem(SESSION_VALIDATED_KEY, 'true');

        // Defer profile/role fetch to avoid doing backend calls inside auth callback
        setTimeout(() => {
          if (!isMounted) return;
          fetchProfile(currentSession.user.id);
        }, 0);
      }
    );

    // Initial auth load - controls loading
    const initializeAuth = async () => {
      try {
        // If this is a new browser session, sign out any existing session
        // This ensures users are redirected to landing page after closing browser
        if (isNewBrowserSession) {
          // Clear any persisted session from localStorage
          await supabase.auth.signOut();
          if (!isMounted) return;
          setSession(null);
          setUser(null);
          setProfile(null);
          setRole(null);
          setLoading(false);
          return;
        }

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Non-blocking: fetch profile/role in the background
        if (currentSession?.user) {
          setTimeout(() => {
            if (!isMounted) return;
            fetchProfile(currentSession.user.id);
          }, 0);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, fullName: string, specialty?: string, specialties?: string[]) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          specialty: specialty || null,
          specialties: specialties || [],
        },
      },
    });

    // After successful signup, update the profile with specialties array
    if (!error && data.user && specialties && specialties.length > 0) {
      // Wait a moment for the trigger to create the profile
      setTimeout(async () => {
        await supabase
          .from('profiles')
          .update({ specialties })
          .eq('user_id', data.user!.id);
      }, 1000);
    }

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      return { error: result.error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    // Clear local state immediately for instant logout
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    
    // Attempt server signout but don't wait for it
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
      ]);
    } catch (error) {
      console.warn('Sign out request failed or timed out, but local session cleared');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
