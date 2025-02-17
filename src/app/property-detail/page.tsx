"use client";

import React from "react";
import PublicLandingTemplate from "@/components/templates/PublicLandingTemplate";

export default function PropertyDetailPage() {
  return (
    <PublicLandingTemplate>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Property Details</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Overview</h2>
            <p className="text-gray-600">
              Detailed information about the property will be displayed here...
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Features</h2>
            <ul className="list-disc list-inside text-gray-600">
              <li>Feature 1</li>
              <li>Feature 2</li>
              <li>Feature 3</li>
            </ul>
          </div>
        </div>
      </main>
    </PublicLandingTemplate>
  );
} 