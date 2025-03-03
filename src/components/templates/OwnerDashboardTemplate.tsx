"use client";

import { signOut } from "next-auth/react";
import { Bell, FileText, Folder, Home, LogOut, Search, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { Header } from "@/components/organisms/Header";

export default function OwnerDashboardTemplate({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();

  const sidebarLinks = [
    { href: "/owner-dashboard", label: t("navigation.dashboard"), icon: Home },
    { href: "/owner-dashboard/documents", label: t("navigation.documents"), icon: FileText },
    { href: "/owner-dashboard/categories", label: t("navigation.categories"), icon: Folder },
    { href: "/owner-dashboard/notifications", label: t("navigation.notifications"), icon: Bell },
    { href: "/owner-dashboard/profile", label: t("navigation.profile"), icon: User },
    { href: "/owner-dashboard/settings", label: t("navigation.settings"), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Global Header */}
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 fixed top-16 h-[calc(100vh-4rem)]">
          <div className="p-6">
            <Link href="/" className="text-xl font-bold text-blue-600">
              {t("common.siteTitle")}
            </Link>
          </div>
          <nav className="mt-6">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-6 py-3 text-sm font-medium ${
                    isActive
                      ? "text-blue-600 bg-blue-50 border-r-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            >
              <LogOut className="w-5 h-5" />
              {t("navigation.signOut")}
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 mt-16">
          {/* Dashboard Header */}
          <header className="bg-white border-b border-gray-200">
            <div className="px-4 h-16 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800">{t("navigation.dashboard")}</h1>
              
              {/* Search Bar */}
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder={t("documents.searchPlaceholder")}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 