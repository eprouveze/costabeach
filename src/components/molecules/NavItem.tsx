"use client";

import React from 'react';
import Link from 'next/link';
import { Icon } from '../atoms/Icon';
import { Home, Building2, Settings, LucideIcon } from 'lucide-react';

interface NavItemProps {
  href?: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({
  href,
  icon,
  label,
  isActive = false,
  className = '',
  onClick,
}) => {
  const commonClassNames = `
    flex items-center gap-2 px-4 py-2 rounded-md transition-colors
    hover:bg-gray-100 dark:hover:bg-gray-800
    ${isActive ? 'bg-gray-100 dark:bg-gray-800' : ''}
    ${className}
  `;

  if (href) {
    return (
      <Link
        href={href}
        className={commonClassNames}
      >
        <Icon 
          icon={icon}
          className={`${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
        />
        <span className={`${isActive ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
          {label}
        </span>
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={commonClassNames}
    >
      <Icon 
        icon={icon}
        className={`${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
      />
      <span className={`${isActive ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
        {label}
      </span>
    </button>
  );
}; 