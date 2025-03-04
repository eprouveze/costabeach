"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building, Home, Phone, Loader2, AlertCircle, Check } from 'lucide-react';
import { updateUserProfile, checkProfileCompletion } from '@/lib/supabase/auth';
import { toast } from 'react-toastify';
import { useSupabaseSession } from '@/lib/supabase/hooks';
import { Language } from '@/lib/types';
import { useI18n } from '@/lib/i18n/client';

export default function ProfileCompletionForm() {
  const { t } = useI18n();
  const { session, user, isLoading: sessionLoading } = useSupabaseSession();
  const [buildingNumber, setBuildingNumber] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<Language>(Language.FRENCH);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // If there's no session, redirect to login
    if (!sessionLoading && !session) {
      router.push('/auth/signin');
      return;
    }

    // Check if the user already has a complete profile
    if (user?.id) {
      checkIfProfileComplete(user.id);
    }
  }, [user, sessionLoading, session, router]);

  const checkIfProfileComplete = async (userId: string) => {
    setIsChecking(true);
    try {
      const { isComplete } = await checkProfileCompletion(userId);
      if (isComplete) {
        // Profile is already complete, redirect to owner dashboard
        toast.success('Your profile is already complete');
        router.push('/owner-dashboard');
      }
    } catch (error: any) {
      console.error('Error checking profile completion:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (!user?.id) {
      setErrorMessage('Not authenticated. Please sign in again.');
      setIsLoading(false);
      return;
    }

    try {
      // Update the user profile with the provided information
      const { error } = await updateUserProfile(user.id, {
        buildingNumber,
        apartmentNumber,
        phoneNumber,
        preferredLanguage,
      });
      
      if (error) {
        setErrorMessage(error.message);
        toast.error(error.message);
        return;
      }
      
      toast.success('Profile updated successfully!');
      
      // Get the current locale from the URL
      const path = window.location.pathname;
      const pathParts = path.split('/');
      const locale = pathParts.length > 1 && ['fr', 'en', 'ar'].includes(pathParts[1]) 
        ? pathParts[1] 
        : 'fr';
      
      // Redirect to the owner dashboard
      window.location.href = `/${locale}/owner-dashboard`;
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred while updating your profile');
      toast.error(error.message || 'An error occurred while updating your profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (sessionLoading || isChecking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 px-4 py-12">
      <Link
        href="/"
        className="group absolute left-4 top-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
              Complete Your Profile
            </span>
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">
            We need a few more details to complete your registration
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-8 shadow-xl">
          {errorMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-red-800 dark:text-red-200">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="building-number"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Building Number *
                </label>
                <div className="mt-2 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Building className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="building-number"
                    name="buildingNumber"
                    type="text"
                    required
                    value={buildingNumber}
                    onChange={(e) => setBuildingNumber(e.target.value)}
                    className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-600 pl-10 px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="Enter building number"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="apartment-number"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Apartment Number *
                </label>
                <div className="mt-2 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Home className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="apartment-number"
                    name="apartmentNumber"
                    type="text"
                    required
                    value={apartmentNumber}
                    onChange={(e) => setApartmentNumber(e.target.value)}
                    className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-600 pl-10 px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="Enter apartment number"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="phone-number"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Phone Number
              </label>
              <div className="mt-2 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="phone-number"
                  name="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-600 pl-10 px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="Enter phone number"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="preferred-language"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Preferred Language
              </label>
              <div className="mt-2">
                <select
                  id="preferred-language"
                  name="preferredLanguage"
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value as Language)}
                  className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-600 px-4 py-3 text-neutral-900 dark:text-white shadow-sm dark:bg-neutral-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                  disabled={isLoading}
                >
                  <option value={Language.FRENCH}>French</option>
                  <option value={Language.ENGLISH}>English</option>
                  <option value={Language.ARABIC}>Arabic</option>
                </select>
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
                  Saving...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Check className="h-4 w-4 mr-2" />
                  Complete Registration
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 