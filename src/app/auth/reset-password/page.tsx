"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { resetPassword } from '@/lib/supabase/auth';
import { toast } from 'react-toastify';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await resetPassword(email);
      
      if (error) {
        setErrorMessage(error.message);
        toast.error(error.message);
        return;
      }
      
      setIsSuccess(true);
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred');
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 px-4">
      <Link
        href="/auth/signin"
        className="group absolute left-4 top-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Sign In
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brandBlue-500 to-brandBlue-700 dark:from-brandBlue-400 dark:to-brandBlue-600">
              Reset Password
            </span>
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">
            Enter your email to receive a password reset link
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-8 shadow-xl">
          {errorMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-red-800 dark:text-red-200">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Check your email
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions to reset your password.
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                If you don't see the email, check your spam folder.
              </p>
              <Link
                href="/auth/signin"
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 px-6 py-3 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30 focus:outline-none focus:ring-2 focus:ring-brandBlue-500 focus:ring-offset-2"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 px-4 py-3 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30 focus:outline-none focus:ring-2 focus:ring-brandBlue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 