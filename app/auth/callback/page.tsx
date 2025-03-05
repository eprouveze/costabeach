"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { checkProfileCompletion } from '@/lib/supabase/auth';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Get Supabase client
        const supabase = createClient();
        
        // Get the code from the URL
        const code = searchParams?.get('code');
        
        if (!code) {
          setError('Missing authorization code');
          setIsLoading(false);
          return;
        }
        
        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error('Error exchanging code for session:', error);
          setError(error.message);
          setIsLoading(false);
          return;
        }
        
        if (!data.session || !data.session.user) {
          setError('Failed to get user session');
          setIsLoading(false);
          return;
        }
        
        // Check if the user has completed their profile
        const { isComplete, error: profileError } = await checkProfileCompletion(data.session.user.id);
        
        if (profileError) {
          console.error('Error checking profile completion:', profileError);
        }
        
        // Get the current locale from the URL
        const path = window.location.pathname;
        const pathParts = path.split('/');
        const locale = pathParts.length > 1 && ['fr', 'en', 'ar'].includes(pathParts[1]) 
          ? pathParts[1] 
          : 'fr';
        
        // Redirect based on profile completion
        if (isComplete) {
          // Profile is complete, redirect to dashboard
          router.push(`/${locale}/owner-dashboard`);
        } else {
          // Profile is incomplete, redirect to complete profile
          router.push(`/${locale}/auth/complete-profile`);
        }
      } catch (err: any) {
        console.error('Unexpected error in auth callback:', err);
        setError(err.message || 'An unexpected error occurred');
        setIsLoading(false);
      }
    }
    
    handleCallback();
  }, [router, searchParams]);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-700 mb-8">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Return to Home
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      <p className="mt-4 text-lg">Completing authentication, please wait...</p>
    </div>
  );
} 