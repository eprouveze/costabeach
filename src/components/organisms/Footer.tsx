"use client";

import { Button } from "../atoms/Button";
import { Mail, Phone, MapPin } from "lucide-react";

interface FooterProps {
  className?: string;
}

export const Footer = ({ className = "" }: FooterProps) => {
  return (
    <footer className={`bg-gray-900 text-white py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                <a href="mailto:info@costabeach.com" className="hover:text-gray-300">
                  info@costabeach.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                <a href="tel:+1234567890" className="hover:text-gray-300">
                  (123) 456-7890
                </a>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                <p>Costa Beach, FL 12345</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/property" className="hover:text-gray-300">Property Details</a>
              </li>
              <li>
                <a href="/owner" className="hover:text-gray-300">Owner Portal</a>
              </li>
              <li>
                <a href="/contact" className="hover:text-gray-300">Contact</a>
              </li>
            </ul>
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