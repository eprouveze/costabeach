import { useTranslation } from "@/lib/i18n/server";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Locale } from "@/lib/i18n/config";

export default async function I18nExamplePage() {
  const { t, locale, isRTL } = await useTranslation();

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {t("common.language")} - {locale}
        </h1>

        <div className="flex justify-center mb-8">
          <LanguageSwitcher variant="buttons" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{t("common.documents")}</h2>
            <ul className="space-y-2">
              <li>
                <span className="font-medium">{t("documents.category")}:</span>{" "}
                {t("documents.categories.legal")}
              </li>
              <li>
                <span className="font-medium">{t("documents.language")}:</span>{" "}
                {locale === "fr" ? "Français" : "العربية"}
              </li>
              <li>
                <span className="font-medium">{t("documents.size")}:</span> 2.5 MB
              </li>
              <li>
                <span className="font-medium">{t("documents.uploadDate")}:</span>{" "}
                2023-05-15
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{t("auth.signIn")}</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("auth.email")}
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("auth.password")}
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                type="button"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                {t("auth.signIn")}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">{t("common.settings")}</h2>
          <p>
            <span className="font-medium">RTL Mode:</span>{" "}
            {isRTL ? t("common.success") : t("common.error")}
          </p>
          <p>
            <span className="font-medium">{t("common.language")}:</span>{" "}
            {locale === "fr" ? "Français" : "العربية"}
          </p>
        </div>
      </div>
    </div>
  );
} 