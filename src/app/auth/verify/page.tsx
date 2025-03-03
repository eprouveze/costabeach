"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function VerifyPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const supabase = createClient();
        
        // Check if this is a redirect from email verification
        if (searchParams.has('type') && searchParams.get('type') === 'signup') {
          setStatus('success');
          setMessage('Your email has been verified! You can now sign in to your account.');
          return;
        }
        
        // Check session status
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setStatus('success');
          setMessage('Your account is verified and you are signed in!');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Please check your email for the verification link.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    handleEmailConfirmation();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 px-4">
      <Link
        href="/"
        className="group absolute left-4 top-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Home
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brandBlue-500 to-brandBlue-700 dark:from-brandBlue-400 dark:to-brandBlue-600">
              Email Verification
            </span>
          </h1>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-8 shadow-xl text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 text-brandBlue-500 animate-spin" />
            )}
            
            {status === 'success' && (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
            
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
            
            <p className="text-lg text-neutral-700 dark:text-neutral-300">
              {message}
            </p>
            
            {status === 'error' && (
              <Link
                href="/auth/signin"
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 px-6 py-3 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30 focus:outline-none focus:ring-2 focus:ring-brandBlue-500 focus:ring-offset-2"
              >
                Go to Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
