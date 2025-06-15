"use client";

import { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";

interface PublicPageTemplateProps {
  children: ReactNode;
}

export default function PublicPageTemplate({ children }: PublicPageTemplateProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <ToastContainer position="top-right" />
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 