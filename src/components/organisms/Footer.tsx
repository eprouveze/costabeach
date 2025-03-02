"use client";

import { Button } from "../atoms/Button";
import { Mail, Phone, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import RTLList from "@/components/RTLList";
import RTLText from "@/components/RTLText";

interface FooterProps {
  className?: string;
}

export const Footer = ({ className = "" }: FooterProps) => {
  const { t } = useI18n();

  return (
    <footer className={`bg-gray-900 text-white py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-semibold mb-4">{t("footer.contactInfo.title")}</h3>
            <RTLList className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">📍</span>
                <RTLText>{t("footer.contactInfo.address")}</RTLText>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📞</span>
                <RTLText>{t("footer.contactInfo.phone")}</RTLText>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✉️</span>
                <RTLText>{t("footer.contactInfo.email")}</RTLText>
              </li>
            </RTLList>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">{t("footer.quickLinks.title")}</h3>
            <RTLList className="space-y-2">
              <li>
                <a href="/property" className="hover:text-gray-300">{t("footer.quickLinks.property")}</a>
              </li>
              <li>
                <a href="/gallery" className="hover:text-gray-300">{t("footer.quickLinks.gallery")}</a>
              </li>
              <li>
                <a href="/contact" className="hover:text-gray-300">{t("footer.quickLinks.contact")}</a>
              </li>
            </RTLList>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Stay Updated</h3>
            <p className="mb-4">Subscribe to our newsletter for updates and news.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 rounded text-gray-900 flex-grow"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p>&copy; {new Date().getFullYear()} Costabeach. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}; 