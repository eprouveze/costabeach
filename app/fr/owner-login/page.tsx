"use client";

import React, { Suspense } from "react";
import { signIn } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useEffect } from "react";

function SignInContent() {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams?.get("error") || null;
  const callbackUrl = searchParams?.get("callbackUrl") || "/fr/owner-dashboard";

  React.useEffect(() => {
    if (error) {
      toast.error(
        error === "AccessDenied"
          ? "Accès refusé. Assurez-vous d'avoir un compte approuvé."
          : "Une erreur est survenue lors de la connexion. Veuillez réessayer."
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
        toast.error("Échec de la connexion. Veuillez réessayer.");
      } else {
        toast.success("Vérifiez votre email pour le lien de connexion!");
        router.push("/auth/verify");
      }
    } catch (error) {
      toast.error("Une erreur inattendue s'est produite. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-neutral-50 px-4">
      <Link
        href="/fr"
        className="group absolute left-4 top-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Retour
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">
              Portail Propriétaire
            </span>
          </h1>
          <p className="mt-3 text-neutral-600">
            Connectez-vous pour accéder à vos documents et ressources
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700"
              >
                Adresse email
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
                  className="block w-full rounded-lg border border-neutral-300 px-4 py-3 text-neutral-900 placeholder-neutral-500 shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500"
                  placeholder="vous@exemple.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Envoi du lien..." : "Se connecter avec Email"}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-center text-sm text-neutral-600">
              Nouveau propriétaire ?{" "}
              <Link
                href="/fr/owner-register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                S'inscrire ici
              </Link>
            </p>
            <p className="mt-2 text-center text-sm text-neutral-600">
              En vous connectant, vous acceptez notre{" "}
              <Link
                href="/fr/privacy"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Politique de Confidentialité
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerLoginPageFr() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <SignInContent />
    </Suspense>
  );
} 