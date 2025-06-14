"use client";

import React from "react";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 px-4">
      <Link
        href="/fr/owner-login"
        className="group absolute left-4 top-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Retour à la connexion
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Vérifiez votre email
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">
            Un lien de connexion a été envoyé à votre adresse email. Cliquez sur le lien pour continuer.
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-8 shadow-xl">
          <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Le lien expirera dans 24 heures. Si vous ne voyez pas l'email, vérifiez votre dossier spam.
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Besoin d'aide ?{" "}
              <Link
                href="/fr/contact"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                Contacter le Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}