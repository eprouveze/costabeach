"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";
import { Locale, locales, localeNames } from "@/lib/i18n/config";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "dropdown" | "buttons";
  className?: string;
}

export default function LanguageSwitcher({
  variant = "dropdown",
  className = "",
}: LanguageSwitcherProps) {
  const { locale, setLocale, t, isRTL } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Toggle dropdown
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Close dropdown
  const closeDropdown = () => setIsOpen(false);

  // Handle language change
  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    closeDropdown();
  };

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    // Add event listener when dropdown is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Clean up event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Render buttons variant
  if (variant === "buttons") {
    return (
      <div className={`flex space-x-2 ${className}`}>
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              locale === loc
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
            aria-label={`Switch to ${localeNames[loc]}`}
          >
            {localeNames[loc]}
          </button>
        ))}
      </div>
    );
  }

  // Render dropdown variant (default)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t("common.language")}
      >
        <Globe size={18} />
        <span className="ml-1">{localeNames[locale]}</span>
      </button>

      {isOpen && (
        <div
          className={`absolute z-20 mt-1 w-40 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none ${
            isRTL ? "right-0" : "left-0"
          }`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-menu-button"
        >
          <div className="py-1" role="none">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLanguageChange(loc)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  locale === loc
                    ? "bg-gray-100 dark:bg-gray-700 text-primary dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                role="menuitem"
              >
                {localeNames[loc]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 