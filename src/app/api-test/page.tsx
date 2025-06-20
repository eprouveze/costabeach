"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/trpc/react";
import { skipToken } from "@tanstack/react-query";

export default function ApiTestPage() {
  const [shouldFetch, setShouldFetch] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [endpoint, setEndpoint] = useState<string>("/api/test-api");

  // Use the correct syntax for tRPC useQuery with React Query v5
  const healthCheck = api.healthCheck.useQuery(
    shouldFetch ? undefined : skipToken,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false
    }
  );

  // Use useEffect to handle the query results
  useEffect(() => {
    if (healthCheck.data) {
      setResult(healthCheck.data);
      setError(null);
    }
    if (healthCheck.error) {
      // Create a proper Error object from the tRPC error
      const errorMessage = healthCheck.error.message || 'Unknown tRPC error';
      setError(new Error(errorMessage));
      setResult(null);
    }
  }, [healthCheck.data, healthCheck.error]);

  const testRegularApi = async () => {
    try {
      setResult(null);
      setError(null);
      const response = await fetch(endpoint);
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const testTrpcApi = () => {
    setShouldFetch(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <div className="mb-4">
        <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 mb-1">
          API Endpoint:
        </label>
        <div className="flex">
          <select 
            id="endpoint"
            className="flex-1 p-2 border rounded mr-2"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          >
            <option value="/api/test-api">Test API</option>
            <option value="/api/test-document">Test Document API</option>
            <option value="/api/trpc/healthCheck">Direct tRPC Health Check</option>
          </select>
          
          <button
            onClick={testRegularApi}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Regular API
          </button>
        </div>
      </div>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={testTrpcApi}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={shouldFetch && healthCheck.isLoading}
        >
          Test tRPC API (via Client)
        </button>
      </div>
      
      {healthCheck.isLoading && (
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <p className="text-gray-500">Loading...</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 border rounded bg-red-50 text-red-700">
          <h2 className="font-bold">Error:</h2>
          <p>{error.message}</p>
          {error.stack && (
            <pre className="mt-2 text-xs overflow-x-auto">{error.stack}</pre>
          )}
        </div>
      )}
      
      {result && (
        <div className="p-4 border rounded bg-green-50">
          <h2 className="font-bold mb-2">Result:</h2>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 