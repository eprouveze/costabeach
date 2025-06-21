/* OwnerLoginPage component */
"use client";

import React, { Suspense } from "react";
import { signIn } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";

function SignInContent() {
  const { t } = useI18n();
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams?.get("error") || null;
  const callbackUrl = searchParams?.get("callbackUrl") || "/owner-dashboard";

  React.useEffect(() => {
    if (error) {
      toast.error(
        error === "AccessDenied"
          ? t('toast.auth.accessDenied')
          : t('toast.auth.signInError')
      );
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn("email", {
        email,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        toast.error(t('toast.auth.signInFailed'));
      } else {
        toast.success(t('toast.auth.checkEmailForLink'));
        router.push("/auth/verify");
      }
    } catch (error) {
      toast.error(t('toast.auth.unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-neutral-50 px-4">
      <Link
        href="/"
        className="group absolute left-4 top-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        {t("owner.login.backToHome")}
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
              {t("owner.login.title")}
            </span>
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">
            {t("owner.login.subtitle")}
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                {t("owner.login.emailLabel")}
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-600 px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder={t("owner.login.emailPlaceholder")}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t("owner.login.sendingLinkButton") : t("owner.login.signInButton")}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              {t("owner.login.newOwner")}{" "}
              <Link
                href="/owner-register"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                {t("owner.login.registerLink")}
              </Link>
            </p>
            <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
              {t("owner.login.privacyText")}{" "}
              <Link
                href="/privacy"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                {t("owner.login.privacyLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerLoginRedirectPage() {
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    // Redirect to the French locale version
    router.replace("/fr/owner-login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg">{t("owner.login.redirectingMessage")}</p>
    </div>
  );
} 