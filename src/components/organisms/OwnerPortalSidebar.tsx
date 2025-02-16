"use client";

import { useState } from "react";
import { NavItem } from "@/components/molecules/NavItem";
import { TextField } from "@/components/molecules/TextField";
import { Search, Home, FileText, Settings, Users } from "lucide-react";

interface OwnerPortalSidebarProps {
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

const navigationItems = [
  { icon: Home, label: "Dashboard", path: "/owner/dashboard" },
  { icon: FileText, label: "Documents", path: "/owner/documents" },
  { icon: Users, label: "Community", path: "/owner/community" },
  { icon: Settings, label: "Settings", path: "/owner/settings" },
];

export function OwnerPortalSidebar({ onNavigate, currentPath = "/owner/dashboard" }: OwnerPortalSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col">
      <div className="mb-6">
        <TextField
          icon={Search}
          label="Search"
          name="search"
          placeholder="Search..."
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
    </aside>
  );
} 