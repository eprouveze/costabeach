import Link from 'next/link';

export default function TestDebugPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">API Testing Page</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">API Endpoints to Test</h2>
        <ul className="space-y-2">
          <li>
            <Link 
              href="/api/debug" 
              className="text-blue-600 hover:underline"
              target="_blank"
            >
              1. Regular API Debug Endpoint
            </Link>
          </li>
          <li>
            <Link 
              href="/api/trpc-test" 
              className="text-blue-600 hover:underline"
              target="_blank"
            >
              2. tRPC Test Endpoint
            </Link>
          </li>
          <li>
            <Link 
              href="/api/trpc/documents.healthCheck" 
              className="text-blue-600 hover:underline"
              target="_blank"
            >
              3. Direct tRPC Health Check
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Manual Testing Instructions</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Click each link above to test if the API endpoints are working</li>
          <li>If you see proper JSON responses, the API routes are functioning</li>
          <li>Check browser console for any errors</li>
          <li>If an endpoint returns HTML instead of JSON, that indicates a routing issue</li>
        </ol>
      </div>
    </div>
  );
} 