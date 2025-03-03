"use client";

import React, { useState } from "react";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";
import { useI18n } from "@/lib/i18n/client";
import { Moon, Sun, Bell, BellOff, Mail, MailX } from "lucide-react";
import { toast } from "react-toastify";

export default function SettingsPage() {
  const { t, locale } = useI18n();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Mock function to handle language change
  const handleLanguageChange = (language: string) => {
    // In a real implementation, this would change the application's locale
    toast.success(`Language changed to ${language}`);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.success(darkMode ? "Light mode enabled" : "Dark mode enabled");
  };

  const toggleNotifications = () => {
    setNotifications(!notifications);
    toast.success(notifications ? "In-app notifications disabled" : "In-app notifications enabled");
  };

  const toggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications);
    toast.success(emailNotifications ? "Email notifications disabled" : "Email notifications enabled");
  };

  return (
    <OwnerDashboardTemplate>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">{t("settings.title") || "Settings"}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("settings.description") || "Manage your account settings and preferences"}</p>
      </div>

      <div className="space-y-8">
        {/* Language Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 mb-4">{t("settings.language") || "Language"}</h2>
          <p className="text-sm text-gray-600 mb-4">{t("settings.languageDescription") || "Select your preferred language for the application"}</p>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => handleLanguageChange("English")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${locale === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              English
            </button>
            <button 
              onClick={() => handleLanguageChange("French")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${locale === 'fr' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Français
            </button>
            <button 
              onClick={() => handleLanguageChange("Arabic")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${locale === 'ar' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              العربية
            </button>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 mb-4">{t("settings.appearance") || "Appearance"}</h2>
          <p className="text-sm text-gray-600 mb-4">{t("settings.appearanceDescription") || "Customize the appearance of the application"}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {darkMode ? (
                <Moon className="w-5 h-5 text-blue-600 mr-3" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500 mr-3" />
              )}
              <div>
                <p className="font-medium text-gray-800">{t("settings.darkMode") || "Dark Mode"}</p>
                <p className="text-sm text-gray-500">{t("settings.darkModeDescription") || "Toggle between light and dark mode"}</p>
              </div>
            </div>
            <button 
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} 
              />
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 mb-4">{t("settings.notifications") || "Notifications"}</h2>
          <p className="text-sm text-gray-600 mb-4">{t("settings.notificationsDescription") || "Manage how you receive notifications"}</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {notifications ? (
                  <Bell className="w-5 h-5 text-blue-600 mr-3" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400 mr-3" />
                )}
                <div>
                  <p className="font-medium text-gray-800">{t("settings.inAppNotifications") || "In-App Notifications"}</p>
                  <p className="text-sm text-gray-500">{t("settings.inAppNotificationsDescription") || "Receive notifications within the application"}</p>
                </div>
              </div>
              <button 
                onClick={toggleNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <span 
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications ? 'translate-x-6' : 'translate-x-1'}`} 
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {emailNotifications ? (
                  <Mail className="w-5 h-5 text-blue-600 mr-3" />
                ) : (
                  <MailX className="w-5 h-5 text-gray-400 mr-3" />
                )}
                <div>
                  <p className="font-medium text-gray-800">{t("settings.emailNotifications") || "Email Notifications"}</p>
                  <p className="text-sm text-gray-500">{t("settings.emailNotificationsDescription") || "Receive notifications via email"}</p>
                </div>
              </div>
              <button 
                onClick={toggleEmailNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${emailNotifications ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <span 
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} 
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </OwnerDashboardTemplate>
  );
} 