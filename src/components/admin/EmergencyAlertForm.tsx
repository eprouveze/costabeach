"use client";

import React, { useState } from "react";
import { AlertTriangle, Send, Clock, Shield, Zap, CloudRain, Wrench, Megaphone } from "lucide-react";
import { toast } from "react-toastify";
import { whatsappNotificationService } from "@/lib/services/whatsappNotificationService";
import { useI18n } from "@/lib/i18n/client";

type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
type AlertType = 'maintenance' | 'security' | 'weather' | 'utilities' | 'other';

interface EmergencyAlert {
  title: string;
  message: string;
  severity: AlertSeverity;
  alertType: AlertType;
}

export default function EmergencyAlertForm() {
  const { t } = useI18n();
  const [alert, setAlert] = useState<EmergencyAlert>({
    title: '',
    message: '',
    severity: 'medium',
    alertType: 'other'
  });
  const [isSending, setIsSending] = useState(false);

  const severityOptions = [
    { value: 'low', label: t('admin.emergencyAlert.severity.low'), color: 'text-blue-600 bg-blue-100', icon: '💡' },
    { value: 'medium', label: t('admin.emergencyAlert.severity.medium'), color: 'text-yellow-600 bg-yellow-100', icon: '⚠️' },
    { value: 'high', label: t('admin.emergencyAlert.severity.high'), color: 'text-orange-600 bg-orange-100', icon: '🚨' },
    { value: 'critical', label: t('admin.emergencyAlert.severity.critical'), color: 'text-red-600 bg-red-100', icon: '🔴' }
  ];

  const alertTypeOptions = [
    { value: 'maintenance', label: t('admin.emergencyAlert.types.maintenance'), icon: Wrench, description: t('admin.emergencyAlert.types.maintenanceDesc') },
    { value: 'security', label: t('admin.emergencyAlert.types.security'), icon: Shield, description: t('admin.emergencyAlert.types.securityDesc') },
    { value: 'weather', label: t('admin.emergencyAlert.types.weather'), icon: CloudRain, description: t('admin.emergencyAlert.types.weatherDesc') },
    { value: 'utilities', label: t('admin.emergencyAlert.types.utilities'), icon: Zap, description: t('admin.emergencyAlert.types.utilitiesDesc') },
    { value: 'other', label: t('admin.emergencyAlert.types.other'), icon: Megaphone, description: t('admin.emergencyAlert.types.otherDesc') }
  ];

  const handleSendAlert = async () => {
    if (!alert.title.trim()) {
      toast.error(t('toast.admin.alertTitleRequired'));
      return;
    }

    if (!alert.message.trim()) {
      toast.error(t('toast.admin.alertMessageRequired'));
      return;
    }

    setIsSending(true);

    try {
      const success = await whatsappNotificationService.sendEmergencyAlert({
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        alertType: alert.alertType
      });

      if (success) {
        toast.success(t('toast.admin.emergencyAlertSentSuccess'));
        
        // Reset form
        setAlert({
          title: '',
          message: '',
          severity: 'medium',
          alertType: 'other'
        });
      } else {
        toast.error(t('toast.admin.emergencyAlertSendFailed'));
      }
    } catch (error: any) {
      console.error("Failed to send emergency alert:", error);
      toast.error(t('toast.admin.emergencyAlertSendError', { error: error.message }));
    } finally {
      setIsSending(false);
    }
  };

  const getSeverityOption = (severity: AlertSeverity) => {
    return severityOptions.find(option => option.value === severity);
  };

  const getAlertTypeOption = (alertType: AlertType) => {
    return alertTypeOptions.find(option => option.value === alertType);
  };

  const presetAlerts = [
    {
      title: t('admin.emergencyAlert.presets.scheduledMaintenance.title'),
      message: t('admin.emergencyAlert.presets.scheduledMaintenance.message'),
      severity: 'medium' as AlertSeverity,
      alertType: 'maintenance' as AlertType
    },
    {
      title: t('admin.emergencyAlert.presets.powerOutage.title'),
      message: t('admin.emergencyAlert.presets.powerOutage.message'),
      severity: 'high' as AlertSeverity,
      alertType: 'utilities' as AlertType
    },
    {
      title: t('admin.emergencyAlert.presets.securityAlert.title'),
      message: t('admin.emergencyAlert.presets.securityAlert.message'),
      severity: 'high' as AlertSeverity,
      alertType: 'security' as AlertType
    },
    {
      title: t('admin.emergencyAlert.presets.stormWarning.title'),
      message: t('admin.emergencyAlert.presets.stormWarning.message'),
      severity: 'medium' as AlertSeverity,
      alertType: 'weather' as AlertType
    }
  ];

  const loadPresetAlert = (preset: typeof presetAlerts[0]) => {
    setAlert(preset);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">{t('admin.emergencyAlert.title')}</h2>
        </div>

        {/* Preset Alerts */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">{t('admin.emergencyAlert.quickPresets')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {presetAlerts.map((preset, index) => (
              <button
                key={index}
                onClick={() => loadPresetAlert(preset)}
                className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="text-sm font-medium text-gray-900">{preset.title}</div>
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">{preset.message}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Alert Title */}
          <div>
            <label htmlFor="alertTitle" className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.emergencyAlert.alertTitle')}
            </label>
            <input
              type="text"
              id="alertTitle"
              value={alert.title}
              onChange={(e) => setAlert(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('admin.emergencyAlert.alertTitlePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Severity and Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('admin.emergencyAlert.alertSeverity')}
              </label>
              <div className="space-y-2">
                {severityOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="severity"
                      value={option.value}
                      checked={alert.severity === option.value}
                      onChange={(e) => setAlert(prev => ({ ...prev, severity: e.target.value as AlertSeverity }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 flex items-center">
                      <span className="text-sm mr-2">{option.icon}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${option.color}`}>
                        {option.label}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Alert Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('admin.emergencyAlert.alertType')}
              </label>
              <div className="space-y-2">
                {alertTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="alertType"
                        value={option.value}
                        checked={alert.alertType === option.value}
                        onChange={(e) => setAlert(prev => ({ ...prev, alertType: e.target.value as AlertType }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 flex items-center">
                        <Icon className="h-4 w-4 text-gray-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Alert Message */}
          <div>
            <label htmlFor="alertMessage" className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.emergencyAlert.alertMessage')}
            </label>
            <textarea
              id="alertMessage"
              value={alert.message}
              onChange={(e) => setAlert(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              placeholder={t('admin.emergencyAlert.alertMessagePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('admin.emergencyAlert.characterLimit', { count: alert.message.length })}
            </p>
          </div>

          {/* Preview */}
          {alert.title || alert.message ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">{t('admin.emergencyAlert.previewTitle')}</h3>
              <div className="bg-white rounded-lg p-3 border border-gray-200 text-sm">
                <div className="font-semibold">{t('admin.emergencyAlert.communityName')}</div>
                <div className="mt-2">
                  <span className="font-medium">
                    {getSeverityOption(alert.severity)?.icon} {alert.severity.toUpperCase()} ALERT {getSeverityOption(alert.severity)?.icon}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="font-medium">
                    {getAlertTypeOption(alert.alertType)?.icon === Wrench && '🔧'}
                    {getAlertTypeOption(alert.alertType)?.icon === Shield && '🔒'}
                    {getAlertTypeOption(alert.alertType)?.icon === CloudRain && '🌩️'}
                    {getAlertTypeOption(alert.alertType)?.icon === Zap && '⚡'}
                    {getAlertTypeOption(alert.alertType)?.icon === Megaphone && '📢'}
                    {' '}
                    {alert.title || t('admin.emergencyAlert.preview.alertTitle')}
                  </span>
                </div>
                <div className="mt-2 text-gray-700">
                  📢 {alert.message || t('admin.emergencyAlert.preview.alertMessage')}
                </div>
                <div className="mt-2 text-gray-600 text-xs">
                  {t('admin.emergencyAlert.preview.actionMessage')}
                </div>
                <div className="mt-2 text-gray-500 text-xs italic">
                  {t('admin.emergencyAlert.preview.signature')}
                </div>
              </div>
            </div>
          ) : null}

          {/* Send Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSendAlert}
              disabled={isSending || !alert.title.trim() || !alert.message.trim()}
              className={`inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isSending || !alert.title.trim() || !alert.message.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : alert.severity === 'critical' 
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : alert.severity === 'high'
                      ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('admin.emergencyAlert.sendingAlert')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t('admin.emergencyAlert.sendEmergencyAlert')}
                </>
              )}
            </button>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium">{t('admin.emergencyAlert.warningTitle')}</p>
                <p className="text-yellow-700 mt-1">
                  {t('admin.emergencyAlert.warningMessage')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}