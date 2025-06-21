"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";

export default function PropertyDetailRedirectPage() {
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    // Redirect to the French locale version
    router.replace("/fr/property-detail");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg">{t("owner.propertyDetail.redirectingMessage")}</p>
    </div>
  );
} 