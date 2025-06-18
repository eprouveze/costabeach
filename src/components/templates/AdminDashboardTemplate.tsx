"use client";

import { 
  Users, 
  FileText, 
  Home, 
  LogOut, 
  Settings, 
  User, 
  Info, 
  Languages, 
  MessageSquare, 
  ClipboardList, 
  AlertTriangle, 
  History, 
  Search 
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { Header } from "@/components/organisms/Header";
import { useState, FormEvent, useEffect } from "react";
import { signOut } from "@/lib/supabase/auth";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { checkPermission } from "@/lib/utils/permissions";
import { Permission } from "@/lib/types";

export default function AdminDashboardTemplate({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const session = useSession();

  // Fetch user permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        if (session.status === 'loading' || !session.data?.user?.id) {
          return;
        }

        const response = await fetch(`/api/users/${session.data.user.id}/permissions`);
        if (!response.ok) {
          throw new Error("Failed to fetch user permissions");
        }
        
        const userData = await response.json();
        setUserPermissions(userData.permissions || []);
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };

    fetchPermissions();
  }, [session.status, session.data?.user?.id]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString());
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t("auth.signOutSuccess"));
        router.push(`/${locale}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Error signing out");
    } finally {
      setIsSigningOut(false);
    }
  };

  // Permission checks
  const canManageDocuments = checkPermission(userPermissions, Permission.MANAGE_DOCUMENTS);
  const canManageComiteDocuments = checkPermission(userPermissions, Permission.MANAGE_COMITE_DOCUMENTS);
  const canManageInformation = checkPermission(userPermissions, Permission.MANAGE_INFORMATION) || (session.data?.user?.isAdmin === true);
  const canManageWhatsApp = canManageDocuments || canManageComiteDocuments || (session.data?.user?.isAdmin === true);
  const canManageTranslations = canManageDocuments || canManageComiteDocuments || (session.data?.user?.isAdmin === true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Global Header */}
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed top-16 bottom-0 left-0 overflow-y-auto z-10">
          <div className="p-4">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("admin.searchLogsPlaceholder") || "Search..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <button type="submit" className="sr-only">Search</button>
              </div>
            </form>

            <nav className="space-y-1">
              {/* Admin Dashboard */}
              <Link
                href={`/${locale}/admin`}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                  pathname === `/${locale}/admin`
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Home className="w-5 h-5" />
                {t("admin.dashboard")}
              </Link>

              {/* Management Section */}
              <div className="pt-4 pb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("admin.configuration") || "Management"}
                </h3>
              </div>

              {/* User Management */}
              <Link
                href={`/${locale}/admin/users`}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                  pathname.startsWith(`/${locale}/admin/users`)
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Users className="w-5 h-5" />
                {t("admin.userManagement") || "User Management"}
              </Link>

              {/* Document Management */}
              {(canManageDocuments || canManageComiteDocuments) && (
                <Link
                  href={`/${locale}/admin/documents`}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                    pathname.startsWith(`/${locale}/admin/documents`)
                      ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                      : "text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  {t("admin.documentManagement") || "Documents"}
                </Link>
              )}

              {/* Information Management */}
              {canManageInformation && (
                <Link
                  href={`/${locale}/admin/information`}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                    pathname.startsWith(`/${locale}/admin/information`)
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Info className="w-5 h-5" />
                  {t("information.management") || "Information"}
                </Link>
              )}

              {/* Polls Management */}
              <Link
                href={`/${locale}/admin/polls`}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                  pathname.startsWith(`/${locale}/admin/polls`)
                    ? "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                {t("admin.pollsManagement") || "Polls"}
              </Link>

              {/* Owner Registrations */}
              <Link
                href={`/${locale}/admin/owner-registrations`}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                  pathname.startsWith(`/${locale}/admin/owner-registrations`)
                    ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                {t("admin.ownerRegistrations") || "Registrations"}
              </Link>

              {/* Communication Section */}
              <div className="pt-4 pb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Communication
                </h3>
              </div>

              {/* WhatsApp Management */}
              {canManageWhatsApp && (
                <Link
                  href={`/${locale}/admin/whatsapp`}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                    pathname.startsWith(`/${locale}/admin/whatsapp`)
                      ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                      : "text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  {t("admin.whatsappManagement") || "WhatsApp"}
                </Link>
              )}

              {/* Emergency Alerts */}
              <Link
                href={`/${locale}/admin/emergency-alerts`}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                  pathname.startsWith(`/${locale}/admin/emergency-alerts`)
                    ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
                {t("admin.emergencyAlerts") || "Emergency Alerts"}
              </Link>

              {/* Tools Section */}
              <div className="pt-4 pb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tools
                </h3>
              </div>

              {/* Translation Management */}
              {canManageTranslations && (
                <Link
                  href={`/${locale}/admin/translations`}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                    pathname.startsWith(`/${locale}/admin/translations`)
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                      : "text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Languages className="w-5 h-5" />
                  {t("admin.translationManagement") || "Translations"}
                </Link>
              )}

              {/* Activity Logs */}
              <Link
                href={`/${locale}/admin/logs`}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                  pathname.startsWith(`/${locale}/admin/logs`)
                    ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <History className="w-5 h-5" />
                {t("admin.activityLogs") || "Activity Logs"}
              </Link>

              {/* Reports */}
              <Link
                href={`/${locale}/admin/reports`}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                  pathname.startsWith(`/${locale}/admin/reports`)
                    ? "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                {t("admin.reports") || "Reports"}
              </Link>

              {/* Settings Section */}
              <div className="pt-4 pb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("common.settings") || "Settings"}
                </h3>
              </div>

              {/* System Settings */}
              <Link
                href={`/${locale}/admin/settings`}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                  pathname.startsWith(`/${locale}/admin/settings`)
                    ? "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Settings className="w-5 h-5" />
                {t("admin.systemSettings") || "System Settings"}
              </Link>

              {/* Back to Owner Dashboard */}
              <div className="pt-4 pb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("navigation.ownerPortal") || "Owner Portal"}
                </h3>
              </div>

              <Link
                href={`/${locale}/owner-dashboard`}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
              >
                <User className="w-5 h-5" />
                {t("admin.backToDashboard") || "Back to Dashboard"}
              </Link>

              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-5 h-5" />
                {isSigningOut ? t("auth.signingOut") : t("auth.signOut")}
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 pt-16 pb-10 min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
          {/* Content */}
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}