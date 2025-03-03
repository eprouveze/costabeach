"use client";

import { useState } from "react";

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const setupDatabase = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      const response = await fetch('/api/setup-database');
      const data = await response.json();
      
      setResult(data);
      
      if (!data.success) {
        setError(data.message || "Unknown error");
      }
    } catch (err: any) {
      console.error("Setup error:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const setupUser = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      const email = "manu@prouveze.fr"; // Hardcoded for this specific user
      const response = await fetch(`/api/setup-user?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      setResult(data);
      
      if (!data.success) {
        setError(data.message || "Unknown error");
      }
    } catch (err: any) {
      console.error("Setup error:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Setup</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Database Setup</h2>
        <p className="mb-4">
          This will set up the necessary database tables, RLS policies, and functions.
        </p>
        <button
          onClick={setupDatabase}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Setting up..." : "Set Up Database"}
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">User Setup</h2>
        <p className="mb-4">
          This will set up the user <strong>manu@prouveze.fr</strong> as a verified owner with proper permissions.
        </p>
        <button
          onClick={setupUser}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Setting up..." : "Set Up User"}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded">
          <h3 className="font-bold mb-2">Result</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 