"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";
import { useSession } from "next-auth/react";
import { Bell, Globe, Shield, Save, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

export function SettingsContent() {
  const { t, locale } = useI18n();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    language: locale || "fr",
    emailNotifications: true,
    documentNotifications: true,
    pollNotifications: true,
    emergencyAlerts: true,
    theme: "light",
    showEmail: false,
  });

  useEffect(() => {
    // Load user settings from localStorage or API
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setFormData({ ...formData, ...settings });
      } catch (error) {
        console.error("Error loading user settings:", error);
      }
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to localStorage (in a real app, this would be saved to the backend)
      localStorage.setItem("userSettings", JSON.stringify(formData));
      
      // Here you would typically make an API call to save user preferences
      // await fetch('/api/user/settings', { method: 'POST', body: JSON.stringify(formData) });

      toast.success(t("settings.saveSuccess"));
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(t("settings.saveError"));
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("settings.title")}
        </h1>
        <p className="text-gray-600">
          {t("settings.description")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Language Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t("settings.language.title")}
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("settings.language.display")}
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value as "fr" | "en" | "ar" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t("settings.notifications.title")}
            </h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-900">
                {t("settings.notifications.email")}
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.documentNotifications}
                onChange={(e) => setFormData({ ...formData, documentNotifications: e.target.checked })}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-900">
                {t("settings.notifications.documents")}
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.pollNotifications}
                onChange={(e) => setFormData({ ...formData, pollNotifications: e.target.checked })}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-900">
                {t("settings.notifications.polls")}
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.emergencyAlerts}
                onChange={(e) => setFormData({ ...formData, emergencyAlerts: e.target.checked })}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-900">
                {t("settings.notifications.emergency")}
              </span>
            </label>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t("settings.privacy.title")}
            </h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.showEmail}
                onChange={(e) => setFormData({ ...formData, showEmail: e.target.checked })}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex items-center gap-2">
                {formData.showEmail ? (
                  <Eye className="h-4 w-4 text-gray-400" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-gray-900">
                  {t("settings.privacy.showEmail")}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t("settings.account.title")}
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("settings.account.currentEmail")}
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                {session.user.email}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("settings.account.emailNote")}
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {loading ? t("settings.saving") : t("settings.save")}
          </button>
        </div>
      </div>
    </div>
  );
}