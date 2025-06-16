export interface TranslationElement {
  id: string;
  text: string;
  metadata?: {
    page?: number;
    fontSize?: number;
    fontFamily?: string;
    isBold?: boolean;
    isItalic?: boolean;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
}

export interface TranslationRequest {
  elements: Record<string, TranslationElement>;
  sourceLang: string;
  targetLang: string;
  provider: TranslationProvider;
  options?: TranslationOptions;
}

export interface TranslationOptions {
  quality?: 'draft' | 'standard' | 'professional';
  preserveFormatting?: boolean;
  glossary?: Record<string, string>;
  batchSize?: number;
  maxRetries?: number;
  timeout?: number;
  onProgress?: (progress: ProgressUpdate) => void;
}

export interface TranslationResult {
  translatedElements: Record<string, TranslationElement>;
  metadata: {
    totalElements: number;
    translatedElements: number;
    failedElements: number;
    executionTime: number;
    cost?: TranslationCost;
    errors?: TranslationError[];
  };
}

export interface TranslationCost {
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  currency: string;
  breakdown?: {
    provider: string;
    model: string;
    pricePerInputToken: number;
    pricePerOutputToken: number;
  };
}

export interface TranslationError {
  elementId: string;
  error: string;
  code?: string;
  retryable?: boolean;
}

export interface ProgressUpdate {
  current: number;
  total: number;
  percentage: number;
  phase: TranslationPhase;
  message?: string;
  estimatedTimeRemaining?: number;
}

export type TranslationPhase = 
  | 'initializing'
  | 'extracting'
  | 'preparing'
  | 'translating'
  | 'validating'
  | 'applying'
  | 'completed'
  | 'error';

export type TranslationProvider = 
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'deepl'
  | 'google';

export interface TranslationProviderConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  baseUrl?: string;
  headers?: Record<string, string>;
}

export interface DocumentAdapter<T> {
  extractText(document: T): Promise<Record<string, TranslationElement>>;
  applyTranslations(document: T, translations: Record<string, TranslationElement>): Promise<T>;
  validate(document: T): Promise<boolean>;
}

export interface TranslationModel {
  name: string;
  provider: TranslationProvider;
  translate(
    text: string,
    sourceLang: string,
    targetLang: string,
    options?: TranslationOptions
  ): Promise<string>;
  translateBatch(
    texts: string[],
    sourceLang: string,
    targetLang: string,
    options?: TranslationOptions
  ): Promise<string[]>;
  estimateCost(inputTokens: number, outputTokens: number): TranslationCost;
}

export interface BatchProcessingOptions {
  maxBatchSize: number;
  maxTokensPerBatch: number;
  delayBetweenBatches?: number;
  concurrentBatches?: number;
}

export interface QualityCheckResult {
  passed: boolean;
  issues: QualityIssue[];
  score: number;
}

export interface QualityIssue {
  type: 'length_mismatch' | 'format_mismatch' | 'untranslated' | 'placeholder_mismatch';
  severity: 'error' | 'warning' | 'info';
  elementId: string;
  description: string;
  original: string;
  translated: string;
}

export interface RecoveryState {
  id: string;
  timestamp: number;
  request: TranslationRequest;
  progress: ProgressUpdate;
  completedElements: string[];
  failedElements: string[];
  translatedElements: Record<string, TranslationElement>;
}