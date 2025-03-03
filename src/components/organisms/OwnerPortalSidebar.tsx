"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NavItem } from "@/components/molecules/NavItem";
import { TextField } from "@/components/molecules/TextField";
import { Search, Home, FileText, Settings, Users, Folder, Bell, Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/atoms/Button";
import { signOut } from "next-auth/react";

interface OwnerPortalSidebarProps {
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

export function OwnerPortalSidebar({ onNavigate, currentPath = "/owner-dashboard" }: OwnerPortalSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useI18n();

  const navigationItems = [
    { icon: Home, label: t("navigation.dashboard"), path: "/owner-dashboard" },
    { icon: FileText, label: t("navigation.documents"), path: "/owner-dashboard/documents" },
    { icon: Folder, label: t("navigation.categories"), path: "/owner-dashboard/categories" },
    { icon: Bell, label: t("navigation.notifications"), path: "/owner-dashboard/notifications" },
    { icon: Users, label: t("navigation.community"), path: "/owner-dashboard/community" },
    { icon: Settings, label: t("navigation.settings"), path: "/owner-dashboard/settings" },
  ];

  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col">
      <div className="mb-6">
        <TextField
          icon={Search}
          label={t("common.search")}
          name="search"
          placeholder={`${t("common.search")}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
      
      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            isActive={currentPath === item.path}
            onClick={() => onNavigate?.(item.path)}
            className="w-full"
          />
        ))}
      </nav>

      <div className="mt-auto">
        <Button 
          className="w-full" 
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          {t("auth.signOut")}
        </Button>
      </div>
    </aside>
  );
} 