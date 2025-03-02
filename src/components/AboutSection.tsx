"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { Building, Waves, Sun, Map } from "lucide-react";

interface AboutSectionProps {
  className?: string;
}

export default function AboutSection({ className = "" }: AboutSectionProps) {
  const { t } = useI18n();

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
            <Image
              src="/images/2024/06/IMG_1406-2048x1152.jpeg"
              alt="Costa Beach 3 Property"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              {t("landing.aboutHistory.title")}
            </h3>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>{t("landing.aboutHistory.paragraph1")}</p>
              <p>{t("landing.aboutHistory.paragraph2")}</p>
            </div>
            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                {t("landing.learnMoreCTA")}
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              {t("landing.aboutFeatures.modern.title")}
            </h4>
            <p className="text-gray-600">
              {t("landing.aboutFeatures.modern.description")}
            </p>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Waves className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              {t("landing.aboutFeatures.beach.title")}
            </h4>
            <p className="text-gray-600">
              {t("landing.aboutFeatures.beach.description")}
            </p>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Sun className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              {t("landing.aboutFeatures.amenities.title")}
            </h4>
            <p className="text-gray-600">
              {t("landing.aboutFeatures.amenities.description")}
            </p>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Map className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              {t("landing.aboutFeatures.location.title")}
            </h4>
            <p className="text-gray-600">
              {t("landing.aboutFeatures.location.description")}
            </p>
          </div>
        </div>

        {/* Community highlights */}
        <div className="bg-gray-50 p-8 rounded-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            {t("landing.aboutCommunity.title")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                {t("landing.aboutCommunity.services.title")}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>{t("landing.aboutCommunity.services.item1")}</li>
                <li>{t("landing.aboutCommunity.services.item2")}</li>
                <li>{t("landing.aboutCommunity.services.item3")}</li>
                <li>{t("landing.aboutCommunity.services.item4")}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                {t("landing.aboutCommunity.lifestyle.title")}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>{t("landing.aboutCommunity.lifestyle.item1")}</li>
                <li>{t("landing.aboutCommunity.lifestyle.item2")}</li>
                <li>{t("landing.aboutCommunity.lifestyle.item3")}</li>
                <li>{t("landing.aboutCommunity.lifestyle.item4")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 