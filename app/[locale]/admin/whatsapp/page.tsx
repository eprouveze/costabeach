"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { MessageSquare, Send, Users, BarChart3, Settings, History } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { checkPermission } from "@/lib/utils/permissions";
import { Permission } from "@/lib/types";
import { getWhatsAppClient } from "@/lib/whatsapp/client";
import { Header } from "@/components/organisms/Header";

// Components for different tabs
import WhatsAppMessageComposer from "@/components/admin/WhatsAppMessageComposer";
import WhatsAppBroadcast from "@/components/admin/WhatsAppBroadcast";
import WhatsAppHistory from "@/components/admin/WhatsAppHistory";
import WhatsAppStats from "@/components/admin/WhatsAppStats";
import WhatsAppSettings from "@/components/admin/WhatsAppSettings";

type TabType = 'compose' | 'broadcast' | 'history' | 'stats' | 'settings';

export default function AdminWhatsAppPage() {
  const { t } = useI18n();
  const session = useSession();
  const router = useRouter();
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('compose');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        // Check if session is still loading
        if (session.status === 'loading') {
          return;
        }

        // Check if user is authenticated
        if (session.status === 'unauthenticated' || !session.data?.user?.id) {
          toast.error(t("auth.loginRequired"));
          router.push("/owner-login");
          return;
        }

        // Fetch user permissions from API
        const response = await fetch(`/api/users/${session.data.user.id}/permissions`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Permission fetch failed:', response.status, errorText);
          throw new Error(`Failed to fetch user permissions: ${response.status}`);
        }
        
        const userData = await response.json();
        setUserPermissions(userData.permissions || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        toast.error(t("admin.errors.permissionsFetchFailed"));
        setIsLoading(false);
        // Don't redirect on error, just show the error state
      }
    };

    fetchPermissions();
  }, [session, router]);

  useEffect(() => {
    // Check WhatsApp connection status
    const checkConnection = async () => {
      try {
        setConnectionStatus('connecting');
        const whatsappClient = getWhatsAppClient();
        await whatsappClient.initialize();
        setConnectionStatus('connected');
      } catch (error) {
        console.error("WhatsApp connection failed:", error);
        setConnectionStatus('disconnected');
        if (error instanceof Error && error.message.includes('Missing required WhatsApp credentials')) {
          toast.warning(t("admin.whatsapp.credentialsNotConfigured"));
        } else {
          toast.error(t("admin.whatsapp.connectionFailed"));
        }
      }
    };

    if (!isLoading) {
      checkConnection();
    }
  }, [isLoading]);
  
  // Allow access for admins, Comité de Suivi members, or users with document management permissions
  const canManageWhatsApp = 
  userPermissions.includes(Permission.MANAGE_WHATSAPP) ||
  userPermissions.includes(Permission.MANAGE_COMITE_DOCUMENTS) ||
    (session.data?.user?.isAdmin === true);
  
  if (isLoading || session.status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (session.status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please log in to access WhatsApp management.</p>
          <button
            onClick={() => router.push('/owner-login')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!canManageWhatsApp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access WhatsApp management.</p>
          <button
            onClick={() => router.push('/admin')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  const tabs = [
    { 
      id: 'compose' as TabType, 
      label: t('admin.whatsappManagement.tabs.compose.label'), 
      icon: Send,
      description: t('admin.whatsappManagement.tabs.compose.description')
    },
    { 
      id: 'broadcast' as TabType, 
      label: t('admin.whatsappManagement.tabs.broadcast.label'), 
      icon: Users,
      description: t('admin.whatsappManagement.tabs.broadcast.description')
    },
    { 
      id: 'history' as TabType, 
      label: t('admin.whatsappManagement.tabs.history.label'), 
      icon: History,
      description: t('admin.whatsappManagement.tabs.history.description')
    },
    { 
      id: 'stats' as TabType, 
      label: t('admin.whatsappManagement.tabs.stats.label'), 
      icon: BarChart3,
      description: t('admin.whatsappManagement.tabs.stats.description')
    },
    { 
      id: 'settings' as TabType, 
      label: t('admin.whatsappManagement.tabs.settings.label'), 
      icon: Settings,
      description: t('admin.whatsappManagement.tabs.settings.description')
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'compose':
        return <WhatsAppMessageComposer />;
      case 'broadcast':
        return <WhatsAppBroadcast />;
      case 'history':
        return <WhatsAppHistory />;
      case 'stats':
        return <WhatsAppStats />;
      case 'settings':
        return <WhatsAppSettings />;
      default:
        return <WhatsAppMessageComposer />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('admin.whatsappManagement.title')}
              </h1>
              <p className="text-gray-600">
                {t('admin.whatsappManagement.description')}
              </p>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-600">
                {connectionStatus === 'connected' ? t('admin.whatsappManagement.connectionStatus.connected') : 
                 connectionStatus === 'connecting' ? t('admin.whatsappManagement.connectionStatus.connecting') : t('admin.whatsappManagement.connectionStatus.disconnected')}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`mr-2 h-5 w-5 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}