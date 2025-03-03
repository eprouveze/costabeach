export default function DebugPagesIndex() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Debug Pages</h1>
      <p className="mb-6 text-gray-600">These pages help test various API and routing functionality.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DebugCard 
          title="Direct API Debug" 
          href="/debug-test" 
          description="Tests the direct debug API endpoint without tRPC" 
        />
        
        <DebugCard 
          title="tRPC Debug" 
          href="/trpc-debug-test" 
          description="Tests the tRPC API endpoints" 
        />
        
        <DebugCard 
          title="API Test Page" 
          href="/test-debug" 
          description="Tests various API endpoints" 
        />
      </div>
    </div>
  );
}

function DebugCard({ title, href, description }: { title: string; href: string; description: string }) {
  return (
    <a 
      href={href}
      className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100"
    >
      <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900">{title}</h5>
      <p className="font-normal text-gray-700">{description}</p>
      <div className="mt-4 flex justify-end">
        <span className="text-blue-600 hover:underline">Visit →</span>
      </div>
    </a>
  );
} 