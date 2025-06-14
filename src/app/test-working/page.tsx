import { TrpcDebug } from "@/components/TrpcDebug";
import Link from "next/link";

export default function DebugPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Debug Tools</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Navigation</h2>
        <ul className="list-disc pl-5">
          <li><Link href="/" className="text-blue-600 hover:underline">Home</Link></li>
          <li><Link href="/api/debug" className="text-blue-600 hover:underline">API Debug Endpoint</Link></li>
        </ul>
      </div>
      
      <TrpcDebug />
    </div>
  );
} 