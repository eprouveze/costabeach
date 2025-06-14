"use client";

export default function TestDebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="space-y-6">
        <TestCard 
          title="Health Check API" 
          endpoint="/api/health" 
          description="Basic health check endpoint that returns a 200 OK response" 
        />
        
        <TestCard 
          title="Debug API" 
          endpoint="/api/debug" 
          description="Debug information endpoint that returns details about the API" 
        />
        
        <TestCard 
          title="tRPC Test API" 
          endpoint="/api/trpc-test" 
          description="Test endpoint that calls a tRPC procedure directly from the server" 
        />
        
        <TestCard 
          title="Regular tRPC API" 
          endpoint="/api/trpc/healthCheck" 
          description="Standard tRPC endpoint access" 
        />
      </div>
    </div>
  );
}

function TestCard({ title, endpoint, description }: { 
  title: string;
  endpoint: string;
  description: string;
}) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      
      <div className="flex space-x-4">
        <a 
          href={endpoint}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Open API
        </a>
        
        <button
          onClick={async () => {
            try {
              const response = await fetch(endpoint);
              const data = await response.json();
              console.log('API Response:', data);
              console.log('✅ Success: Check the response data above');
            } catch (err) {
              console.error('Error calling API:', err);
              console.error('❌ Error: Check the error details above');
            }
          }}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Test in Console
        </button>
      </div>
    </div>
  );
}
