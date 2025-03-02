"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PublicLandingTemplate from '@/components/templates/PublicLandingTemplate';
import { useI18n } from '@/lib/i18n/client';
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function ContactPage() {
  const { t, locale, isLoading } = useI18n();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('');
  
  // Debug translations
  useEffect(() => {
    console.log('[ContactPage] Current locale:', locale);
    console.log('[ContactPage] Is loading translations:', isLoading);
    console.log('[ContactPage] Contact title translation:', t('contact.title'));
    console.log('[ContactPage] Contact description translation:', t('contact.description'));
  }, [locale, isLoading, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation
    if (!name || !email || !subject || !message || !department) {
      // Show validation errors
      if (!name) document.getElementById('name-error')?.classList.remove('hidden');
      if (!email) document.getElementById('email-error')?.classList.remove('hidden');
      if (!subject) document.getElementById('subject-error')?.classList.remove('hidden');
      if (!message) document.getElementById('message-error')?.classList.remove('hidden');
      if (!department) document.getElementById('department-error')?.classList.remove('hidden');
      return;
    }
    
    toast.success(t('contact.messageSent'));
    setEmail('');
    setMessage('');
    setName('');
    setSubject('');
    setDepartment('');
  };

  // Show loading state while translations are loading
  if (isLoading) {
    return (
      <PublicLandingTemplate>
        <div className="py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl">{t('common.loading')}</p>
          </div>
        </div>
      </PublicLandingTemplate>
    );
  }

  return (
    <PublicLandingTemplate>
      {/* Contact Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('contact.title')}</h1>
          <p className="text-xl max-w-2xl mx-auto">
            {t('contact.description')}
          </p>
        </div>
      </section>
      
      {/* Contact Form and Info Section */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold mb-6">{t("contact.submit")}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    {t("contact.name")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                    aria-describedby="name-error"
                  />
                  <div id="name-error" className="text-red-500 text-sm mt-1 hidden">
                    {t("contact.validation.nameRequired")}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    {t("contact.email")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                    aria-describedby="email-error"
                  />
                  <div id="email-error" className="text-red-500 text-sm mt-1 hidden">
                    {t("contact.validation.emailRequired")}
                  </div>
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium mb-2">
                    {t("contact.department")}
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                    aria-describedby="department-error"
                  >
                    <option value="">-- {t("contact.departments.general")} --</option>
                    <option value="management">{t("contact.departments.management")}</option>
                    <option value="maintenance">{t("contact.departments.maintenance")}</option>
                    <option value="financial">{t("contact.departments.financial")}</option>
                    <option value="legal">{t("contact.departments.legal")}</option>
                  </select>
                  <div id="department-error" className="text-red-500 text-sm mt-1 hidden">
                    {t("contact.validation.departmentRequired")}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    {t("contact.subject")}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                    aria-describedby="subject-error"
                  />
                  <div id="subject-error" className="text-red-500 text-sm mt-1 hidden">
                    {t("contact.validation.subjectRequired")}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    {t("contact.message")}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                    aria-describedby="message-error"
                  ></textarea>
                  <div id="message-error" className="text-red-500 text-sm mt-1 hidden">
                    {t("contact.validation.messageRequired")}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
                >
                  {t("contact.submit")}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold mb-6">{t("contact.contactInfo.title")}</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-600 dark:text-gray-300">{t("contact.contactInfo.address")}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600 dark:text-gray-300">{t("contact.contactInfo.phone")}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600 dark:text-gray-300">{t("contact.contactInfo.email")}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium">Hours</p>
                    <p className="text-gray-600 dark:text-gray-300">{t("contact.contactInfo.hours")}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <div className="aspect-w-16 aspect-h-9">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.846981346114!2d-7.6982423!3d33.5731426!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7d319f41e5d2b%3A0x76a7661e7e9a25af!2sCasablanca%2C%20Morocco!5e0!3m2!1sen!2sus!4v1651234567890!5m2!1sen!2sus" 
                    width="100%" 
                    height="250" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Costa Beach 3 Location"
                    className="rounded-md"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLandingTemplate>
  );
} 