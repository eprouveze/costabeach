"use client";

import { useState } from 'react';
import { api } from '@/lib/trpc';

export function TrpcDebugButton() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testTrpc = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      // Test the tRPC healthCheck endpoint
      const response = await api.documents.healthCheck.query();
      setResult(response);
    } catch (err) {
      console.error('tRPC error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      <button
        onClick={testTrpc}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test tRPC Connection'}
      </button>
      
      {result && (
        <div className="mt-2 p-3 bg-green-100 rounded-md text-sm max-w-xs">
          <p className="font-bold text-green-800">Success:</p>
          <pre className="text-xs mt-1 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-3 bg-red-100 rounded-md text-sm max-w-xs">
          <p className="font-bold text-red-800">Error:</p>
          <pre className="text-xs mt-1 whitespace-pre-wrap">{error}</pre>
        </div>
      )}
    </div>
  );
} 