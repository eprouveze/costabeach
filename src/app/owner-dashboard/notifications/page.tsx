"use client";

import React, { useState } from "react";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";
import { Bell, FileText, Calendar, Info, Check, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { toast } from "react-toastify";

// Mock notification types
type NotificationType = "document" | "meeting" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  link?: string;
}

export default function NotificationsPage() {
  const { t } = useI18n();
  
  // Mock notifications data - in a real app, this would come from an API
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "document",
      title: t("notifications.newDocument"),
      message: t("notifications.newDocumentMessage", { title: "Rapport Financier Q2 2023" }),
      date: new Date(2023, 5, 15),
      read: false,
      link: "/owner-dashboard/documents?category=comiteDeSuivi"
    },
    {
      id: "2",
      type: "meeting",
      title: t("notifications.upcomingMeeting"),
      message: t("notifications.upcomingMeetingMessage", { date: "20 Juin 2023" }),
      date: new Date(2023, 5, 10),
      read: true
    },
    {
      id: "3",
      type: "document",
      title: t("notifications.newDocument"),
      message: t("notifications.newDocumentMessage", { title: "Contrat de Gestion" }),
      date: new Date(2023, 5, 5),
      read: false,
      link: "/owner-dashboard/documents?category=legal"
    },
    {
      id: "4",
      type: "info",
      title: t("notifications.systemUpdate"),
      message: t("notifications.systemUpdateMessage"),
      date: new Date(2023, 4, 28),
      read: true
    },
    {
      id: "5",
      type: "document",
      title: t("notifications.newDocument"),
      message: t("notifications.newDocumentMessage", { title: "Procès-verbal de l'Assemblée Générale" }),
      date: new Date(2023, 4, 20),
      read: true,
      link: "/owner-dashboard/documents?category=societeDeGestion"
    }
  ]);
  
  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "document":
        return <FileText className="w-5 h-5 text-blue-500" />;
      case "meeting":
        return <Calendar className="w-5 h-5 text-green-500" />;
      case "info":
        return <Info className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return t("notifications.today");
    } else if (diffDays === 1) {
      return t("notifications.yesterday");
    } else if (diffDays < 7) {
      return t("notifications.daysAgo", { days: diffDays });
    } else {
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };
  
  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
    toast.success(t("notifications.markedAsRead"));
  };
  
  // Delete notification
  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
    toast.success(t("notifications.deleted"));
  };
  
  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    toast.success(t("notifications.allMarkedAsRead"));
  };
  
  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <main className="min-h-screen">
      <OwnerDashboardTemplate>
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{t("notifications.title")}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount > 0 
                ? t("notifications.unreadCount", { count: unreadCount }) 
                : t("notifications.allRead")}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{t("notifications.markAllAsRead")}</span>
            </button>
          )}
        </div>
        
        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start">
                    <div className="p-2 bg-gray-100 rounded-full mr-4">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-medium ${!notification.read ? 'text-blue-800' : 'text-gray-900'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(notification.date)}</span>
                      </div>
                      
                      <div className="flex items-center mt-3 space-x-4">
                        {notification.link && (
                          <a 
                            href={notification.link}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {t("notifications.view")}
                          </a>
                        )}
                        
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            {t("notifications.markAsRead")}
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          {t("notifications.delete")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {t("notifications.noNotifications")}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {t("notifications.noNotificationsMessage")}
              </p>
            </div>
          )}
        </div>
      </OwnerDashboardTemplate>
    </main>
  );
} 