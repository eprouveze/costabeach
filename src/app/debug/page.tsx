import { TrpcDebug } from "@/components/TrpcDebug";

export default function DebugPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Debug Tools</h1>
      <TrpcDebug />
    </div>
  );
} 