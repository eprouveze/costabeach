"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";

export default function VerifyEmailPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Extract email from URL params if available
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleBackToLogin = () => {
    router.push("/owner-login");
  };

  const handleResendEmail = () => {
    // Redirect back to login to trigger another email
    router.push("/owner-login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex justify-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Check your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a verification link to your email address
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="space-y-4">
              {email && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Email sent to:</strong> {email}
                  </p>
                </div>
              )}
              
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  Click the link in the email to sign in to your account.
                </p>
                <p>
                  If you don't see the email, check your spam folder.
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={handleResendEmail}
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend email
                </button>

                <button
                  onClick={handleBackToLogin}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-center text-xs text-gray-500">
            Having trouble? Contact support for assistance.
          </div>
        </div>
      </div>
    </div>
  );
}