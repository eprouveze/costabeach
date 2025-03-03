"use client";

import React from "react";
import { FileText, Users, Bell, Info } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import RTLList from "@/components/RTLList";
import { Footer } from "@/components/organisms/Footer";
import { Header } from "@/components/organisms/Header";

interface PublicLandingTemplateProps {
  children?: React.ReactNode;
}

export default function PublicLandingTemplate({ children }: PublicLandingTemplateProps) {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          {t("landing.featuresTitle")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Document Access */}
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600 hover:shadow-lg transition-shadow">
            <div className="text-blue-600 mb-4">
              <FileText size={40} />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("landing.features.documents.title")}</h3>
            <p className="text-gray-600">{t("landing.features.documents.description")}</p>
          </div>

          {/* Community Information */}
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-600 hover:shadow-lg transition-shadow">
            <div className="text-green-600 mb-4">
              <Users size={40} />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("landing.features.community.title")}</h3>
            <p className="text-gray-600">{t("landing.features.community.description")}</p>
          </div>

          {/* Important Notifications */}
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-orange-600 hover:shadow-lg transition-shadow">
            <div className="text-orange-600 mb-4">
              <Bell size={40} />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("landing.features.notifications.title")}</h3>
            <p className="text-gray-600">{t("landing.features.notifications.description")}</p>
          </div>

          {/* Multilingual Support */}
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-600 hover:shadow-lg transition-shadow">
            <div className="text-purple-600 mb-4">
              <Info size={40} />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("landing.features.information.title")}</h3>
            <p className="text-gray-600">{t("landing.features.information.description")}</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <AboutSection />

      {/* Footer */}
      <Footer />

      {children}
    </div>
  );
} 