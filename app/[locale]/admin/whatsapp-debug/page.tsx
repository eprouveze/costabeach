"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function WhatsAppDebugPage() {
  const session = useSession();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDebugInfo({
      sessionStatus: session.status,
      sessionData: session.data,
      userId: session.data?.user?.id,
      userEmail: session.data?.user?.email,
      isAdmin: session.data?.user?.isAdmin
    });
  }, [session]);

  const testAuthAPI = async () => {
    try {
      const response = await fetch('/api/test-auth');
      const data = await response.json();
      setApiResponse({ status: response.status, data });
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setApiResponse(null);
    }
  };

  const testPermissionsAPI = async () => {
    if (!session.data?.user?.id) {
      setError('No user ID available');
      return;
    }

    try {
      const response = await fetch(`/api/users/${session.data.user.id}/permissions`);
      const data = await response.json();
      setApiResponse({ status: response.status, data });
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setApiResponse(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">WhatsApp Admin Debug Page</h1>
        
        {/* Session Debug Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Information</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* API Test Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Tests</h2>
          <div className="space-x-4 mb-4">
            <button
              onClick={testAuthAPI}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Auth API
            </button>
            <button
              onClick={testPermissionsAPI}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={!session.data?.user?.id}
            >
              Test Permissions API
            </button>
          </div>

          {/* API Response */}
          {apiResponse && (
            <div>
              <h3 className="font-semibold mb-2">API Response:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div>
              <h3 className="font-semibold mb-2 text-red-600">Error:</h3>
              <pre className="bg-red-100 p-4 rounded text-sm overflow-auto text-red-800">
                {error}
              </pre>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Navigation</h2>
          <div className="space-x-4">
            <button
              onClick={() => router.push(`/${window.location.pathname.split('/')[1]}/admin`)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back to Admin
            </button>
            <button
              onClick={() => router.push('/admin/whatsapp')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to WhatsApp Admin
            </button>
            {session.status === 'unauthenticated' && (
              <button
                onClick={() => router.push('/owner-login')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Go to Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}