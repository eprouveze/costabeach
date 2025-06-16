// Core exports
export * from './types';
export * from './core/translation-service';

// Provider exports
export * from './providers';

// Adapter exports
export * from './adapters/pdf';

// Utility exports
export * from './utils';

// Component exports
export { PDFTranslator } from './components/PDFTranslator';
export { FileUpload } from './components/FileUpload';
export { LanguageSelector } from './components/LanguageSelector';
export { ProviderSelector } from './components/ProviderSelector';
export { ProgressBar } from './components/ProgressBar';
export { TranslationResult } from './components/TranslationResult';

// Hook exports
export { useTranslation } from './hooks/useTranslation';

// API exports (for Next.js integration)
export { default as translateAPI } from './api/translate';
export { default as progressAPI } from './api/progress';
export { default as recoveryAPI } from './api/recovery';