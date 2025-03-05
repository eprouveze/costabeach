"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/supabase/auth';
import { toast } from 'react-toastify';
import { useI18n } from '@/lib/i18n/client';
import { Loader2 } from 'lucide-react';

interface SocialLoginButtonsProps {
  redirectUrl?: string;
}

export default function SocialLoginButtons({ redirectUrl = '/auth/callback' }: SocialLoginButtonsProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Get the current URL to use as the redirect URL
  const getFullRedirectUrl = () => {
    // Handle both development and production environments
    if (typeof window === 'undefined') {
      return redirectUrl; // Server-side rendering fallback
    }

    // Get the base URL (domain)
    const baseUrl = window.location.origin;
    
    // Ensure we have a path that starts with /
    const path = redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`;
    
    // Extract the locale from the current URL if possible
    const currentPath = window.location.pathname;
    const locale = currentPath.split('/')[1];
    const isLocale = ['en', 'fr', 'ar'].includes(locale);
    
    // If we're on a localized path, include locale in redirect
    if (isLocale && !path.startsWith(`/${locale}`)) {
      return `${baseUrl}/${locale}${path}`;
    }
    
    return `${baseUrl}${path}`;
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      // Log the redirect URL for debugging
      console.log('Redirect URL:', getFullRedirectUrl());
      
      const { error } = await signInWithGoogle(getFullRedirectUrl());
      if (error) {
        console.error('Google sign in error:', error);
        toast.error(error.message || 'Failed to sign in with Google');
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-300 dark:border-neutral-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
            {t('auth.social.orContinueWith')}
          </span>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="flex items-center justify-center w-full max-w-xs px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors"
        >
          {isGoogleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-neutral-600 dark:text-neutral-400" />
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                </g>
              </svg>
              Google
            </>
          )}
        </button>
      </div>
    </div>
  );
} 