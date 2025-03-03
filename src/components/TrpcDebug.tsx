"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/trpc";

export function TrpcDebug() {
  const [baseUrl, setBaseUrl] = useState<string>("unknown");
  const [apiUrl, setApiUrl] = useState<string>("unknown");
  const [healthCheck, setHealthCheck] = useState<string>("not checked");
  const [error, setError] = useState<string | null>(null);

  const healthCheckQuery = api.documents.healthCheck.useQuery(undefined, {
    retry: false,
  });

  // Update state based on query results
  useEffect(() => {
    if (healthCheckQuery.isSuccess) {
      setHealthCheck(JSON.stringify(healthCheckQuery.data, null, 2));
      setError(null);
    } else if (healthCheckQuery.isError) {
      setHealthCheck("failed");
      setError(healthCheckQuery.error.message);
    }
  }, [healthCheckQuery.isSuccess, healthCheckQuery.isError, healthCheckQuery.data, healthCheckQuery.error]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
      setApiUrl(`${window.location.origin}/api/trpc`);
    }
  }, []);

  return (
    <div className="p-4 mt-4 border rounded bg-slate-50 dark:bg-slate-800 text-sm">
      <h2 className="text-lg font-semibold mb-2">tRPC Debug Info</h2>
      <div className="grid grid-cols-1 gap-2">
        <div>
          <span className="font-semibold">Base URL:</span> {baseUrl}
        </div>
        <div>
          <span className="font-semibold">API URL:</span> {apiUrl}
        </div>
        <div>
          <span className="font-semibold">Health Check:</span>
          <pre className="mt-1 p-2 bg-slate-100 dark:bg-slate-700 rounded overflow-auto max-h-20">
            {healthCheck}
          </pre>
        </div>
        {error && (
          <div className="mt-2">
            <span className="font-semibold text-red-500">Error:</span>
            <pre className="mt-1 p-2 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-600 dark:text-red-300 rounded overflow-auto max-h-40">
              {error}
            </pre>
          </div>
        )}
        <div className="mt-2">
          <span className="font-semibold">Status:</span>{" "}
          {healthCheckQuery.isLoading
            ? "Loading..."
            : healthCheckQuery.isError
            ? "Error"
            : "Success"}
        </div>
      </div>
    </div>
  );
} 