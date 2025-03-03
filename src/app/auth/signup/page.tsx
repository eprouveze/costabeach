import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Sign Up | Costa Beach',
  description: 'Create a new Costa Beach account',
};

export default function SignUpPage() {
  return <RegisterForm />;
}