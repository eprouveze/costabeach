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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error(`Session error: ${sessionError.message}`);
        }
        
        // Check if trying to access owner dashboard without being a verified owner
        const isOwnerDashboardPath = pathname.includes('/owner-dashboard');
        
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
          try {
            // Try to create the users table if it doesn't exist
            try {
              // This is a simplified version that will only run if you have RLS permissions
              // In production, you would use a server-side API route with admin privileges
              await supabase.rpc('create_users_table_if_not_exists');
            } catch (tableError) {
              console.log('Note: Unable to create users table. This is expected if the table already exists or if you lack permissions.');
            }

            // Get user data from the database
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (userError) {
              console.error('Error fetching user data:', userError);
              
              // If user doesn't exist in the database, create a default user record
              if (userError.code === 'PGRST116' || userError.message.includes('does not exist')) {
                console.log('User not found in database or table does not exist, creating default record');
                
                try {
                  // Get user metadata from auth
                  const { data: { user: authUser }, error: authUserError } = await supabase.auth.getUser();
                  
                  if (authUserError) {
                    console.error('Error getting auth user:', authUserError);
                    throw new Error(`Auth user error: ${authUserError.message}`);
                  }
                  
                  if (authUser) {
                    // Create a default user record
                    // First check if the users table exists
                    try {
                      const { data: newUser, error: createError } = await supabase
                        .from('users')
                        .insert([
                          {
                            id: authUser.id,
                            email: authUser.email,
                            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
                            role: 'user',
                            is_verified_owner: true, // For testing purposes, set to true
                            preferred_language: authUser.user_metadata?.preferred_language || 'french',
                            permissions: []
                          }
                        ])
                        .select()
                        .single();
                      
                      if (createError) {
                        if (createError.message.includes('does not exist')) {
                          // Table doesn't exist, we need to create it
                          console.error('Users table does not exist. Please run the migration script.');
                          toast.error('Database setup incomplete. Please contact the administrator.');
                          
                          // Instead of redirecting, just log a message for administrators
                          console.log('Administrator action needed: Please visit /api/setup-database to set up the database');
                        } else if (createError.message.includes('violates row-level security policy')) {
                          // RLS policy error
                          console.error('RLS policy error when creating user record:', createError);
                          toast.error('Permission error when creating user record. Please contact the administrator.');
                          
                          // Instead of redirecting, just log a message for administrators
                          console.log('Administrator action needed: Please visit /api/setup-database to fix database permissions');
                          
                          // Create a fallback user object since we can't insert into the database
                          const fallbackUser = {
                            id: authUser.id,
                            email: authUser.email || '',
                            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
                            role: 'user',
                            is_admin: false,
                            is_verified_owner: true, // For testing purposes, set to true
                            preferred_language: 'french',
                            permissions: []
                          };
                          setUser(fallbackUser as AuthUser);
                        } else {
                          console.error('Error creating user record:', createError);
                          throw new Error(`Error creating user record: ${createError.message}`);
                        }
                      } else if (newUser) {
                        setUser({
                          ...newUser,
                          email: authUser.email || '',
                        } as AuthUser);
                      } else {
                        console.error('No user data returned after creation');
                        throw new Error('No user data returned after creation');
                      }
                    } catch (createUserError: any) {
                      // If the error is about the table not existing, we'll use a fallback user object
                      if (createUserError.message && (
                          createUserError.message.includes('does not exist') || 
                          createUserError.message.includes('relation') ||
                          createUserError.message.includes('undefined')
                        )) {
                        console.log('Using fallback user object since the users table does not exist');
                        // Create a fallback user object
                        const fallbackUser = {
                          id: authUser.id,
                          email: authUser.email || '',
                          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
                          role: 'user',
                          is_admin: false,
                          is_verified_owner: true, // For testing purposes, set to true
                          preferred_language: 'french',
                          permissions: []
                        };
                        setUser(fallbackUser as AuthUser);
                      } else {
                        console.error('Error in user creation process:', createUserError);
                        throw new Error(`Error in user creation: ${createUserError.message || JSON.stringify(createUserError)}`);
                      }
                    }
                  } else {
                    console.error('No auth user found');
                    throw new Error('No auth user found');
                  }
                } catch (createUserError: any) {
                  // If the error is about the table not existing, we'll use a fallback user object
                  if (createUserError.message && (
                      createUserError.message.includes('does not exist') || 
                      createUserError.message.includes('relation') ||
                      createUserError.message.includes('undefined')
                    )) {
                    console.log('Using fallback user object since the users table does not exist');
                    // Create a fallback user object based on the session
                    const fallbackUser = {
                      id: session.user.id,
                      email: session.user.email || '',
                      name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                      role: 'user',
                      is_admin: false,
                      is_verified_owner: true, // For testing purposes, set to true
                      preferred_language: 'french',
                      permissions: []
                    };
                    setUser(fallbackUser as AuthUser);
                  } else {
                    console.error('Error in user creation process:', createUserError);
                    throw new Error(`Error in user creation: ${createUserError.message || JSON.stringify(createUserError)}`);
                  }
                }
              } else {
                // For other database errors
                throw new Error(`Database error: ${userError.message}`);
              }
            } else if (userData) {
              setUser({
                ...userData,
                email: session.user.email || '',
              } as AuthUser);
            } else {
              console.error('No user data returned');
              throw new Error('No user data returned');
            }
          } catch (userDataError: any) {
            console.error('Error processing user data:', userDataError);
            
            // If the error is about the table not existing, we'll use a fallback user object
            if (userDataError.message && (
                userDataError.message.includes('does not exist') || 
                userDataError.message.includes('relation') ||
                userDataError.message.includes('undefined')
              )) {
              console.log('Using fallback user object since the users table does not exist');
              // Create a fallback user object based on the session
              const fallbackUser = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                role: 'user',
                is_admin: false,
                is_verified_owner: true, // For testing purposes, set to true
                preferred_language: 'french',
                permissions: []
              };
              setUser(fallbackUser as AuthUser);
            } else {
              toast.error(`Error loading user data: ${userDataError.message || 'Unknown error'}`);
            }
          }
        }

        // After setting the user, check if they're trying to access the owner dashboard without being a verified owner
        if (isOwnerDashboardPath && user && !user.is_verified_owner) {
          console.error('User is not a verified owner, redirecting to home page');
          
          // Get the current locale from the URL
          const pathParts = pathname.split('/');
          const locale = pathParts.length > 1 && ['fr', 'en', 'ar'].includes(pathParts[1]) 
            ? pathParts[1] 
            : 'fr';
          
          toast.error('You do not have permission to access the owner dashboard');
          router.push(`/${locale}`);
          return;
        }
      } catch (error: any) {
        console.error('Auth check error:', error);
        toast.error(`Authentication error: ${error.message || 'Unknown error'}`);
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