"use client";

import { signOut } from "next-auth/react";
import { Building2, Calendar, CreditCard, LayoutDashboard, LogOut, MessageSquare, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";

export default function OwnerDashboardTemplate({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();

  const sidebarLinks = [
    { href: "/owner-dashboard", label: t("navigation.dashboard"), icon: LayoutDashboard },
    { href: "/owner-dashboard/properties", label: t("navigation.properties"), icon: Building2 },
    { href: "/owner-dashboard/bookings", label: t("navigation.bookings"), icon: Calendar },
    { href: "/owner-dashboard/guests", label: t("navigation.guests"), icon: Users },
    { href: "/owner-dashboard/messages", label: t("navigation.messages"), icon: MessageSquare },
    { href: "/owner-dashboard/payments", label: t("navigation.payments"), icon: CreditCard },
    { href: "/owner-dashboard/settings", label: t("navigation.settings"), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
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
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-4 h-16 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">{t("navigation.dashboard")}</h1>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Dashboard Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Properties</h3>
              <p className="text-2xl font-semibold text-gray-900">4</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Active Bookings</h3>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
              <p className="text-2xl font-semibold text-gray-900">$24,500</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-1">New Messages</h3>
              <p className="text-2xl font-semibold text-gray-900">3</p>
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
} 