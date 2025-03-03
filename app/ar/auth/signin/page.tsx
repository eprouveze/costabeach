import LoginForm from '@/components/auth/LoginForm';
import PublicPageTemplate from '@/components/templates/PublicPageTemplate';
import { Suspense } from 'react';

export default function SignInPage() {
  return (
    <PublicPageTemplate>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </PublicPageTemplate>
  );
} 