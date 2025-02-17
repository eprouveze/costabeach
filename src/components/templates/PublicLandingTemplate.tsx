"use client";

import React from "react";
import { Search, MapPin, Star, Calendar } from "lucide-react";
import Link from "next/link";

interface PublicLandingTemplateProps {
  children?: React.ReactNode;
}

export default function PublicLandingTemplate({ children }: PublicLandingTemplateProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Costa Beach
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/contact" className="text-gray-600 hover:text-blue-600">
              Contact
            </Link>
            <Link
              href="/owner-login"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Owner Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-blue-600 h-[600px]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-90" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-5xl font-bold text-white mb-6 max-w-2xl">
            Find Your Perfect Beachfront Paradise
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-xl">
            Discover and book beautiful beachfront properties for an unforgettable vacation experience.
          </p>
          
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-3xl flex gap-4 items-center">
            <div className="flex-1 flex items-center gap-2">
              <MapPin className="text-blue-500" />
              <input
                type="text"
                placeholder="Where do you want to go?"
                className="w-full outline-none"
              />
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="flex-1 flex items-center gap-2">
              <Calendar className="text-blue-500" />
              <input
                type="text"
                placeholder="Check in - Check out"
                className="w-full outline-none"
              />
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Featured Properties */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Beach Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Property Cards */}
          {[1, 2, 3].map((i) => (
            <Link href="/property-detail" key={i} className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:-translate-y-1">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                      Luxury Beach Villa {i}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">4.9</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Beautiful beachfront villa with stunning ocean views
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-semibold">$299/night</span>
                    <span className="text-sm text-gray-500">Costa Rica</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Why Choose Costa Beach
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Properties</h3>
              <p className="text-gray-600">
                All our properties are carefully verified to ensure the best quality
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Simple and secure booking process with instant confirmation
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Prime Locations</h3>
              <p className="text-gray-600">
                Exclusive properties in the most beautiful beach locations
              </p>
            </div>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
} 