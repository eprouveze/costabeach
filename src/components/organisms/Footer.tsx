"use client";

import Link from "next/link";
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
          {/* About Costa Beach */}
          <div>
            <h3 className="text-xl font-bold mb-4">Costa Beach 3</h3>
            <p className="text-gray-400">
              {t("landing.footer.description")}
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t("landing.footer.quickLinks")}</h3>
            <RTLList className="space-y-2">
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
                <Link href="/auth/signin" className="text-gray-400 hover:text-white transition-colors">
                  {t("auth.signIn")}
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-gray-400 hover:text-white transition-colors">
                  {t("auth.signUp")}
                </Link>
              </li>
            </RTLList>
          </div>
          
          {/* Contact Information */}
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
  );
}; 