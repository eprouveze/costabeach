import { Metadata } from "next";
import { useTranslation } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Privacy Policy - Costa Beach",
  description: "Privacy Policy for Costa Beach property management platform",
};

export default async function PrivacyPage() {
  const { t, locale } = await useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('privacy.title')}</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              {t('privacy.lastUpdated')}: {new Date().toLocaleDateString(locale)}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('privacy.sections.introduction.title')}</h2>
              <p className="text-gray-700 mb-4">
                {t('privacy.sections.introduction.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('privacy.sections.dataCollection.title')}</h2>
              <p className="text-gray-700 mb-4">
                {t('privacy.sections.dataCollection.content')}
              </p>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('privacy.sections.dataCollection.types.title')}</h3>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>{t('privacy.sections.dataCollection.types.personal')}</li>
                  <li>{t('privacy.sections.dataCollection.types.property')}</li>
                  <li>{t('privacy.sections.dataCollection.types.communication')}</li>
                  <li>{t('privacy.sections.dataCollection.types.usage')}</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('privacy.sections.dataUsage.title')}</h2>
              <p className="text-gray-700 mb-4">
                {t('privacy.sections.dataUsage.content')}
              </p>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('privacy.sections.dataUsage.purposes.title')}</h3>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>{t('privacy.sections.dataUsage.purposes.service')}</li>
                  <li>{t('privacy.sections.dataUsage.purposes.communication')}</li>
                  <li>{t('privacy.sections.dataUsage.purposes.legal')}</li>
                  <li>{t('privacy.sections.dataUsage.purposes.improvement')}</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('privacy.sections.dataSharing.title')}</h2>
              <p className="text-gray-700 mb-4">
                {t('privacy.sections.dataSharing.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('privacy.sections.dataRights.title')}</h2>
              <p className="text-gray-700 mb-4">
                {t('privacy.sections.dataRights.content')}
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>{t('privacy.sections.dataRights.rights.access')}</li>
                <li>{t('privacy.sections.dataRights.rights.rectification')}</li>
                <li>{t('privacy.sections.dataRights.rights.deletion')}</li>
                <li>{t('privacy.sections.dataRights.rights.portability')}</li>
                <li>{t('privacy.sections.dataRights.rights.objection')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('privacy.sections.dataSecurity.title')}</h2>
              <p className="text-gray-700 mb-4">
                {t('privacy.sections.dataSecurity.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('privacy.sections.contact.title')}</h2>
              <p className="text-gray-700 mb-4">
                {t('privacy.sections.contact.content')} {" "}
                <a href={`mailto:${t('privacy.sections.contact.email')}`} className="text-blue-600 hover:text-blue-800">
                  {t('privacy.sections.contact.email')}
                </a>
              </p>
              <p className="text-gray-700">
                {t('privacy.sections.contact.address')}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 