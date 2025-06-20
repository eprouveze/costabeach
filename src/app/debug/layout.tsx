export default function DebugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto">
      {children}
    </div>
  );
} 