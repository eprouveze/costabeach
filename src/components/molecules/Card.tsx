"use client";

import React from 'react';
import { Heading } from '../atoms/Heading';
import { Paragraph } from '../atoms/Paragraph';

interface CardProps {
  title: string;
  description: string;
  imageUrl?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  imageUrl,
  className = '',
}) => {
  return (
    <div className={`rounded-lg shadow-md overflow-hidden bg-white dark:bg-gray-800 ${className}`}>
      {imageUrl && (
        <div className="relative h-48 w-full">
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      <div className="p-4">
        <Heading level="h3" className="mb-2">
          {title}
        </Heading>
        <Paragraph className="text-gray-600 dark:text-gray-300">
          {description}
        </Paragraph>
      </div>
    </div>
  );
}; 