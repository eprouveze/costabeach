"use client";

import { FileText, Home, LogOut, Search, Settings, User, Info, FileQuestion } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { Header } from "@/components/organisms/Header";
import { useState, FormEvent } from "react";
import { signOut } from "@/lib/supabase/auth";
import { toast } from "react-toastify";

export default function OwnerDashboardTemplate({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "");
  const [isSigningOut, setIsSigningOut] = useState(false);

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
                  placeholder={t("documents.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <button type="submit" className="sr-only">Search</button>
              </div>
            </form>

            <nav className="space-y-1">
              {/* Dashboard link */}
              <Link
                href={`/${locale}/owner-dashboard`}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                  pathname === `/${locale}/owner-dashboard`
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Home className="w-5 h-5" />
                {t("navigation.dashboard")}
              </Link>

              {/* Information section */}
              <Link
                href={`/${locale}/owner-dashboard/informations`}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                  pathname === `/${locale}/owner-dashboard/informations`
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Info className="w-5 h-5" />
                {t("common.information") || "Informations"}
              </Link>

              {/* Polls section */}
              <Link
                href={`/${locale}/owner-dashboard/polls`}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                  pathname === `/${locale}/owner-dashboard/polls`
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <FileQuestion className="w-5 h-5" />
                {t("navigation.polls") || "Polls"}
              </Link>

              {/* Documents section */}
              <Link
                href={`/${locale}/owner-dashboard/documents`}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                  pathname === `/${locale}/owner-dashboard/documents`
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <FileText className="w-5 h-5" />
                {t("common.documents") || "Documents"}
              </Link>

              {/* User section */}
              <div className="pt-4 pb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("common.user")}
                </h3>
              </div>

              <Link
                href={`/${locale}/owner-dashboard/profile`}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                  pathname === `/${locale}/owner-dashboard/profile`
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <User className="w-5 h-5" />
                {t("navigation.profile")}
              </Link>

              <Link
                href={`/${locale}/owner-dashboard/settings`}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                  pathname === `/${locale}/owner-dashboard/settings`
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Settings className="w-5 h-5" />
                {t("navigation.settings")}
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
          <div className="p-6 max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 