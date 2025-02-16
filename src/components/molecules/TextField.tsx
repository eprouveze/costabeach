"use client";

import React from 'react';
import { Input } from '../atoms/Input';
import { LucideIcon } from 'lucide-react';

interface TextFieldProps {
  label: string;
  name: string;
  type?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  value?: string;
  icon?: LucideIcon;
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
  icon: Icon,
  onChange,
}) => {
  const id = `field-${name}`;
  
  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <Input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full
            ${Icon ? 'pl-10' : 'pl-3'}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          `}
          required={required}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}; 