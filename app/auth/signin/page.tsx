"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from '@/components/auth/LoginForm';
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
        <LoginForm />
      </Suspense>
    </PublicPageTemplate>
  );
} 