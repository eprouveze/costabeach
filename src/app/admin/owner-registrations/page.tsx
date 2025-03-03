"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { ArrowLeft, Check, X, User, Clock, Filter } from "lucide-react";

export default function OwnerRegistrationsPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Mock data for owner registrations
  const mockRegistrations = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      building: 'A',
      apartment: '101',
      phone: '+212 600 000 001',
      status: 'pending',
      createdAt: new Date(2023, 4, 15).toISOString(),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      building: 'B',
      apartment: '202',
      phone: '+212 600 000 002',
      status: 'approved',
      createdAt: new Date(2023, 4, 10).toISOString(),
    },
    {
      id: '3',
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@example.com',
      building: 'C',
      apartment: '303',
      phone: '+212 600 000 003',
      status: 'rejected',
      createdAt: new Date(2023, 4, 5).toISOString(),
    },
  ];

  // Filter registrations based on active tab
  const filteredRegistrations = mockRegistrations.filter(reg => reg.status === activeTab);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link 
              href="/admin"
              className="text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{t("admin.pendingRegistrations")}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'pending'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {t("admin.pendingRegistrations")}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'approved'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-2" />
                {t("admin.approvedRegistrations")}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'rejected'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <X className="h-4 w-4 mr-2" />
                {t("admin.rejectedRegistrations")}
              </div>
            </button>
          </nav>
        </div>

        {/* Registrations List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredRegistrations.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredRegistrations.map((registration) => (
                <li key={registration.id}>
                  <Link 
                    href={`/admin/owner-registrations/${registration.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <User className="h-10 w-10 rounded-full bg-gray-100 p-2 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{registration.name}</p>
                            <p className="text-sm text-gray-500">{registration.email}</p>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {`${registration.building}-${registration.apartment}`}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {registration.phone}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            {formatDate(registration.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">{t("common.noResults")}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 