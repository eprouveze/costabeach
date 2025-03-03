"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from '@/lib/supabase/client';
import { AuthUser } from '@/lib/supabase/auth';
import { toast } from 'react-toastify';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export function AuthWrapper({ children, requireAuth = false, allowedRoles = [] }: AuthWrapperProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session && requireAuth) {
          // Get the current locale from the URL
          const pathParts = pathname.split('/');
          const locale = pathParts.length > 1 && ['fr', 'en', 'ar'].includes(pathParts[1]) 
            ? pathParts[1] 
            : 'fr';
          
          // Redirect to the signin page with the current locale and return URL
          router.push(`/${locale}/auth/signin?returnUrl=${encodeURIComponent(pathname)}`);
          return;
        }
        
        if (session) {
          // Get user data from the database
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (userError) {
            console.error('Error fetching user data:', userError);
            
            // If user doesn't exist in the database, create a default user record
            if (userError.code === 'PGRST116') { // PostgreSQL error for "no rows returned"
              console.log('User not found in database, creating default record');
              
              // Get user metadata from auth
              const { data: { user: authUser } } = await supabase.auth.getUser();
              
              if (authUser) {
                // Create a default user record
                const { data: newUser, error: createError } = await supabase
                  .from('users')
                  .insert([
                    {
                      id: authUser.id,
                      email: authUser.email,
                      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
                      role: 'user',
                      is_verified_owner: false,
                      preferred_language: authUser.user_metadata?.preferred_language || 'french',
                      permissions: []
                    }
                  ])
                  .select()
                  .single();
                
                if (createError) {
                  console.error('Error creating user record:', createError);
                } else if (newUser) {
                  setUser({
                    ...newUser,
                    email: authUser.email || '',
                  } as AuthUser);
                }
              }
            }
          } else if (userData) {
            setUser({
              ...userData,
              email: session.user.email || '',
            } as AuthUser);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' && requireAuth) {
          const pathParts = pathname.split('/');
          const locale = pathParts.length > 1 && ['fr', 'en', 'ar'].includes(pathParts[1]) 
            ? pathParts[1] 
            : 'fr';
          router.push(`/${locale}/auth/signin`);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [requireAuth, router, pathname, supabase]);

  // Show loading state
  if (requireAuth && loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !user) {
    return null;
  }

  // If roles are specified, check if user has the required role
  if (requireAuth && user && allowedRoles.length > 0) {
    const userRole = user.role || 'user';
    if (!allowedRoles.includes(userRole)) {
      // User doesn't have the required role, redirect to home
      const pathParts = pathname.split('/');
      const locale = pathParts.length > 1 && ['fr', 'en', 'ar'].includes(pathParts[1]) 
        ? pathParts[1] 
        : 'fr';
      router.push(`/${locale}`);
      return null;
    }
  }

  // Check if the user is a verified owner when accessing owner dashboard
  if (requireAuth && user && pathname.includes('/owner-dashboard') && !user.is_verified_owner) {
    // User is not a verified owner, redirect to home
    const pathParts = pathname.split('/');
    const locale = pathParts.length > 1 && ['fr', 'en', 'ar'].includes(pathParts[1]) 
      ? pathParts[1] 
      : 'fr';
    
    // Show a toast message explaining the redirect
    toast.error("You need to be a verified owner to access the owner dashboard");
    
    // Redirect to home page
    router.push(`/${locale}`);
    return null;
  }

  return <>{children}</>;
} 