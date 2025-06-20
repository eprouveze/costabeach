"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PublicPageTemplate from '@/components/templates/PublicPageTemplate';
import { useI18n } from '@/lib/i18n/client';
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import RTLWrapper from '@/components/RTLWrapper';
import { getIconMarginClass } from '@/lib/utils/rtl';
import RTLText from '@/components/RTLText';

export default function ContactPage() {
  const { t, locale, isLoading } = useI18n();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('');
  
  // Get the appropriate icon margin class based on locale
  const iconMarginClass = getIconMarginClass(locale);
  
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
      <PublicPageTemplate>
        <div className="py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl">{t('common.loading')}</p>
          </div>
        </div>
      </PublicPageTemplate>
    );
  }

  // Get appropriate label text based on locale
  const getLocalizedLabels = () => {
    if (locale === 'fr') {
      return {
        address: 'Adresse',
        phone: 'Téléphone',
        email: 'Email',
        hours: 'Heures d\'ouverture'
      };
    } else if (locale === 'ar') {
      return {
        address: 'العنوان',
        phone: 'الهاتف',
        email: 'البريد الإلكتروني',
        hours: 'ساعات العمل'
      };
    } else {
      return {
        address: 'Address',
        phone: 'Phone',
        email: 'Email',
        hours: 'Office Hours'
      };
    }
  };

  const labels = getLocalizedLabels();

  return (
    <PublicPageTemplate>
      {/* Contact Page Header */}
      <div className="py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-700 dark:text-blue-400 mb-2">
          {t('contact.title')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto mb-8">
          {t('contact.description')}
        </p>
        
        {/* Contact Form and Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border-t-4 border-blue-600">
            <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-400">{t("contact.submit")}</h2>
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-300 text-lg"
              >
                {t("contact.submit")}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-400">{t("contact.contactInfo.title")}</h2>
            
            <RTLWrapper applyTextAlign={true} applyFlexDirection={true} applyListStyle={true} className="space-y-6">
              <div className="flex items-start">
                <MapPin className={`w-6 h-6 text-blue-600 mt-1 ${iconMarginClass}`} />
                <div>
                  <p className="font-medium text-lg">{labels.address}</p>
                  <RTLText className="text-gray-600 dark:text-gray-300">
                    {t("contact.contactInfo.address")}
                  </RTLText>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className={`w-6 h-6 text-blue-600 mt-1 ${iconMarginClass}`} />
                <div>
                  <p className="font-medium text-lg">{labels.email}</p>
                  <RTLText className="text-gray-600 dark:text-gray-300">
                    {t("contact.contactInfo.email")}
                  </RTLText>
                </div>
              </div>
              
            </RTLWrapper>
            
            <div className="mt-8">
              <div className="aspect-w-16 aspect-h-9">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3302.4!2d-7.1617!3d33.7867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda76b871f50c5c1%3A0x8f8c1e2d3a4b5c6d!2sCosta%20Beach%203%2C%20Bouznika%2C%20Morocco!5e0!3m2!1sen!2sus!4v1651234567890!5m2!1sen!2sus" 
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
    </PublicPageTemplate>
  );
} 