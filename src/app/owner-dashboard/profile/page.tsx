"use client";

import React, { useState } from "react";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";
import { User, Settings, Bell, Globe, Shield, LogOut } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { Language } from "@/lib/types";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const { t } = useI18n();
  
  // Mock user data - in a real app, this would come from an API
  const [userData, setUserData] = useState({
    name: "Mohammed Alami",
    email: "m.alami@example.com",
    role: "Owner",
    language: Language.FRENCH,
    notificationsEnabled: true,
    twoFactorEnabled: false,
    profileImage: null as string | null,
  });
  
  // Handle language change
  const handleLanguageChange = (language: Language) => {
    setUserData({ ...userData, language });
    toast.success(t("profile.languageUpdated"));
    // In a real app, you would update the user's language preference in the database
  };
  
  // Handle notification toggle
  const handleNotificationToggle = () => {
    setUserData({ ...userData, notificationsEnabled: !userData.notificationsEnabled });
    toast.success(userData.notificationsEnabled 
      ? t("profile.notificationsDisabled") 
      : t("profile.notificationsEnabled"));
    // In a real app, you would update the user's notification preference in the database
  };
  
  // Handle two-factor toggle
  const handleTwoFactorToggle = () => {
    // In a real app, this would open a modal to set up 2FA
    setUserData({ ...userData, twoFactorEnabled: !userData.twoFactorEnabled });
    toast.success(userData.twoFactorEnabled 
      ? t("profile.twoFactorDisabled") 
      : t("profile.twoFactorEnabled"));
  };
  
  // Handle profile image upload
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUserData({ ...userData, profileImage: event.target.result as string });
          toast.success(t("profile.imageUpdated"));
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    // In a real app, you would call a logout API
    toast.info(t("profile.loggingOut"));
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  };

  return (
    <main className="min-h-screen">
      <OwnerDashboardTemplate>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">{t("profile.title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("profile.subtitle")}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                {t("profile.personalInfo")}
              </h2>
              
              <div className="flex flex-col md:flex-row items-start md:items-center mb-6">
                <div className="relative mb-4 md:mb-0 md:mr-6">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {userData.profileImage ? (
                      <img 
                        src={userData.profileImage} 
                        alt={userData.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <label 
                    htmlFor="profile-image" 
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    <input 
                      type="file" 
                      id="profile-image" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                    />
                  </label>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-gray-800">{userData.name}</h3>
                  <p className="text-gray-600">{userData.email}</p>
                  <div className="mt-2 inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {userData.role}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("profile.name")}
                  </label>
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("profile.email")}
                  </label>
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => toast.success(t("profile.profileUpdated"))}
                  >
                    {t("profile.saveChanges")}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Settings */}
          <div className="space-y-6">
            {/* Language Preferences */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
                  {t("profile.languagePreferences")}
                </h2>
                
                <div className="space-y-3">
                  <div 
                    className={`p-3 rounded-lg border cursor-pointer ${
                      userData.language === Language.FRENCH 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleLanguageChange(Language.FRENCH)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-blue-800">FR</span>
                        </div>
                        <span className="font-medium text-gray-800">{t("profile.french")}</span>
                      </div>
                      {userData.language === Language.FRENCH && (
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                  </div>
                  
                  <div 
                    className={`p-3 rounded-lg border cursor-pointer ${
                      userData.language === Language.ARABIC 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleLanguageChange(Language.ARABIC)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-green-800">AR</span>
                        </div>
                        <span className="font-medium text-gray-800">{t("profile.arabic")}</span>
                      </div>
                      {userData.language === Language.ARABIC && (
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-blue-600" />
                  {t("profile.notifications")}
                </h2>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">{t("profile.enableNotifications")}</span>
                  <button
                    className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                      userData.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    onClick={handleNotificationToggle}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        userData.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Security */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  {t("profile.security")}
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{t("profile.twoFactorAuth")}</span>
                    <button
                      className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                        userData.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      onClick={handleTwoFactorToggle}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          userData.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <button
                    className="w-full mt-4 px-4 py-2 flex items-center justify-center space-x-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("profile.logout")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </OwnerDashboardTemplate>
    </main>
  );
} 