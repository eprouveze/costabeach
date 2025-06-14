"use client";

import React from "react";
import { toast } from "react-toastify";
import { Check, X, AlertCircle } from "lucide-react";
import { Header } from "@/components/organisms/Header";

type OwnerRegistration = {
  id: string;
  name: string;
  email: string;
  buildingNumber: string;
  apartmentNumber: string;
  phoneNumber: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  notes?: string;
};

export default function OwnerRegistrationsPage() {
  const [registrations, setRegistrations] = React.useState<OwnerRegistration[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState("");

  const fetchRegistrations = async () => {
    try {
      const response = await fetch("/api/admin/owner-registrations");
      if (!response.ok) throw new Error("Failed to fetch registrations");
      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      toast.error("Failed to load registrations");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      const response = await fetch(`/api/admin/owner-registrations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} registration`);
      
      toast.success(`Registration ${action}d successfully`);
      setSelectedId(null);
      setNotes("");
      fetchRegistrations();
    } catch (error) {
      toast.error(`Failed to ${action} registration`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Owner Registration Requests</h1>
        
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-neutral-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Building</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Apartment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
              {registrations.map((registration) => (
                <tr key={registration.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{registration.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{registration.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{registration.buildingNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{registration.apartmentNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                      ${registration.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                      ${registration.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                    `}>
                      {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {new Date(registration.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {registration.status === 'pending' && (
                      <div className="flex items-center justify-end space-x-2">
                        {selectedId === registration.id ? (
                          <>
                            <textarea
                              className="block w-48 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm"
                              placeholder="Add notes (optional)"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                            />
                            <button
                              onClick={() => handleAction(registration.id, "approve")}
                              className="inline-flex items-center p-1 border border-transparent rounded-full text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAction(registration.id, "reject")}
                              className="inline-flex items-center p-1 border border-transparent rounded-full text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedId(null);
                                setNotes("");
                              }}
                              className="inline-flex items-center p-1 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-200 bg-white dark:bg-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setSelectedId(registration.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    )}
                    {registration.notes && (
                      <div className="mt-2 flex items-center justify-end text-xs text-gray-500 dark:text-gray-400">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {registration.notes}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
} 