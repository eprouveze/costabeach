'use client';

import React, { useState } from 'react';
import { TranslationProvider } from '../types';
import { SUPPORTED_PROVIDERS, PROVIDER_MODELS } from '../providers';

interface ProviderSelectorProps {
  value: TranslationProvider;
  onChange: (provider: TranslationProvider) => void;
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  model?: string;
  onModelChange?: (model: string) => void;
}

const PROVIDER_INFO = {
  openai: {
    name: 'OpenAI',
    description: 'GPT models from OpenAI',
    placeholder: 'sk-...',
    keyLabel: 'OpenAI API Key',
  },
  anthropic: {
    name: 'Anthropic',
    description: 'Claude models from Anthropic',
    placeholder: 'sk-ant-...',
    keyLabel: 'Anthropic API Key',
  },
  gemini: {
    name: 'Google Gemini',
    description: 'Gemini models from Google',
    placeholder: 'AIza...',
    keyLabel: 'Google API Key',
  },
} as const;

export function ProviderSelector({
  value,
  onChange,
  apiKey,
  onApiKeyChange,
  model,
  onModelChange,
}: ProviderSelectorProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const currentProvider = PROVIDER_INFO[value];
  const availableModels = PROVIDER_MODELS[value];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Translation Provider
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as TranslationProvider)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SUPPORTED_PROVIDERS.map((provider) => (
            <option key={provider} value={provider}>
              {PROVIDER_INFO[provider].name} - {PROVIDER_INFO[provider].description}
            </option>
          ))}
        </select>
      </div>

      {onModelChange && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model
          </label>
          <select
            value={model || availableModels[0]}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableModels.map((modelName) => (
              <option key={modelName} value={modelName}>
                {modelName}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {currentProvider.keyLabel}
        </label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder={currentProvider.placeholder}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showApiKey ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L5.99 5.99m0 0L9.878 9.878m0 0a3 3 0 105.568 5.568m2.12-2.12L17.88 17.88M12 12a3 3 0 010 0" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Your API key is stored locally and never sent to our servers
        </p>
      </div>
    </div>
  );
}