/**
 * Translation Service Status Utilities
 * 
 * Provides functions to check if translation services are available
 * and handle graceful degradation when they're not configured.
 */

/**
 * Check if translation service is properly configured
 */
export function isTranslationServiceAvailable(): boolean {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  return !!(
    apiKey && 
    apiKey !== 'sk-ant-your-anthropic-api-key' && 
    !apiKey.includes('your-anthropic-api-key') &&
    apiKey.startsWith('sk-ant-')
  );
}

/**
 * Get translation service status with detailed information
 */
export function getTranslationServiceStatus(): {
  available: boolean;
  reason?: string;
  suggestion?: string;
} {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return {
      available: false,
      reason: 'API key not configured',
      suggestion: 'Set ANTHROPIC_API_KEY in your .env.local file'
    };
  }
  
  if (apiKey === 'sk-ant-your-anthropic-api-key' || apiKey.includes('your-anthropic-api-key')) {
    return {
      available: false,
      reason: 'API key is placeholder value',
      suggestion: 'Replace ANTHROPIC_API_KEY with a real API key from https://console.anthropic.com/'
    };
  }
  
  if (!apiKey.startsWith('sk-ant-')) {
    return {
      available: false,
      reason: 'Invalid API key format',
      suggestion: 'API key should start with "sk-ant-"'
    };
  }
  
  return { available: true };
}

/**
 * Get user-friendly error message for translation failures
 */
export function getTranslationErrorMessage(error: Error): string {
  const status = getTranslationServiceStatus();
  
  if (!status.available) {
    return `Translation service unavailable: ${status.reason}. ${status.suggestion}`;
  }
  
  // Handle specific API errors
  if (error.message.includes('401')) {
    return 'Translation failed: Invalid API key. Please check your Anthropic API key configuration.';
  }
  
  if (error.message.includes('429')) {
    return 'Translation failed: Rate limit exceeded. Please try again later.';
  }
  
  if (error.message.includes('timeout')) {
    return 'Translation failed: Request timed out. Please try again.';
  }
  
  return `Translation failed: ${error.message}`;
}

/**
 * Check if translation features should be enabled in the UI
 */
export function shouldShowTranslationFeatures(): boolean {
  // In development, always show features to allow testing
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // In production, only show if properly configured
  return isTranslationServiceAvailable();
}

/**
 * Get configuration instructions for users
 */
export function getTranslationSetupInstructions(): string {
  return `
To enable document translation features:

1. Get an Anthropic API key from https://console.anthropic.com/
2. Add it to your .env.local file:
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
3. Restart your development server

Run 'npm run translation:check-config' to verify your configuration.
`.trim();
}