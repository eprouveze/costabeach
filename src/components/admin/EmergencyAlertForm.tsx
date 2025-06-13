"use client";

import React, { useState } from "react";
import { AlertTriangle, Send, Clock, Shield, Zap, CloudRain, Wrench, Megaphone } from "lucide-react";
import { toast } from "react-toastify";
import { whatsappNotificationService } from "@/lib/services/whatsappNotificationService";

type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
type AlertType = 'maintenance' | 'security' | 'weather' | 'utilities' | 'other';

interface EmergencyAlert {
  title: string;
  message: string;
  severity: AlertSeverity;
  alertType: AlertType;
}

export default function EmergencyAlertForm() {
  const [alert, setAlert] = useState<EmergencyAlert>({
    title: '',
    message: '',
    severity: 'medium',
    alertType: 'other'
  });
  const [isSending, setIsSending] = useState(false);

  const severityOptions = [
    { value: 'low', label: 'Low Priority', color: 'text-blue-600 bg-blue-100', icon: '💡' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600 bg-yellow-100', icon: '⚠️' },
    { value: 'high', label: 'High Priority', color: 'text-orange-600 bg-orange-100', icon: '🚨' },
    { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-100', icon: '🔴' }
  ];

  const alertTypeOptions = [
    { value: 'maintenance', label: 'Maintenance', icon: Wrench, description: 'Building maintenance and repairs' },
    { value: 'security', label: 'Security', icon: Shield, description: 'Security-related issues' },
    { value: 'weather', label: 'Weather', icon: CloudRain, description: 'Weather warnings and alerts' },
    { value: 'utilities', label: 'Utilities', icon: Zap, description: 'Power, water, or internet issues' },
    { value: 'other', label: 'General Alert', icon: Megaphone, description: 'General community alerts' }
  ];

  const handleSendAlert = async () => {
    if (!alert.title.trim()) {
      toast.error("Please enter an alert title");
      return;
    }

    if (!alert.message.trim()) {
      toast.error("Please enter an alert message");
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
        toast.success("Emergency alert sent successfully!");
        
        // Reset form
        setAlert({
          title: '',
          message: '',
          severity: 'medium',
          alertType: 'other'
        });
      } else {
        toast.error("Failed to send emergency alert. Please try again.");
      }
    } catch (error: any) {
      console.error("Failed to send emergency alert:", error);
      toast.error(`Failed to send alert: ${error.message}`);
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
      title: "Scheduled Maintenance",
      message: "Scheduled maintenance will be performed tomorrow from 9:00 AM to 12:00 PM. Water service may be temporarily interrupted.",
      severity: 'medium' as AlertSeverity,
      alertType: 'maintenance' as AlertType
    },
    {
      title: "Power Outage",
      message: "Power outage in the building. Estimated restoration time: 2 hours. Emergency lighting is active.",
      severity: 'high' as AlertSeverity,
      alertType: 'utilities' as AlertType
    },
    {
      title: "Security Alert",
      message: "Please ensure all doors and windows are locked. Report any suspicious activity to building management immediately.",
      severity: 'high' as AlertSeverity,
      alertType: 'security' as AlertType
    },
    {
      title: "Storm Warning",
      message: "Severe weather expected tonight. Please secure any outdoor items and avoid the balcony areas.",
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
          <h2 className="text-2xl font-bold text-gray-900">Send Emergency Alert</h2>
        </div>

        {/* Preset Alerts */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Presets</h3>
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
              Alert Title *
            </label>
            <input
              type="text"
              id="alertTitle"
              value={alert.title}
              onChange={(e) => setAlert(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter alert title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Severity and Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Alert Severity *
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
                Alert Type *
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
              Alert Message *
            </label>
            <textarea
              id="alertMessage"
              value={alert.message}
              onChange={(e) => setAlert(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              placeholder="Enter detailed alert message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              {alert.message.length}/500 characters • Be clear and provide actionable information
            </p>
          </div>

          {/* Preview */}
          {alert.title || alert.message ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">WhatsApp Message Preview</h3>
              <div className="bg-white rounded-lg p-3 border border-gray-200 text-sm">
                <div className="font-semibold">🏖️ Costa Beach Community</div>
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
                    {alert.title || '[Alert Title]'}
                  </span>
                </div>
                <div className="mt-2 text-gray-700">
                  📢 {alert.message || '[Alert Message]'}
                </div>
                <div className="mt-2 text-gray-600 text-xs">
                  ⚠️ Please take appropriate action and stay safe.
                </div>
                <div className="mt-2 text-gray-500 text-xs italic">
                  Emergency alert sent by Costa Beach Community Platform
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
                  Sending Alert...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Emergency Alert
                </>
              )}
            </button>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium">Important:</p>
                <p className="text-yellow-700 mt-1">
                  Emergency alerts will be sent to all residents via WhatsApp. Use this feature responsibly 
                  and only for genuine emergencies or important community notifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}