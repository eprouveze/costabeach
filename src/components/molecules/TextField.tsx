"use client";

import React from 'react';
import { Input } from '../atoms/Input';

interface TextFieldProps {
  label: string;
  name: string;
  type?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  name,
  type = 'text',
  error,
  required = false,
  placeholder,
  className = '',
  value,
  onChange,
}) => {
  const id = `field-${name}`;
  
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <label 
        htmlFor={id}
        className="text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={error ? 'border-red-500' : ''}
        required={required}
      />
      
      {error && (
        <p className="text-sm text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}; 