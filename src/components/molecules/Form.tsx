"use client";

import React from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';

interface FormProps {
  onSubmit: (data: any) => void;
  buttonText: string;
  children?: React.ReactNode;
  className?: string;
}

export const Form: React.FC<FormProps> = ({
  onSubmit,
  buttonText,
  children,
  className = '',
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    onSubmit(data);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`flex flex-col space-y-4 ${className}`}
    >
      {children}
      <Button type="submit">
        {buttonText}
      </Button>
    </form>
  );
}; 