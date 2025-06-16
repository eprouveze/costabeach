import { TranslationModel, TranslationProvider, TranslationProviderConfig } from '../types';
import { OpenAITranslationModel } from './openai';
import { AnthropicTranslationModel } from './anthropic';
import { GeminiTranslationModel } from './gemini';

export { BaseTranslationModel } from './base';
export { OpenAITranslationModel } from './openai';
export { AnthropicTranslationModel } from './anthropic';
export { GeminiTranslationModel } from './gemini';

export function createTranslationModel(
  provider: TranslationProvider,
  config: TranslationProviderConfig
): TranslationModel {
  switch (provider) {
    case 'openai':
      return new OpenAITranslationModel(config);
    case 'anthropic':
      return new AnthropicTranslationModel(config);
    case 'gemini':
      return new GeminiTranslationModel(config);
    case 'deepl':
    case 'google':
      throw new Error(`Provider ${provider} is not yet implemented`);
    default:
      throw new Error(`Unknown translation provider: ${provider}`);
  }
}

export const SUPPORTED_PROVIDERS: TranslationProvider[] = [
  'openai',
  'anthropic',
  'gemini'
];

export const PROVIDER_MODELS = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ],
  gemini: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro']
} as const;