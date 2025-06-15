"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";
import { useSession } from "next-auth/react";
import { User, Mail, Calendar, Shield, Edit, Save, X } from "lucide-react";
import { toast } from "react-toastify";

export function ProfileContent() {
  const { t } = useI18n();
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
      });
    }
  }, [session]);

  const handleSave = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update the session
      await update({
        ...session,
        user: {
          ...session.user,
          name: formData.name,
        },
      });

      toast.success(t("profile.updateSuccess") || "Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("profile.updateError") || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
    });
    setIsEditing(false);
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
          {t("profile.title") || "Profile"}
        </h1>
        <p className="text-gray-600">
          {t("profile.description") || "Manage your personal information and account settings"}
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {session.user.name || t("profile.noName") || "No name set"}
              </h2>
              <p className="text-gray-600">{session.user.email}</p>
            </div>
          </div>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              {t("profile.edit") || "Edit Profile"}
            </button>
          )}
        </div>

        {/* Profile Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("profile.name") || "Name"}
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("profile.namePlaceholder") || "Enter your name"}
              />
            ) : (
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-md">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">
                  {session.user.name || t("profile.noName") || "No name set"}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("profile.email") || "Email"}
            </label>
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-md">
              <Mail className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900">{session.user.email}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t("profile.emailNote") || "Email cannot be changed. Contact support if needed."}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("profile.role") || "Role"}
            </label>
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-md">
              <Shield className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900">
                {(session.user as any)?.isAdmin 
                  ? (t("profile.admin") || "Administrator")
                  : (t("profile.owner") || "Property Owner")
                }
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("profile.memberSince") || "Member Since"}
            </label>
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-md">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900">
                {t("profile.notAvailable") || "Non disponible"} {/* Placeholder until we have actual join date */}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {loading ? (t("profile.saving") || "Saving...") : (t("profile.save") || "Save Changes")}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4" />
              {t("profile.cancel") || "Cancel"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}