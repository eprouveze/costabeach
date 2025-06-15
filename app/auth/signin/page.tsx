"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import NextAuthLoginForm from '@/components/auth/NextAuthLoginForm';
import PublicPageTemplate from '@/components/templates/PublicPageTemplate';
import { Suspense } from 'react';

export default function SignInRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the default language sign-in page
    router.push("/en/auth/signin");
  }, [router]);

  return (
    <PublicPageTemplate>
      <Suspense fallback={<div>Loading...</div>}>
        <NextAuthLoginForm />
      </Suspense>
    </PublicPageTemplate>
  );
} 