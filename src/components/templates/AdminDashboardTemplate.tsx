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
  Search,
  Menu,
  X 
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { Header } from "@/components/organisms/Header";
import { useState, FormEvent, useEffect, useRef } from "react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const session = useSession();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Handle click outside to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

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
      
      <div className="flex flex-1 relative">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 p-3 rounded-md bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={t("navigation.toggleMenu")}
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          ref={sidebarRef}
          className={`
            w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
            fixed top-16 bottom-0 overflow-y-auto z-50
            transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:left-0
          `}>
          <div className="p-4">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("admin.searchLogsPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <button type="submit" className="sr-only">Search</button>
              </div>
            </form>

            <nav className="space-y-1">
              {/* Admin Dashboard */}
              <Link
                href={`/${locale}/admin`}
                className={`flex items-center gap-3 px-4 py-4 sm:py-3 text-sm font-medium rounded-md min-h-[48px] ${
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
                  {t("admin.configuration")}
                </h3>
              </div>

              {/* User Management */}
              <Link
                href={`/${locale}/admin/users`}
                className={`flex items-center gap-3 px-4 py-4 sm:py-3 text-sm font-medium rounded-md min-h-[48px] ${
                  pathname.startsWith(`/${locale}/admin/users`)
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Users className="w-5 h-5" />
                {t("admin.userManagement")}
              </Link>

              {/* Document Management */}
              {(canManageDocuments || canManageComiteDocuments) && (
                <Link
                  href={`/${locale}/admin/documents`}
                  className={`flex items-center gap-3 px-4 py-4 sm:py-3 text-sm font-medium rounded-md min-h-[48px] ${
                    pathname.startsWith(`/${locale}/admin/documents`)
                      ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                      : "text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  {t("admin.documentManagement")}
                </Link>
              )}

              {/* Information Management */}
              {canManageInformation && (
                <Link
                  href={`/${locale}/admin/information`}
                  className={`flex items-center gap-3 px-4 py-4 sm:py-3 text-sm font-medium rounded-md min-h-[48px] ${
                    pathname.startsWith(`/${locale}/admin/information`)
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Info className="w-5 h-5" />
                  {t("information.management")}
                </Link>
              )}

              {/* Polls Management */}
              <Link
                href={`/${locale}/admin/polls`}
                className={`flex items-center gap-3 px-4 py-4 sm:py-3 text-sm font-medium rounded-md min-h-[48px] ${
                  pathname.startsWith(`/${locale}/admin/polls`)
                    ? "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                {t("admin.pollsManagement")}
              </Link>

              {/* Owner Registrations */}
              <Link
                href={`/${locale}/admin/owner-registrations`}
                className={`flex items-center gap-3 px-4 py-4 sm:py-3 text-sm font-medium rounded-md min-h-[48px] ${
                  pathname.startsWith(`/${locale}/admin/owner-registrations`)
                    ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                {t("admin.ownerRegistrations")}
              </Link>

              {/* Communication Section */}
              <div className="pt-4 pb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("admin.sectionHeaders.communication")}
                </h3>
              </div>

              {/* WhatsApp Management */}
              {canManageWhatsApp && (
                <Link
                  href={`/${locale}/admin/whatsapp`}
                  className={`flex items-center gap-3 px-4 py-4 sm:py-3 text-sm font-medium rounded-md min-h-[48px] ${
                    pathname.startsWith(`/${locale}/admin/whatsapp`)
                      ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                      : "text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  {t("admin.whatsappManagement")}
                </Link>
              )}

              {/* Emergency Alerts */}
              <Link
                href={`/${locale}/admin/emergency-alerts`}
                className={`flex items-center gap-3 px-4 py-4 sm:py-3 text-sm font-medium rounded-md min-h-[48px] ${
                  pathname.startsWith(`/${locale}/admin/emergency-alerts`)
                    ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
                {t("admin.emergencyAlerts")}
              </Link>

              {/* Tools Section */}
              <div className="pt-4 pb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("admin.sectionHeaders.tools")}
                </h3>
              </div>

              {/* Translation Management */}
              {canManageTranslations && (
                <Link
                  href={`/${locale}/admin/translations`}
                  className={`flex items-center gap-3 px-4 py-4 sm:py-3 text-sm font-medium rounded-md min-h-[48px] ${
                    pathname.startsWith(`/${locale}/admin/translations`)
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                      : "text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Languages className="w-5 h-5" />
                  {t("admin.translationManagement")}
                </Link>
              )}

              {/* Activity Logs */}
              <Link
                href={`/${locale}/admin/logs`}
                className={`flex items-center gap-3 px-4 py-4 sm:py-3 text-sm font-medium rounded-md min-h-[48px] ${
                  pathname.startsWith(`/${locale}/admin/logs`)
                    ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <History className="w-5 h-5" />
                {t("admin.activityLogs")}
              </Link>

              {/* Reports */}
              <Link
                href={`/${locale}/admin/reports`}
                className={`flex items-center gap-3 px-4 py-4 sm:py-3 text-sm font-medium rounded-md min-h-[48px] ${
                  pathname.startsWith(`/${locale}/admin/reports`)
                    ? "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                {t("admin.reports")}
              </Link>

              {/* Settings Section */}
              <div className="pt-4 pb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("common.settings")}
                </h3>
              </div>

              {/* System Settings */}
              <Link
                href={`/${locale}/admin/settings`}
                className={`flex items-center gap-3 px-4 py-4 sm:py-3 text-sm font-medium rounded-md min-h-[48px] ${
                  pathname.startsWith(`/${locale}/admin/settings`)
                    ? "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Settings className="w-5 h-5" />
                {t("admin.systemSettings")}
              </Link>

              {/* Back to Owner Dashboard */}
              <div className="pt-4 pb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("navigation.ownerPortal")}
                </h3>
              </div>

              <Link
                href={`/${locale}/owner-dashboard`}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
              >
                <User className="w-5 h-5" />
                {t("admin.backToDashboard")}
              </Link>

              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center gap-3 px-4 py-4 sm:py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              >
                <LogOut className="w-5 h-5" />
                {isSigningOut ? t("auth.signingOut") : t("auth.signOut")}
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pt-16 pb-10 min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
          {/* Content with padding for mobile menu button */}
          <div className="p-4 sm:p-6 pt-20 lg:pt-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}