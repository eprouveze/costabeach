"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { checkPermission } from "@/lib/utils/permissions";
import { Permission } from "@/lib/types";
import { toast } from "react-toastify";
import { Header } from "@/components/organisms/Header";
import { Users, Search, Filter, Edit, MoreHorizontal, UserCheck, UserX, Shield, Mail } from "lucide-react";
import { MobileUserCard } from "@/components/admin/MobileUserCard";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isAdmin: boolean;
  isVerifiedOwner: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  buildingNumber: string;
  apartmentNumber: string;
  phoneNumber: string;
  preferredLanguage: string;
  isVerified: boolean;
  lastLogin?: string;
  isActive: boolean;
}

export default function AdminUsersPage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);

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

const canManageUsers = 
  checkPermission(userPermissions, Permission.MANAGE_USERS) ||
   checkPermission(userPermissions, Permission.MANAGE_DOCUMENTS) ||
    checkPermission(userPermissions, Permission.MANAGE_COMITE_DOCUMENTS) ||
    (session?.user as any)?.isAdmin === true;

  // Redirect if no permissions
  useEffect(() => {
    if (status === 'authenticated' && !canManageUsers && userPermissions.length > 0) {
      toast.error(t("common.accessDenied"));
      router.push('/admin');
    }
  }, [canManageUsers, userPermissions, status, router]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!canManageUsers) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        } else {
          toast.error(t("admin.users.errors.fetchFailed"));
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error(t("admin.users.errors.loadingError"));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [canManageUsers]);

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
const matchesSearch =
  (user.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  (user.email ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "" || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const handleEditUser = (user: User) => {
    setSelectedUser({
      ...user,
      permissions: user.permissions || []
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    // Prevent self-modification of security-related fields only
    if (userId === session?.user?.id && ('isAdmin' in updates || 'role' in updates || 'permissions' in updates)) {
      toast.error(t("admin.users.errors.cannotModifySecurityFields"));
      return;
    }

    // Only admins can modify admin status
    if (('isAdmin' in updates || (updates.role === 'admin')) && !(session?.user as any)?.isAdmin) {
      toast.error(t("admin.users.errors.onlyAdminsCanManageAdmin"));
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(user => 
          user.id === userId ? { ...user, ...updatedUser } : user
        ));
        toast.success(t("admin.users.messages.userUpdated"));
        setShowEditModal(false);
      } else {
        try {
          const errorData = await response.json();
          toast.error(errorData.message || t("admin.users.errors.updateFailed"));
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          toast.error(t("admin.users.errors.updateFailed"));
        }
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(t("admin.users.errors.updateError"));
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    await handleUpdateUser(userId, { isActive });
  };

  const handleSendPasswordReset = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success(t("admin.users.messages.passwordResetSent"));
      } else {
        toast.error(t("admin.users.errors.passwordResetFailed"));
      }
    } catch (error) {
      console.error("Error sending password reset:", error);
      toast.error(t("admin.users.errors.passwordResetError"));
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{t("common.loading")}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!canManageUsers) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("admin.users")}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t("admin.userManagement")}</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("admin.users.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t("admin.users.allRoles")}</option>
                <option value="admin">{t("admin.users.adminRole")}</option>
                <option value="contentEditor">{t("admin.users.contentEditorRole")}</option>
                <option value="user">{t("admin.users.userRole")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile User Cards */}
        <div className="block md:hidden">
          {filteredUsers.map((user) => (
            <MobileUserCard
              key={user.id}
              user={user}
              onEdit={handleEditUser}
              onToggleStatus={handleToggleUserStatus}
              onSendPasswordReset={handleSendPasswordReset}
            />
          ))}
          
          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{t("admin.users.noUsersFound")}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || filterRole ? t("admin.users.adjustFilters") : t("admin.users.noUsersRegistered")}
              </p>
            </div>
          )}
        </div>

        {/* Desktop Users Table */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t("admin.users.tableHeaders.user")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t("admin.users.tableHeaders.role")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t("admin.users.tableHeaders.status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t("admin.users.tableHeaders.contact")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t("admin.users.tableHeaders.registered")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t("admin.users.tableHeaders.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name || 'No name'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isAdmin 
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'contentEditor' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isAdmin ? t("admin.users.adminRole") : user.role === 'contentEditor' ? t("admin.users.contentEditorRole") : t("admin.users.userRole")}
                      </span>
                      {user.isVerifiedOwner && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {t("admin.users.ownerBadge")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? t("admin.users.status.active") : t("admin.users.status.inactive")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.buildingNumber && user.apartmentNumber && (
                          <div>{t("admin.users.fields.apartment")}: {user.buildingNumber}-{user.apartmentNumber}</div>
                        )}
                        {user.phoneNumber && (
                          <div className="text-gray-500 dark:text-gray-400">{user.phoneNumber}</div>
                        )}
                        {!user.buildingNumber && !user.apartmentNumber && !user.phoneNumber && (
                          <span className="text-gray-400 text-xs">{t("admin.users.noContactInfo")}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title={t("admin.users.actions.edit")}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user.id, !user.isActive)}
                          className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          title={user.isActive ? t("admin.users.actions.deactivate") : t("admin.users.actions.activate")}
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleSendPasswordReset(user.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title={t("admin.users.actions.sendPasswordReset")}
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{t("admin.users.noUsersFound")}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || filterRole ? t("admin.users.adjustFilters") : t("admin.users.noUsersRegistered")}
              </p>
            </div>
          )}
        </div>

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative md:top-10 mx-auto md:p-5 border w-full md:max-w-2xl shadow-lg md:rounded-md bg-white dark:bg-gray-800 h-full md:h-auto md:max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t("admin.users.editUser")}: {selectedUser.name || selectedUser.email}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.users.fields.role")}</label>
                    <select
                      value={selectedUser.isAdmin ? 'admin' : selectedUser.role}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow admin role changes if current user is admin
                        if (value === 'admin' && !(session?.user as any)?.isAdmin) {
                          toast.error(t("admin.users.errors.onlyAdminsCanGrantAdmin"));
                          return;
                        }
                        setSelectedUser({
                          ...selectedUser,
                          isAdmin: value === 'admin',
                          role: value === 'admin' ? 'admin' : value
                        });
                      }}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="user">{t("admin.users.userRole")}</option>
                      <option value="contentEditor">{t("admin.users.contentEditorRole")}</option>
                      {(session?.user as any)?.isAdmin && (
                        <option value="admin">{t("admin.users.adminRole")}</option>
                      )}
                    </select>
                    {!(session?.user as any)?.isAdmin && (
                      <p className="mt-1 text-xs text-gray-500">
                        {t("admin.users.adminOnlyRoles")}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center py-2">
                    <input
                      type="checkbox"
                      id="isVerifiedOwner"
                      checked={selectedUser.isVerifiedOwner || false}
                      onChange={(e) => setSelectedUser({
                        ...selectedUser,
                        isVerifiedOwner: e.target.checked
                      })}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isVerifiedOwner" className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      {t("admin.users.fields.verifiedOwner")}
                    </label>
                  </div>

                  <div className="flex items-center py-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={selectedUser.isActive !== undefined ? selectedUser.isActive : true}
                      onChange={(e) => setSelectedUser({
                        ...selectedUser,
                        isActive: e.target.checked
                      })}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      {t("admin.users.fields.activeAccount")}
                    </label>
                  </div>

                  {/* Contact Information */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{t("admin.users.contactInfo")}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.users.fields.buildingNumber")}</label>
                        <input
                          type="text"
                          value={selectedUser.buildingNumber || ''}
                          onChange={(e) => setSelectedUser({
                            ...selectedUser,
                            buildingNumber: e.target.value
                          })}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder={t("admin.users.placeholders.buildingNumber")}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.users.fields.apartmentNumber")}</label>
                        <input
                          type="text"
                          value={selectedUser.apartmentNumber || ''}
                          onChange={(e) => setSelectedUser({
                            ...selectedUser,
                            apartmentNumber: e.target.value
                          })}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder={t("admin.users.placeholders.apartmentNumber")}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.users.fields.phoneNumber")}</label>
                        <input
                          type="tel"
                          value={selectedUser.phoneNumber || ''}
                          onChange={(e) => setSelectedUser({
                            ...selectedUser,
                            phoneNumber: e.target.value
                          })}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder={t("admin.users.placeholders.phoneNumber")}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.users.fields.preferredLanguage")}</label>
                        <select
                          value={selectedUser.preferredLanguage || 'french'}
                          onChange={(e) => setSelectedUser({
                            ...selectedUser,
                            preferredLanguage: e.target.value
                          })}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="french">{t("admin.users.languages.french")}</option>
                          <option value="arabic">{t("admin.users.languages.arabic")}</option>
                          <option value="english">{t("admin.users.languages.english")}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Permissions Section */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{t("admin.users.permissions.title")}</h4>
                    {selectedUser.isAdmin ? (
                      <p className="text-sm text-gray-500 py-4">
                        {t("admin.users.permissions.adminHasAll")}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* User Management */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">{t("admin.users.permissions.userManagement")}</h5>
                          <div className="space-y-3">
                            {[Permission.MANAGE_USERS, Permission.VIEW_USERS, Permission.APPROVE_REGISTRATIONS].map((permission) => (
                              <div key={permission} className="flex items-center py-1">
                                <input
                                  type="checkbox"
                                  id={permission}
                                  checked={selectedUser.permissions?.includes(permission) || false}
                                  onChange={(e) => {
                                    const updatedPermissions = e.target.checked
                                      ? [...selectedUser.permissions, permission]
                                      : selectedUser.permissions.filter(p => p !== permission);
                                    setSelectedUser({
                                      ...selectedUser,
                                      permissions: updatedPermissions
                                    });
                                  }}
                                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor={permission} className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                  {permission === Permission.MANAGE_USERS && t("admin.users.permissions.manageUsers")}
                                  {permission === Permission.VIEW_USERS && t("admin.users.permissions.viewUsers")}
                                  {permission === Permission.APPROVE_REGISTRATIONS && t("admin.users.permissions.approveRegistrations")}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Document Management */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">{t("admin.users.permissions.documentManagement")}</h5>
                          <div className="space-y-3">
                            {[Permission.MANAGE_DOCUMENTS, Permission.VIEW_DOCUMENTS, Permission.MANAGE_COMITE_DOCUMENTS, Permission.MANAGE_SOCIETE_DOCUMENTS, Permission.MANAGE_LEGAL_DOCUMENTS, Permission.MANAGE_FINANCE_DOCUMENTS, Permission.MANAGE_GENERAL_DOCUMENTS].map((permission) => (
                              <div key={permission} className="flex items-center py-1">
                                <input
                                  type="checkbox"
                                  id={permission}
                                  checked={selectedUser.permissions?.includes(permission) || false}
                                  onChange={(e) => {
                                    const updatedPermissions = e.target.checked
                                      ? [...selectedUser.permissions, permission]
                                      : selectedUser.permissions.filter(p => p !== permission);
                                    setSelectedUser({
                                      ...selectedUser,
                                      permissions: updatedPermissions
                                    });
                                  }}
                                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor={permission} className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                  {permission === Permission.MANAGE_DOCUMENTS && t("admin.users.permissions.allDocuments")}
                                  {permission === Permission.VIEW_DOCUMENTS && t("admin.users.permissions.viewDocuments")}
                                  {permission === Permission.MANAGE_COMITE_DOCUMENTS && t("admin.users.permissions.comiteDocuments")}
                                  {permission === Permission.MANAGE_SOCIETE_DOCUMENTS && t("admin.users.permissions.societeDocuments")}
                                  {permission === Permission.MANAGE_LEGAL_DOCUMENTS && t("admin.users.permissions.legalDocuments")}
                                  {permission === Permission.MANAGE_FINANCE_DOCUMENTS && t("admin.users.permissions.financeDocuments")}
                                  {permission === Permission.MANAGE_GENERAL_DOCUMENTS && t("admin.users.permissions.generalDocuments")}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* System Administration */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">{t("admin.users.permissions.systemAdministration")}</h5>
                          <div className="space-y-3">
                            {[Permission.MANAGE_SETTINGS, Permission.VIEW_AUDIT_LOGS, Permission.MANAGE_NOTIFICATIONS].map((permission) => (
                              <div key={permission} className="flex items-center py-1">
                                <input
                                  type="checkbox"
                                  id={permission}
                                  checked={selectedUser.permissions?.includes(permission) || false}
                                  onChange={(e) => {
                                    const updatedPermissions = e.target.checked
                                      ? [...selectedUser.permissions, permission]
                                      : selectedUser.permissions.filter(p => p !== permission);
                                    setSelectedUser({
                                      ...selectedUser,
                                      permissions: updatedPermissions
                                    });
                                  }}
                                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor={permission} className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                  {permission === Permission.MANAGE_SETTINGS && t("admin.users.permissions.systemSettings")}
                                  {permission === Permission.VIEW_AUDIT_LOGS && t("admin.users.permissions.auditLogs")}
                                  {permission === Permission.MANAGE_NOTIFICATIONS && t("admin.users.permissions.notifications")}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* WhatsApp Management */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">{t("admin.users.permissions.whatsappManagement")}</h5>
                          <div className="space-y-3">
                            {[Permission.MANAGE_WHATSAPP, Permission.SEND_WHATSAPP_MESSAGES].map((permission) => (
                              <div key={permission} className="flex items-center py-1">
                                <input
                                  type="checkbox"
                                  id={permission}
                                  checked={selectedUser.permissions?.includes(permission) || false}
                                  onChange={(e) => {
                                    const updatedPermissions = e.target.checked
                                      ? [...selectedUser.permissions, permission]
                                      : selectedUser.permissions.filter(p => p !== permission);
                                    setSelectedUser({
                                      ...selectedUser,
                                      permissions: updatedPermissions
                                    });
                                  }}
                                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor={permission} className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                  {permission === Permission.MANAGE_WHATSAPP && t("admin.users.permissions.manageWhatsapp")}
                                  {permission === Permission.SEND_WHATSAPP_MESSAGES && t("admin.users.permissions.sendMessages")}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 min-h-[44px]"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    onClick={() => {
                      const isSelf = selectedUser.id === session?.user?.id;
                      const updates: Partial<User> = {
                        buildingNumber: selectedUser.buildingNumber,
                        apartmentNumber: selectedUser.apartmentNumber,
                        phoneNumber: selectedUser.phoneNumber,
                        preferredLanguage: selectedUser.preferredLanguage
                      };
                      
                      // Only include security fields if not editing yourself
                      if (!isSelf) {
                        updates.role = selectedUser.role;
                        updates.isAdmin = selectedUser.isAdmin;
                        updates.permissions = selectedUser.permissions;
                      }
                      
                      // isVerifiedOwner and isActive can be changed by anyone with permissions
                      updates.isVerifiedOwner = selectedUser.isVerifiedOwner;
                      updates.isActive = selectedUser.isActive;
                      
                      handleUpdateUser(selectedUser.id, updates);
                    }}
                    className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 min-h-[44px]"
                  >
                    {t("common.saveChanges")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}