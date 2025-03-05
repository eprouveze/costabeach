"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleAuthCallback } from '@/lib/supabase/auth';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      const { error: callbackError } = await handleAuthCallback();
      
      if (callbackError) {
        console.error('Error during auth callback:', callbackError);
        setError(callbackError.message);
        return;
      }
      
      // Redirect to dashboard on successful sign in
      router.push('/dashboard');
    }

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="p-4 max-w-md mx-auto mt-10 bg-red-50 text-red-800 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => router.push('/auth/login')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto mt-10 text-center">
      <div className="animate-pulse">
        <div className="h-8 w-3/4 mx-auto bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-5/6 mx-auto bg-gray-200 rounded"></div>
      </div>
    </div>
  );
} 