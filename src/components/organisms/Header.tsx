"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NavItem } from "../molecules/NavItem";
import LanguageSwitcher from "../LanguageSwitcher";
import { Menu, X, Home, FileText, Mail, User, Info, LogIn, LogOut, Shield, Sun, Moon } from "lucide-react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { checkPermission } from "@/lib/utils/permissions";
import { Permission } from "@/lib/types";
import { useTheme } from "next-themes";

interface HeaderProps {
  className?: string;
}

export const Header = ({ className = "" }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  const handleThemeToggle = () => {
    console.log('Theme toggle clicked. Current resolved theme:', resolvedTheme);
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    console.log('Setting theme to:', newTheme);
    setTheme(newTheme);
    
    // Debug: Check if dark class is applied to html
    setTimeout(() => {
      const htmlElement = document.documentElement;
      console.log('HTML classes after theme change:', htmlElement.className);
      console.log('Has dark class:', htmlElement.classList.contains('dark'));
    }, 100);
  };
  
  const isAuthenticated = !!session;
  const isLoading = status === "loading";

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    // Debug: Check initial HTML classes
    const htmlElement = document.documentElement;
    console.log('Initial HTML classes:', htmlElement.className);
    console.log('Initial has dark class:', htmlElement.classList.contains('dark'));
  }, []);

  // Fetch user permissions when authenticated (enhancement only)
  useEffect(() => {
    const fetchPermissions = async () => {
      if (session?.user?.id && status === 'authenticated') {
        try {
          const response = await fetch(`/api/users/${session.user.id}/permissions`);
          if (response.ok) {
            const userData = await response.json();
            setUserPermissions(userData.permissions || []);
          }
          // Silently fail if API is not available - admin status comes from session
        } catch (error) {
          // Permissions API failure is not critical for navigation
          // Admin status is determined from session data
        }
      } else {
        setUserPermissions([]);
      }
    };

    // Only fetch permissions when session is fully loaded
    if (status === 'authenticated') {
      fetchPermissions();
    } else if (status === 'unauthenticated') {
      setUserPermissions([]);
    }
  }, [session?.user?.id, status]);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Check if user has admin privileges
  // Use session data as primary source for admin status
  const isAdmin = (session?.user as any)?.isAdmin === true;
  const canManageDocuments = checkPermission(userPermissions, Permission.MANAGE_DOCUMENTS);
  const canManageComiteDocuments = checkPermission(userPermissions, Permission.MANAGE_COMITE_DOCUMENTS);
  const hasAdminAccess = isAdmin || canManageDocuments || canManageComiteDocuments;

  const navItems = [
    { 
      label: t("navigation.home"), 
      href: `/${locale}`, 
      icon: Home 
    },
    { 
      label: t("navigation.ownerPortal"), 
      href: isAuthenticated ? `/${locale}/owner-dashboard` : `/${locale}/owner-login`, 
      icon: User 
    },
    ...(hasAdminAccess ? [{ 
      label: t("navigation.admin") || "Admin", 
      href: `/${locale}/admin`, 
      icon: Shield 
    }] : []),
    { 
      label: t("navigation.contact"), 
      href: `/${locale}/contact`, 
      icon: Mail 
    },
  ];

  // Check if a nav item is active
  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === href;
    }
    return pathname?.startsWith(href) || false;
  };

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      await signOut({ 
        callbackUrl: `/${locale}`,
        redirect: true 
      });
    } else {
      // Use direct navigation to ensure the redirect works
      window.location.href = `/${locale}/owner-login`;
    }
  };

  return (
    <header className={`w-full bg-white dark:bg-gray-900 shadow-sm ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href={`/${locale}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <Image
                src="/images/cropped-IMG_0005.webp"
                alt="Costa Beach Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("common.siteTitle")}
              </h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <nav className="flex space-x-4 mr-4">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isActive(item.href)}
                />
              ))}
            </nav>
            <div className="flex items-center space-x-2">
              <LanguageSwitcher variant="dropdown" />
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={t("theme.toggle") || "Toggle theme"}
              >
                {mounted && resolvedTheme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={handleAuthAction}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {isAuthenticated ? (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>{t("auth.signOut")}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{t("auth.signIn")}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher variant="dropdown" />
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={t("theme.toggle") || "Toggle theme"}
            >
              {mounted && resolvedTheme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={t("navigation.toggleMenu")}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isActive(item.href)}
                  className="block px-4 py-2 text-base"
                />
              ))}
              <button
                onClick={handleAuthAction}
                className="flex items-center gap-2 px-4 py-2 text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                {isAuthenticated ? (
                  <>
                    <LogOut className="w-5 h-5" />
                    <span>{t("auth.signOut")}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>{t("auth.signIn")}</span>
                  </>
                )}
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}; 