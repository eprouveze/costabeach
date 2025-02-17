"use client";

import React from "react";

interface PublicLandingTemplateProps {
  children?: React.ReactNode;
}

export default function PublicLandingTemplate({ children }: PublicLandingTemplateProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome to Costa Beach</h1>
        <p className="text-xl text-gray-600 mb-8">
          Find your perfect beachfront property for an unforgettable vacation experience.
        </p>
        {children}
      </main>
    </div>
  );
} 