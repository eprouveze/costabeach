"use client";

import { useState } from "react";
import { api } from "@/lib/trpc";

export function TrpcDebug() {
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testHealthCheck = async () => {
    setLoading(true);
    setResult("");
    setError("");
    
    try {
      // Test the health check endpoint
      const response = await fetch("/api/debug");
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(`REST API Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const testTrpc = async () => {
    setLoading(true);
    setResult("");
    setError("");
    
    try {
      // Test the tRPC health check endpoint
      const data = await api.documents.healthCheck.query();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(`tRPC Error: ${err instanceof Error ? err.message : String(err)}`);
      console.error("tRPC test error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">tRPC Debug Tool</h1>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={testHealthCheck}
          disabled={loading}
          className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          Test REST API
        </button>
        
        <button
          onClick={testTrpc}
          disabled={loading}
          className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300"
        >
          Test tRPC API
        </button>
      </div>
      
      {loading && (
        <div className="mb-4 text-gray-700 dark:text-gray-300">Loading...</div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md dark:bg-red-900 dark:text-red-200">
          <h3 className="font-bold mb-2">Error:</h3>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}
      
      {result && (
        <div className="mb-4">
          <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Result:</h3>
          <pre className="p-4 bg-gray-100 rounded-md overflow-auto text-sm text-gray-800 dark:bg-gray-900 dark:text-gray-300">{result}</pre>
        </div>
      )}
      
      <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
        <p>This tool tests both REST API endpoints and tRPC endpoints to help diagnose connection issues.</p>
      </div>
    </div>
  );
} 