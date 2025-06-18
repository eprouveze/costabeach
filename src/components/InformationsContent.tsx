"use client";

import { useI18n } from "@/lib/i18n/client";

export function InformationsContent() {
  const { t } = useI18n();

  return (
    <div className="p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("common.information")}</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{t("landing.aboutDescription1")}</p>
        <p className="text-gray-700 dark:text-gray-300">{t("landing.aboutDescription2")}</p>
      </div>
    </div>
  );
}