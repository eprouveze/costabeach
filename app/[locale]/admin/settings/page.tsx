"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { checkPermission } from "@/lib/utils/permissions";
import { Permission } from "@/lib/types";
import { toast } from "react-toastify";
import { Header } from "@/components/organisms/Header";
import { 
  Settings, 
  Save, 
  Globe, 
  Mail, 
  Shield, 
  Database, 
  MessageSquare,
  Bell,
  Users,
  FileText,
  Eye,
  EyeOff
} from "lucide-react";

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotificationsEnabled: boolean;
  whatsappNotificationsEnabled: boolean;
  maxFileUploadSizeMB: number;
  documentRetentionDays: number;
  sessionTimeoutMinutes: number;
  defaultLanguage: 'fr' | 'en' | 'ar';
  allowedLanguages: string[];
  requireEmailVerification: boolean;
  allowGuestAccess: boolean;
  moderateComments: boolean;
  enableAuditLogs: boolean;
}

export default function AdminSettingsPage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "Costa Beach 3",
    siteDescription: "Premier beachfront community portal",
    contactEmail: "admin@costabeach3.com",
    supportPhone: "+212 522 123 456",
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotificationsEnabled: true,
    whatsappNotificationsEnabled: true,
    maxFileUploadSizeMB: 10,
    documentRetentionDays: 365,
    sessionTimeoutMinutes: 60,
    defaultLanguage: 'fr',
    allowedLanguages: ['fr', 'en', 'ar'],
    requireEmailVerification: true,
    allowGuestAccess: false,
    moderateComments: true,
    enableAuditLogs: true
  });

  // Check permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}/permissions`);
          if (response.ok) {
            const userData = await response.json();
            setUserPermissions(userData.permissions || []);
          }
        } catch (error) {
          console.error("Error fetching permissions:", error);
        }
      }
    };

    if (status === 'authenticated') {
      fetchPermissions();
    }
  }, [session, status]);

  const canManageSettings = 
  checkPermission(userPermissions, Permission.MANAGE_SETTINGS) ||
    (session?.user as any)?.isAdmin === true;

  // Redirect if no permissions
  useEffect(() => {
    if (status === 'authenticated' && !canManageSettings && userPermissions.length > 0) {
      toast.error(t("common.accessDenied"));
      router.push('/admin');
    }
  }, [canManageSettings, userPermissions, status, router]);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!canManageSettings) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error(t("admin.settings.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [canManageSettings]);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success(t("admin.settings.saveSuccess"));
      } else {
        toast.error(t("admin.settings.saveError"));
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(t("admin.settings.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLanguageToggle = (lang: string) => {
    const currentLanguages = settings.allowedLanguages;
    if (currentLanguages.includes(lang)) {
      if (currentLanguages.length > 1) {
        setSettings(prev => ({
          ...prev,
          allowedLanguages: currentLanguages.filter(l => l !== lang)
        }));
      } else {
        toast.error(t("admin.settings.atLeastOneLanguage"));
      }
    } else {
      setSettings(prev => ({
        ...prev,
        allowedLanguages: [...currentLanguages, lang]
      }));
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("admin.settings.loading")}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!canManageSettings) {
    return null;
  }

  const tabs = [
    { id: 'general', label: t("admin.settings.tabs.general"), icon: Settings },
    { id: 'users', label: t("admin.settings.tabs.users"), icon: Users },
    { id: 'documents', label: t("admin.settings.tabs.documents"), icon: FileText },
    { id: 'notifications', label: t("admin.settings.tabs.notifications"), icon: Bell },
    { id: 'security', label: t("admin.settings.tabs.security"), icon: Shield },
    { id: 'system', label: t("admin.settings.tabs.system"), icon: Database }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("admin.settings")}</h1>
          <p className="text-gray-600">{t("admin.systemSettings")}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t("admin.settings.siteInformation")}</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t("admin.settings.siteName")}</label>
                      <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) => handleInputChange('siteName', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t("admin.settings.contactEmail")}</label>
                      <input
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">{t("admin.settings.siteDescription")}</label>
                    <textarea
                      value={settings.siteDescription}
                      onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">{t("admin.settings.supportPhone")}</label>
                    <input
                      type="tel"
                      value={settings.supportPhone}
                      onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t("admin.settings.languageSettings")}</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("admin.settings.defaultLanguage")}</label>
                    <select
                      value={settings.defaultLanguage}
                      onChange={(e) => handleInputChange('defaultLanguage', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="fr">{t("languages.french")}</option>
                      <option value="en">{t("languages.english")}</option>
                      <option value="ar">{t("languages.arabic")}</option>
                    </select>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("admin.settings.enabledLanguages")}</label>
                    <div className="space-y-2">
                      {[
                        { code: 'fr', name: t("languages.french") },
                        { code: 'en', name: t("languages.english") },
                        { code: 'ar', name: t("languages.arabic") }
                      ].map((lang) => (
                        <label key={lang.code} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.allowedLanguages.includes(lang.code)}
                            onChange={() => handleLanguageToggle(lang.code)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{lang.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t("admin.settings.userRegistration")}</h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.registrationEnabled}
                        onChange={(e) => handleInputChange('registrationEnabled', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{t("admin.settings.enableRegistration")}</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.requireEmailVerification}
                        onChange={(e) => handleInputChange('requireEmailVerification', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{t("admin.settings.requireEmailVerification")}</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.allowGuestAccess}
                        onChange={(e) => handleInputChange('allowGuestAccess', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{t("admin.settings.allowGuestAccess")}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t("admin.settings.sessionManagement")}</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t("admin.settings.sessionTimeout")}</label>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={settings.sessionTimeoutMinutes}
                      onChange={(e) => handleInputChange('sessionTimeoutMinutes', parseInt(e.target.value))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">{t("admin.settings.sessionTimeoutDescription")}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t("admin.settings.fileUploadSettings")}</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t("admin.settings.maxFileSize")}</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.maxFileUploadSizeMB}
                      onChange={(e) => handleInputChange('maxFileUploadSizeMB', parseInt(e.target.value))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t("admin.settings.documentRetention")}</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t("admin.settings.retentionPeriod")}</label>
                    <input
                      type="number"
                      min="30"
                      max="3650"
                      value={settings.documentRetentionDays}
                      onChange={(e) => handleInputChange('documentRetentionDays', parseInt(e.target.value))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">{t("admin.settings.retentionDescription")}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t("admin.settings.contentModeration")}</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.moderateComments}
                      onChange={(e) => handleInputChange('moderateComments', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t("admin.settings.moderateComments")}</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t("admin.settings.emailNotifications")}</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.emailNotificationsEnabled}
                      onChange={(e) => handleInputChange('emailNotificationsEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t("admin.settings.enableEmailNotifications")}</span>
                  </label>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t("admin.settings.whatsappNotifications")}</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.whatsappNotificationsEnabled}
                      onChange={(e) => handleInputChange('whatsappNotificationsEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t("admin.settings.enableWhatsappNotifications")}</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t("admin.settings.auditLogging")}</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.enableAuditLogs}
                      onChange={(e) => handleInputChange('enableAuditLogs', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t("admin.settings.enableAuditLogging")}</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t("admin.settings.maintenanceMode")}</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t("admin.settings.enableMaintenanceMode")}</span>
                  </label>
                  <p className="mt-1 text-sm text-gray-500">{t("admin.settings.maintenanceModeDescription")}</p>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? t("common.saving") : t("admin.settings.saveSettings")}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}