"use client";

import React from "react";
import Link from "next/link";
import { Users, ClipboardList } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/owner-registrations"
            className="block p-6 bg-white dark:bg-neutral-800 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Owner Registrations</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage owner registration requests</p>
              </div>
            </div>
          </Link>

          {/* Add more admin sections here */}
        </div>
      </div>
    </div>
  );
} 