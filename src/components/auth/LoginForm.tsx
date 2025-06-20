"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { signIn } from '@/lib/supabase/auth';
import { toast } from 'react-toastify';
import { useI18n } from '@/lib/i18n/client';
import { createClient } from '@/lib/supabase/client';
import SocialLoginButtons from './SocialLoginButtons';

export default function LoginForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get('returnUrl') || '/owner-dashboard';
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        setErrorMessage(error.message);
        toast.error(error.message);
        return;
      }
      
      if (data.session) {
        try {
          // Get the user's role from the database
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role, is_verified_owner, is_admin')
            .eq('id', data.session.user.id)
            .single();
          
          if (userError) {
            console.error('Error fetching user data:', userError);
            // Continue with default redirection even if user data fetch fails
            toast.warning(t('toast.auth.profileIncompleteWarning'));
          }
          
          toast.success(t('auth.signin.success'));
          
          // Get the current locale from the URL
          const path = window.location.pathname;
          const pathParts = path.split('/');
          const locale = pathParts.length > 1 && ['fr', 'en', 'ar'].includes(pathParts[1]) 
            ? pathParts[1] 
            : 'fr';
          
          // Redirection priority:
          // 1. Return URL (if provided)
          // 2. Owner Dashboard (if owner is verified and path contains /owner-dashboard)
          // 3. Admin Dashboard (if admin)
          // 4. Owner Dashboard (if owner is verified)
          // 5. Home page (default)
          
          if (returnUrl) {
            console.log(`Redirecting to return URL: ${returnUrl}`);
            window.location.href = returnUrl;
          } else if (userData?.is_verified_owner && userData?.is_admin) {
            // User is both admin and verified owner, check if they were trying to access the owner dashboard
            const ownerPathPattern = /owner-dashboard/;
            const comingFromOwnerPath = document.referrer && ownerPathPattern.test(document.referrer);
            
            if (comingFromOwnerPath) {
              console.log('User has both roles but was accessing owner dashboard, redirecting there');
              window.location.href = `/${locale}/owner-dashboard`;
            } else {
              // Default to admin dashboard for dual-role users not specifically accessing owner dashboard
              console.log('User has both roles, redirecting to admin dashboard by default');
              window.location.href = `/${locale}/admin`;
            }
          } else if (userData?.is_admin) {
            console.log('User is admin, redirecting to admin dashboard');
            window.location.href = `/${locale}/admin`;
          } else if (userData?.is_verified_owner) {
            console.log('User is verified owner, redirecting to owner dashboard');
            window.location.href = `/${locale}/owner-dashboard`;
          } else {
            // Default fallback if no specific role or verified status
            console.log('No specific role found, redirecting to home page');
            window.location.href = `/${locale}`;
          }
        } catch (userDataError) {
          console.error('Error in user data processing:', userDataError);
          // Fallback redirection if anything goes wrong with user data
          const locale = 'fr'; // Default fallback locale
          window.location.href = `/${locale}`;
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || t('toast.auth.signInError'));
      toast.error(error.message || t('toast.auth.signInError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 px-4">
      <Link
        href="/"
        className="group absolute left-4 top-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        {t('common.back')}
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
              {t('auth.signin.title')}
            </span>
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">
            {t('auth.signin.subtitle')}
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-8 shadow-xl">
          {errorMessage && (
            <div className="mb-6 flex items-center space-x-2 rounded-lg bg-red-50 dark:bg-red-900/30 p-4 text-red-800 dark:text-red-200">
              <AlertCircle className="h-5 w-5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                {t('auth.signin.email')}
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-600 px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder={t('auth.signin.emailPlaceholder')}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                {t('auth.signin.password')}
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-600 px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder={t('auth.signin.passwordPlaceholder')}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 text-brandBlue-600 focus:ring-brandBlue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300">
                  {t('auth.signin.rememberMe')}
                </label>
              </div>

              <div className="text-sm">
                <Link href="/auth/reset-password" className="font-medium text-brandBlue-600 dark:text-brandBlue-400 hover:text-brandBlue-500">
                  {t('auth.signin.forgotPassword')}
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('auth.signin.submitting')}
                </div>
              ) : (
                t('auth.signin.submit')
              )}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              {t('auth.signin.noAccount')}{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                {t('auth.signin.signup')}
              </Link>
            </p>
            <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
              {t('auth.signin.forgotPassword')}{" "}
              <Link
                href="/auth/reset-password"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                {t('auth.signin.resetPassword')}
              </Link>
            </p>
          </div>
          
          <div className="mt-6">
            <SocialLoginButtons />
          </div>
        </div>
      </div>
    </div>
  );
} 