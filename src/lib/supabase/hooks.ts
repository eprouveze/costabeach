'use client';

import { createClient } from '@/lib/supabase/client';
import { useCallback, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';

/**
 * A hook to access the Supabase session and user data
 * @returns The session, user, loading state, and a refresh function
 */
export function useSupabaseSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    } catch (error) {
      console.error('Error getting session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
    
    const supabase = createClient();
    
    // Set up listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [refreshSession]);

  return {
    session,
    user: session?.user ?? null,
    isLoading,
    refresh: refreshSession
  };
}

/**
 * A hook to get the current authenticated user
 * @returns The user object if authenticated, null otherwise
 */
export function useSupabaseUser() {
  const { user, isLoading } = useSupabaseSession();
  return { user, isLoading };
} 