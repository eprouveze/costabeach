"use client";

import { useState, useEffect } from "react";

export default function TrpcDebugTest() {
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testTrpc = async () => {
      try {
        const response = await fetch("/api/trpc-test");
        const data = await response.json();
        setApiResponse(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    testTrpc();
  }, []);

  async function testDirectApiCall() {
    try {
      const response = await fetch("/api/trpc/healthCheck");
      setApiResponse(await response.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">TRPC Debug Test</h1>
      <button
        onClick={testDirectApiCall}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Test Direct TRPC API Call
      </button>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {apiResponse ? (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(apiResponse, null, 2)}
        </pre>
      ) : (
        <div className="animate-pulse">Loading...</div>
      )}
    </div>
  );
}
