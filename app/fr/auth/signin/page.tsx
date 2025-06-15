import NextAuthLoginForm from '@/components/auth/NextAuthLoginForm';
import PublicPageTemplate from '@/components/templates/PublicPageTemplate';
import { Suspense } from 'react';

export default function SignInPage() {
  return (
    <PublicPageTemplate>
      <Suspense fallback={<div>Loading...</div>}>
        <NextAuthLoginForm />
      </Suspense>
    </PublicPageTemplate>
  );
} 