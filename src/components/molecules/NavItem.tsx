"use client";

import React from 'react';
import Link from 'next/link';
import { Icon } from '../atoms/Icon';
import { Home, Building2, Settings, LucideIcon } from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  className?: string;
}

export const NavItem: React.FC<NavItemProps> = ({
  href,
  icon,
  label,
  isActive = false,
  className = '',
}) => {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-md transition-colors
        hover:bg-gray-100 dark:hover:bg-gray-700
        ${isActive ? 'bg-gray-100 dark:bg-gray-700' : ''}
        ${className}
      `}
    >
      <Icon 
        icon={icon}
        className={`${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
      />
      <span className={`${isActive ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-200'}`}>
        {label}
      </span>
    </Link>
  );
}; 