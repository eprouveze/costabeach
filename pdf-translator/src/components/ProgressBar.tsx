'use client';

import React from 'react';
import { TranslationPhase } from '../types';

interface ProgressBarProps {
  current: number;
  total: number;
  phase: TranslationPhase;
  message?: string;
}

const PHASE_LABELS = {
  initializing: 'Initializing...',
  extracting: 'Extracting text from PDF...',
  preparing: 'Preparing translation batches...',
  translating: 'Translating content...',
  validating: 'Validating translations...',
  applying: 'Applying translations to PDF...',
  completed: 'Translation completed!',
  error: 'Translation failed',
};

const PHASE_COLORS = {
  initializing: 'bg-gray-500',
  extracting: 'bg-blue-500',
  preparing: 'bg-yellow-500',
  translating: 'bg-green-500',
  validating: 'bg-purple-500',
  applying: 'bg-orange-500',
  completed: 'bg-green-600',
  error: 'bg-red-500',
};

export function ProgressBar({ current, total, phase, message }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const colorClass = PHASE_COLORS[phase];
  const label = message || PHASE_LABELS[phase];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {label}
        </span>
        <span className="text-sm text-gray-500">
          {percentage}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {total > 0 && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{current} of {total} items</span>
          {phase === 'translating' && (
            <span>
              {Math.max(0, total - current)} remaining
            </span>
          )}
        </div>
      )}
    </div>
  );
}