"use client";

import React from "react";
import { User, Mail, Edit, UserCheck, UserX, Shield } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

interface MobileUserCardProps {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    isAdmin: boolean;
    isVerifiedOwner: boolean;
    permissions: string[];
    createdAt: string;
    lastLogin?: string;
    isActive: boolean;
  };
  onEdit: (user: any) => void;
  onToggleStatus: (userId: string, isActive: boolean) => void;
  onSendPasswordReset: (userId: string) => void;
}

export function MobileUserCard({ user, onEdit, onToggleStatus, onSendPasswordReset }: MobileUserCardProps) {
  const { t } = useI18n();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      {/* User Info Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user.name || 'No name'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Badges Row */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Role Badge */}
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.isAdmin 
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            : user.role === 'contentEditor' 
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {user.isAdmin ? t("admin.users.adminRole") : user.role === 'contentEditor' ? t("admin.users.contentEditorRole") : t("admin.users.userRole")}
        </span>

        {/* Status Badge */}
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.isActive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {user.isActive ? t("admin.users.status.active") : t("admin.users.status.inactive")}
        </span>

        {/* Owner Badge */}
        {user.isVerifiedOwner && (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            {t("admin.users.ownerBadge")}
          </span>
        )}
      </div>

      {/* Registration Date */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {t("admin.users.tableHeaders.registered")}: {new Date(user.createdAt).toLocaleDateString()}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(user)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-md transition-colors touch-target"
            title={t("admin.users.actions.edit")}
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => onToggleStatus(user.id, !user.isActive)}
            className={`p-2 rounded-md transition-colors touch-target ${
              user.isActive 
                ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20' 
                : 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
            }`}
            title={user.isActive ? t("admin.users.actions.deactivate") : t("admin.users.actions.activate")}
          >
            {user.isActive ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
          </button>
          <button
            onClick={() => onSendPasswordReset(user.id)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-md transition-colors touch-target"
            title={t("admin.users.actions.sendPasswordReset")}
          >
            <Mail className="h-5 w-5" />
          </button>
        </div>
        
        {/* Admin indicator if applicable */}
        {user.isAdmin && (
          <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
        )}
      </div>
    </div>
  );
}