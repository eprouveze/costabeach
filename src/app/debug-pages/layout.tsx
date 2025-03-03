export default function DebugLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto mt-8">
      {children}
    </div>
  );
} 