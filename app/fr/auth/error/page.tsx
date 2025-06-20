"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error") || "Unknown error";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 px-4">
      <Link
        href="/fr"
        className="group absolute left-4 top-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Retour
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 dark:text-red-500">
            Erreur d'Authentification
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">
            {error === "AccessDenied"
              ? "Accès refusé. Votre compte n'est pas encore approuvé."
              : "Une erreur s'est produite lors de l'authentification. Veuillez réessayer."}
          </p>
        </div>

        <div className="flex justify-center">
          <Link
            href="/fr/owner-login"
            className="rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 px-6 py-3 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30"
          >
            Réessayer
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ErrorContent />
    </Suspense>
  );
}