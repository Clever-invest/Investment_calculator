import { useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import * as authService from '@/services/auth';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
        session,
        loading: false,
      }));
    });

    // Subscribe to auth changes
    const subscription = authService.onAuthStateChange((user, session) => {
      setState(prev => ({
        ...prev,
        user,
        session,
        loading: false,
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const { user, session, error } = await authService.signIn(email, password);
    
    setState(prev => ({
      ...prev,
      user,
      session,
      loading: false,
      error: error?.message ?? null,
    }));

    return { user, error };
  }, []);

  // Sign up
  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const { user, session, error } = await authService.signUp(email, password, fullName);
    
    setState(prev => ({
      ...prev,
      user,
      session,
      loading: false,
      error: error?.message ?? null,
    }));

    return { user, error };
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    const { error } = await authService.signOut();
    
    if (!error) {
      setState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } else {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }

    return { error };
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const { error } = await authService.resetPassword(email);
    
    setState(prev => ({
      ...prev,
      loading: false,
      error: error?.message ?? null,
    }));

    return { error };
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError,
  };
};
