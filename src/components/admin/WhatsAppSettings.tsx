"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Phone, 
  Key, 
  Globe, 
  Bell, 
  Users, 
  MessageSquare, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "react-toastify";
import { useI18n } from "@/lib/i18n/client";
import { getWhatsAppClient } from "@/lib/whatsapp/client";

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  webhookSecret: string;
  businessAccountId: string;
  isConfigured: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'testing';
}

interface NotificationSettings {
  documentUploads: boolean;
  pollCreation: boolean;
  emergencyAlerts: boolean;
  communityUpdates: boolean;
  autoResponses: boolean;
}

interface Template {
  id: string;
  name: string;
  language: string;
  status: 'approved' | 'pending' | 'rejected';
  category: string;
}

export default function WhatsAppSettings() {
  const { t } = useI18n();
  const [config, setConfig] = useState<WhatsAppConfig>({
    phoneNumberId: '',
    accessToken: '',
    webhookSecret: '',
    businessAccountId: '',
    isConfigured: false,
    connectionStatus: 'disconnected'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    documentUploads: true,
    pollCreation: true,
    emergencyAlerts: true,
    communityUpdates: false,
    autoResponses: false
  });

  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTokens, setShowTokens] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfiguration();
    loadTemplates();
  }, []);

  const loadConfiguration = () => {
    // Load from environment variables or API
    const loadedConfig: WhatsAppConfig = {
      phoneNumberId: process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID || '',
      accessToken: process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN || '',
      webhookSecret: process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_SECRET || '',
      businessAccountId: process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      isConfigured: !!(process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID && process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN),
      connectionStatus: 'disconnected'
    };
    
    setConfig(loadedConfig);
  };

  const loadTemplates = async () => {
    // Mock templates for development
    const mockTemplates: Template[] = [
      {
        id: '1',
        name: 'welcome_message',
        language: 'en',
        status: 'approved',
        category: 'UTILITY'
      },
      {
        id: '2',
        name: 'document_notification',
        language: 'en',
        status: 'approved',
        category: 'UTILITY'
      },
      {
        id: '3',
        name: 'emergency_alert',
        language: 'en',
        status: 'pending',
        category: 'UTILITY'
      }
    ];
    
    setTemplates(mockTemplates);
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConfig(prev => ({ ...prev, connectionStatus: 'testing' }));
    
    try {
      const whatsappClient = getWhatsAppClient();
      await whatsappClient.initialize();
      
      setConfig(prev => ({ ...prev, connectionStatus: 'connected' }));
      toast.success(t('toast.whatsapp.connectionSuccessful'));
    } catch (error: any) {
      setConfig(prev => ({ ...prev, connectionStatus: 'disconnected' }));
      toast.error(t('toast.whatsapp.connectionFailed', { error: error.message }));
    } finally {
      setIsTestingConnection(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Save configuration to API or environment
      // This would typically involve calling an API endpoint
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success(t('toast.whatsapp.settingsSaveSuccess'));
    } catch (error: any) {
      toast.error(t('toast.whatsapp.settingsSaveError', { error: error.message }));
    } finally {
      setIsSaving(false);
    }
  };

  const getConnectionStatusIcon = () => {
    switch (config.connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'testing':
        return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'disconnected':
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (config.connectionStatus) {
      case 'connected': return 'Connected';
      case 'testing': return 'Testing...';
      case 'disconnected': return 'Disconnected';
    }
  };

  const getStatusColor = () => {
    switch (config.connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'testing': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold text-gray-900">WhatsApp Settings</h2>

        {/* Connection Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Connection Status</h3>
            <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
              {getConnectionStatusIcon()}
              <span className="font-medium">{getStatusText()}</span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={testConnection}
              disabled={isTestingConnection}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isTestingConnection ? 'animate-spin' : ''}`} />
              Test Connection
            </button>
          </div>
        </div>

        {/* API Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">API Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone Number ID
              </label>
              <input
                type="text"
                value={config.phoneNumberId}
                onChange={(e) => setConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                placeholder="123456789012345"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Key className="inline h-4 w-4 mr-1" />
                Access Token
              </label>
              <div className="relative">
                <input
                  type={showTokens ? "text" : "password"}
                  value={config.accessToken}
                  onChange={(e) => setConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                  placeholder="EAAxxxxxxxxxxxx"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowTokens(!showTokens)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showTokens ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="inline h-4 w-4 mr-1" />
                Business Account ID
              </label>
              <input
                type="text"
                value={config.businessAccountId}
                onChange={(e) => setConfig(prev => ({ ...prev, businessAccountId: e.target.value }))}
                placeholder="123456789012345"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Key className="inline h-4 w-4 mr-1" />
                Webhook Secret
              </label>
              <input
                type={showTokens ? "text" : "password"}
                value={config.webhookSecret}
                onChange={(e) => setConfig(prev => ({ ...prev, webhookSecret: e.target.value }))}
                placeholder="your_webhook_secret"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            <Bell className="inline h-5 w-5 mr-2" />
            Notification Settings
          </h3>
          
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {key === 'documentUploads' && 'Send WhatsApp notifications when new documents are uploaded'}
                    {key === 'pollCreation' && 'Notify community members about new polls'}
                    {key === 'emergencyAlerts' && 'Send urgent notifications for emergency situations'}
                    {key === 'communityUpdates' && 'Regular community updates and announcements'}
                    {key === 'autoResponses' && 'Automatic responses to incoming messages'}
                  </p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">Enable</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Message Templates */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            <MessageSquare className="inline h-5 w-5 mr-2" />
            Message Templates
          </h3>
          
          {templates.length > 0 ? (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Language
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {templates.map((template) => (
                    <tr key={template.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {template.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {template.language.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          template.status === 'approved' ? 'text-green-800 bg-green-100' :
                          template.status === 'pending' ? 'text-yellow-800 bg-yellow-100' :
                          'text-red-800 bg-red-100'
                        }`}>
                          {template.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {template.category}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No message templates found</p>
              <p className="text-sm">Templates need to be created in Meta Business Manager</p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className={`inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSaving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}