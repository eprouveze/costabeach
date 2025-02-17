"use client";

export default function OwnerDashboardTemplate({ children }: { children?: React.ReactNode }) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Owner Dashboard Template</h1>
      {children}
    </div>
  );
} 