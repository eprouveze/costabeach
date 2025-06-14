"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { signOut } from '@/lib/supabase/auth';
import { toast } from 'react-toastify';
import { useI18n } from '@/lib/i18n/client';

export default function SignOutPage() {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const performSignOut = async () => {
      try {
        const { error } = await signOut();
        
        if (error) {
          toast.error(error.message);
          console.error('Sign out error:', error);
        } else {
          toast.success(t('toast.auth.signOutSuccess'));
        }
      } catch (error) {
        console.error('Sign out error:', error);
        toast.error(t('toast.general.errorOccurred'));
      } finally {
        // Redirect to home page after sign out
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      }
    };

    performSignOut();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brandBlue-500 to-brandBlue-700 dark:from-brandBlue-400 dark:to-brandBlue-600">
              Signing Out
            </span>
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">
            Please wait while we sign you out...
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-8 shadow-xl flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-brandBlue-500 animate-spin" />
          <p className="mt-4 text-neutral-700 dark:text-neutral-300">
            Signing you out...
          </p>
        </div>
      </div>
    </div>
  );
}
