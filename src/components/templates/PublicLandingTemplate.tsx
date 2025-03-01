"use client";

import React from "react";
import { FileText, Users, Bell, Info } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface PublicLandingTemplateProps {
  children?: React.ReactNode;
}

export default function PublicLandingTemplate({ children }: PublicLandingTemplateProps) {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Costa Beach 3
          </Link>
          <nav className="flex items-center gap-6">
            <LanguageSwitcher variant="dropdown" />
            <Link href="/contact" className="text-gray-600 hover:text-blue-600">
              {t("common.contact")}
            </Link>
            <Link
              href="/owner-login"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {t("auth.signIn")}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-blue-600 h-[500px]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-90" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-5xl font-bold text-white mb-6 max-w-2xl">
            {t("landing.heroTitle")}
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-xl">
            {t("landing.heroSubtitle")}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/owner-register" 
              className="bg-white text-blue-600 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors font-medium"
            >
              {t("landing.registerCTA")}
            </Link>
            <Link 
              href="/contact" 
              className="bg-blue-700 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition-colors font-medium"
            >
              {t("landing.contactCTA")}
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          {t("landing.featuresTitle")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("landing.features.documents.title")}</h3>
            <p className="text-gray-600">
              {t("landing.features.documents.description")}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("landing.features.community.title")}</h3>
            <p className="text-gray-600">
              {t("landing.features.community.description")}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("landing.features.notifications.title")}</h3>
            <p className="text-gray-600">
              {t("landing.features.notifications.description")}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("landing.features.information.title")}</h3>
            <p className="text-gray-600">
              {t("landing.features.information.description")}
            </p>
          </div>
        </div>
      </div>

      {/* About Costa Beach Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              {t("landing.aboutTitle")}
            </h2>
            <div className="prose prose-lg mx-auto">
              <p className="text-gray-600 mb-4">
                {t("landing.aboutDescription1")}
              </p>
              <p className="text-gray-600 mb-4">
                {t("landing.aboutDescription2")}
              </p>
              <div className="mt-8 text-center">
                <Link
                  href="/contact"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  {t("landing.learnMoreCTA")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Costa Beach 3</h3>
              <p className="text-gray-400">
                {t("landing.footer.description")}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">{t("landing.footer.quickLinks")}</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    {t("common.home")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                    {t("common.contact")}
                  </Link>
                </li>
                <li>
                  <Link href="/owner-login" className="text-gray-400 hover:text-white transition-colors">
                    {t("auth.signIn")}
                  </Link>
                </li>
                <li>
                  <Link href="/owner-register" className="text-gray-400 hover:text-white transition-colors">
                    {t("auth.signUp")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">{t("landing.footer.contact")}</h3>
              <address className="not-italic text-gray-400">
                <p>Costa Beach 3</p>
                <p>Casablanca, Morocco</p>
                <p>Email: contact@costabeach3.com</p>
              </address>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Costa Beach 3 HOA. {t("landing.footer.copyright")}</p>
          </div>
        </div>
      </footer>

      {children}
    </div>
  );
} 