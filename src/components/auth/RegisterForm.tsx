"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, User, Phone, Building, Home, Loader2, AlertCircle } from 'lucide-react';
import { signUp } from '@/lib/supabase/auth';
import { toast } from 'react-toastify';
import { Language } from '@/lib/types';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<Language>(Language.FRENCH);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await signUp(email, password, {
        name,
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
      
      toast.success('Registration successful! Please check your email to confirm your account.');
      router.push('/auth/verify');
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred during registration');
      toast.error(error.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

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
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brandBlue-500 to-brandBlue-700 dark:from-brandBlue-400 dark:to-brandBlue-600">
              Create Account
            </span>
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">
            Join Costa Beach to access exclusive owner resources
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
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Full Name
              </label>
              <div className="mt-2 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-600 pl-10 px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:border-brandBlue-500 dark:focus:border-brandBlue-400 focus:ring-brandBlue-500 dark:focus:ring-brandBlue-400"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Email address
              </label>
              <div className="mt-2 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-600 pl-10 px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:border-brandBlue-500 dark:focus:border-brandBlue-400 focus:ring-brandBlue-500 dark:focus:ring-brandBlue-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="building-number"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Building Number
                </label>
                <div className="mt-2 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Building className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="building-number"
                    name="buildingNumber"
                    type="text"
                    value={buildingNumber}
                    onChange={(e) => setBuildingNumber(e.target.value)}
                    className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-600 pl-10 px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:border-brandBlue-500 dark:focus:border-brandBlue-400 focus:ring-brandBlue-500 dark:focus:ring-brandBlue-400"
                    placeholder="B12"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="apartment-number"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Apartment Number
                </label>
                <div className="mt-2 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Home className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="apartment-number"
                    name="apartmentNumber"
                    type="text"
                    value={apartmentNumber}
                    onChange={(e) => setApartmentNumber(e.target.value)}
                    className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-600 pl-10 px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:border-brandBlue-500 dark:focus:border-brandBlue-400 focus:ring-brandBlue-500 dark:focus:ring-brandBlue-400"
                    placeholder="304"
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
                  className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-600 pl-10 px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:border-brandBlue-500 dark:focus:border-brandBlue-400 focus:ring-brandBlue-500 dark:focus:ring-brandBlue-400"
                  placeholder="+212 123 456 789"
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
                  className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-600 px-4 py-3 text-neutral-900 dark:text-white shadow-sm dark:bg-neutral-800 focus:border-brandBlue-500 dark:focus:border-brandBlue-400 focus:ring-brandBlue-500 dark:focus:ring-brandBlue-400"
                >
                  <option value={Language.FRENCH}>French</option>
                  <option value={Language.ENGLISH}>English</option>
                  <option value={Language.ARABIC}>Arabic</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Password
              </label>
              <div className="mt-2 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-600 pl-10 px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:border-brandBlue-500 dark:focus:border-brandBlue-400 focus:ring-brandBlue-500 dark:focus:ring-brandBlue-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Confirm Password
              </label>
              <div className="mt-2 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-600 pl-10 px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:border-brandBlue-500 dark:focus:border-brandBlue-400 focus:ring-brandBlue-500 dark:focus:ring-brandBlue-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 px-4 py-3 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30 focus:outline-none focus:ring-2 focus:ring-brandBlue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <User className="h-5 w-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="font-medium text-brandBlue-600 dark:text-brandBlue-400 hover:text-brandBlue-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 