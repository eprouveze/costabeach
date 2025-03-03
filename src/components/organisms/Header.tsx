"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NavItem } from "../molecules/NavItem";
import LanguageSwitcher from "../LanguageSwitcher";
import { Menu, X, Home, FileText, Mail, User, Info, LogIn, LogOut } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { signOut } from "@/lib/supabase/auth";
import Link from "next/link";
import { useSupabaseSession } from "@/lib/supabase/hooks";

interface HeaderProps {
  className?: string;
}

export const Header = ({ className = "" }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const router = useRouter();
  const { session, isLoading } = useSupabaseSession();
  
  const isAuthenticated = !!session;

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { 
      label: t("navigation.home"), 
      href: `/${locale}`, 
      icon: Home 
    },
    { 
      label: t("navigation.ownerPortal"), 
      href: isAuthenticated ? `/${locale}/owner-dashboard` : `/${locale}/auth/signin`, 
      icon: User 
    },
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
      await signOut();
      router.push(`/${locale}`);
    } else {
      // Use direct navigation to ensure the redirect works
      window.location.href = `/${locale}/auth/signin`;
    }
  };

  return (
    <header className={`w-full bg-white dark:bg-gray-800 shadow-sm ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              <Link href={`/${locale}`} className="hover:text-blue-600 transition-colors">
                {t("common.siteTitle")}
              </Link>
            </h1>
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
            <LanguageSwitcher variant="dropdown" />
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <LanguageSwitcher variant="dropdown" className="mr-2" />
            <button
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                className="flex items-center gap-2 px-4 py-2 text-base text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
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