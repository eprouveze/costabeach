"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { Building, Waves, Sun, Map } from "lucide-react";
import { getTextAlignClass, getListStyleClass, getFlexDirectionClass } from "@/lib/utils/rtl";
import RTLList from '@/components/RTLList';
import RTLText from "../RTLText";

interface AboutSectionProps {
  className?: string;
}

export default function AboutSection({ className = "" }: AboutSectionProps) {
  const { t, locale } = useI18n();
  
  // Get RTL-specific classes
  const textAlignClass = getTextAlignClass(locale);
  const listStyleClass = getListStyleClass(locale);
  const flexDirectionClass = getFlexDirectionClass(locale);

  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("landing.aboutTitle")}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t("landing.aboutSubtitle")}
          </p>
        </div>

        {/* Main content with image */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16 ${locale === 'ar' ? 'lg:grid-flow-col-reverse' : ''}`}>
          <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
            <Image
              src="/images/hero-banner.jpeg"
              alt="Costa Beach 3 Building"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className={textAlignClass}>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              {t("landing.aboutHistory.title")}
            </h3>
            <RTLText className="text-gray-600 mb-4">
              {t("landing.aboutHistory.paragraph1")}
            </RTLText>
            <RTLText className="text-gray-600 mb-6">
              {t("landing.aboutHistory.paragraph2")}
            </RTLText>
            <Link
              href="#"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-300"
            >
              {t("landing.learnMoreCTA")}
            </Link>
          </div>
        </div>

        {/* Features section */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
            {t("landing.aboutFeatures.title")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <Building className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t("landing.aboutFeatures.architecture.title")}
              </h3>
              <RTLText className="text-gray-600">
                {t("landing.aboutFeatures.architecture.description")}
              </RTLText>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <Waves className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t("landing.aboutFeatures.beachfront.title")}
              </h3>
              <RTLText className="text-gray-600">
                {t("landing.aboutFeatures.beachfront.description")}
              </RTLText>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <Sun className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t("landing.aboutFeatures.amenities.title")}
              </h3>
              <RTLText className="text-gray-600">
                {t("landing.aboutFeatures.amenities.description")}
              </RTLText>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <Map className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t("landing.aboutFeatures.location.title")}
              </h3>
              <RTLText className="text-gray-600">
                {t("landing.aboutFeatures.location.description")}
              </RTLText>
            </div>
          </div>
        </div>

        {/* Community highlights */}
        <div className="bg-gray-50 p-8 rounded-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            {t("landing.aboutCommunity.title")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={textAlignClass}>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                {t("landing.aboutCommunity.services.title")}
              </h4>
              <RTLList type="ul" listStyleType="disc" className="space-y-2 text-gray-600">
                <li>{t("landing.aboutCommunity.services.item1")}</li>
                <li>{t("landing.aboutCommunity.services.item2")}</li>
                <li>{t("landing.aboutCommunity.services.item3")}</li>
                <li>{t("landing.aboutCommunity.services.item4")}</li>
              </RTLList>
            </div>
            <div className={textAlignClass}>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                {t("landing.aboutCommunity.lifestyle.title")}
              </h4>
              <RTLList type="ul" listStyleType="disc" className="space-y-2 text-gray-600">
                <li>{t("landing.aboutCommunity.lifestyle.item1")}</li>
                <li>{t("landing.aboutCommunity.lifestyle.item2")}</li>
                <li>{t("landing.aboutCommunity.lifestyle.item3")}</li>
                <li>{t("landing.aboutCommunity.lifestyle.item4")}</li>
              </RTLList>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 