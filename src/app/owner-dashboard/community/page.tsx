"use client";

import React from "react";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";
import { useI18n } from "@/lib/i18n/client";
import { Users, Calendar, MessageSquare, Info } from "lucide-react";

export default function CommunityPage() {
  const { t } = useI18n();
  
  // Mock community events
  const events = [
    {
      id: 1,
      title: "Annual General Meeting",
      date: new Date(2023, 5, 15, 18, 0), // June 15, 2023, 6:00 PM
      location: "Community Hall",
      description: "Annual general meeting to discuss the community's finances, projects, and elect new committee members."
    },
    {
      id: 2,
      title: "Summer Beach Cleanup",
      date: new Date(2023, 6, 8, 9, 0), // July 8, 2023, 9:00 AM
      location: "Main Beach",
      description: "Join us for our annual beach cleanup event. Refreshments will be provided."
    },
    {
      id: 3,
      title: "Community Barbecue",
      date: new Date(2023, 7, 20, 17, 0), // August 20, 2023, 5:00 PM
      location: "Pool Area",
      description: "End of summer community barbecue. Bring your family and enjoy food, music, and games."
    }
  ];
  
  // Mock announcements
  const announcements = [
    {
      id: 1,
      title: "Pool Maintenance",
      date: new Date(2023, 4, 10), // May 10, 2023
      content: "The pool will be closed for maintenance from May 15 to May 17. We apologize for any inconvenience."
    },
    {
      id: 2,
      title: "New Security Measures",
      date: new Date(2023, 4, 5), // May 5, 2023
      content: "We have implemented new security measures at the main entrance. Please check your email for details."
    },
    {
      id: 3,
      title: "Water Outage Notice",
      date: new Date(2023, 3, 28), // April 28, 2023
      content: "There will be a scheduled water outage on May 2 from 10:00 AM to 2:00 PM due to maintenance work."
    }
  ];
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const formatAnnouncementDate = (date: Date) => {
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <OwnerDashboardTemplate>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">{t("navigation.community")}</h1>
        <p className="text-sm text-gray-500 mt-1">Stay connected with your community</p>
      </div>
      
      {/* Upcoming Events */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-800">Upcoming Events</h2>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {events.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {events.map((event) => (
                <div key={event.id} className="p-4">
                  <h3 className="font-medium text-gray-800">{event.title}</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Date & Time:</span> {formatDate(event.date)}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Location:</span> {event.location}
                    </p>
                    <p className="text-gray-600 mt-2">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No upcoming events at this time.
            </div>
          )}
        </div>
      </div>
      
      {/* Announcements */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Info className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-800">Announcements</h2>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {announcements.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-800">{announcement.title}</h3>
                    <span className="text-xs text-gray-500">{formatAnnouncementDate(announcement.date)}</span>
                  </div>
                  <p className="mt-2 text-gray-600">{announcement.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No announcements at this time.
            </div>
          )}
        </div>
      </div>
      
      {/* Community Forum */}
      <div>
        <div className="flex items-center mb-4">
          <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-800">Community Forum</h2>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Join the Conversation</h3>
          <p className="text-gray-600 mb-4">
            Connect with your neighbors, share ideas, and stay informed about community matters.
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Coming Soon
          </button>
        </div>
      </div>
    </OwnerDashboardTemplate>
  );
} 