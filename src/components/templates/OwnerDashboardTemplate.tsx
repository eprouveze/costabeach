"use client";

import { signOut } from "next-auth/react";
import { FileText, Folder, Home, LogOut, Search, Settings, User, Info, Book, FileCheck, GavelIcon, FileQuestion, CreditCard } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { Header } from "@/components/organisms/Header";
import { useState, FormEvent } from "react";

interface CategoryItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

export default function OwnerDashboardTemplate({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  // Categories based on the DocumentCategory enum
  const categories: CategoryItem[] = [
    { id: "ALL", label: t("documents.categories.all") || "All Documents", icon: Folder },
    { id: "GENERAL", label: t("documents.categories.general"), icon: FileText },
    { id: "COMITE_DE_SUIVI", label: t("documents.categories.comiteDeSuivi"), icon: Book },
    { id: "SOCIETE_DE_GESTION", label: t("documents.categories.societeDeGestion"), icon: FileCheck },
    { id: "FINANCE", label: t("documents.categories.finance") || "Documents Financiers", icon: CreditCard },
    { id: "LEGAL", label: t("documents.categories.legal"), icon: GavelIcon },
  ];

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // Check if a category is active
  const isCategoryActive = (categoryId: string) => {
    return searchParams.get("category") === categoryId;
  };

  // Check if all documents are being displayed (no category filter)
  const isAllCategoryActive = () => {
    return searchParams.get("category") === "ALL" || (!searchParams.get("category") && !searchParams.get("type"));
  };

  // Check if information section is active
  const isInformationActive = () => {
    return searchParams.get("type") === "information";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Global Header */}
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 fixed top-16 bottom-0 left-0 overflow-y-auto z-10">
          <div className="p-4">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("documents.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button type="submit" className="sr-only">Search</button>
              </div>
            </form>

            <nav className="space-y-1">
              {/* Dashboard link */}
              <Link
                href="/owner-dashboard"
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                  pathname === "/owner-dashboard" && isAllCategoryActive() && !searchParams.toString()
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <Home className="w-5 h-5" />
                {t("navigation.dashboard")}
              </Link>

              {/* Information section */}
              <Link
                href={`/owner-dashboard?type=information`}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                  isInformationActive()
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <Info className="w-5 h-5" />
                {t("common.information") || "Informations"}
              </Link>

              {/* Document Categories */}
              <div className="pt-4 pb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("documents.categories.title")}
                </h3>
              </div>

              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = category.id === "ALL" ? isAllCategoryActive() : isCategoryActive(category.id);
                const href = category.id === "ALL" 
                  ? "/owner-dashboard" 
                  : `/owner-dashboard?category=${category.id}`;

                return (
                  <Link
                    key={category.id}
                    href={href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {category.label}
                  </Link>
                );
              })}

              {/* User section */}
              <div className="pt-4 pb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("common.user")}
                </h3>
              </div>

              <Link
                href="/owner-dashboard/profile"
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                  pathname === "/owner-dashboard/profile"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <User className="w-5 h-5" />
                {t("navigation.profile")}
              </Link>

              <Link
                href="/owner-dashboard/settings"
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                  pathname === "/owner-dashboard/settings"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <Settings className="w-5 h-5" />
                {t("navigation.settings")}
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                <LogOut className="w-5 h-5" />
                {t("navigation.signOut")}
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 pt-16 pb-10 min-h-screen">
          {/* Content */}
          <div className="p-6 max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 