"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/client";

interface HeroProps {
  className?: string;
}

export default function Hero({ className = "" }: HeroProps) {
  const { t } = useI18n();

  return (
    <div className={`relative h-[600px] w-full overflow-hidden ${className}`}>
      {/* Hero Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/costa-beach-hero.jpg"
          alt="Costa Beach 3"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {t("landing.heroTitle")}
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl">
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
              className="bg-blue-700 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition-colors font-medium border border-white/20"
            >
              {t("landing.contactCTA")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 