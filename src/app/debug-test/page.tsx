"use client";

import { useEffect, useState } from "react";

export default function DebugTest() {
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        const response = await fetch("/api/direct-debug");
        const data = await response.json();
        setResults(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    testApi();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">API Debug Test</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {results ? (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(results, null, 2)}
        </pre>
      ) : (
        <div className="animate-pulse">Loading...</div>
      )}
    </div>
  );
}
