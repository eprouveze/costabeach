import { 
  TranslationModel, 
  TranslationProvider, 
  TranslationProviderConfig, 
  TranslationOptions,
  TranslationCost 
} from '../types';

export abstract class BaseTranslationModel implements TranslationModel {
  public readonly name: string;
  public readonly provider: TranslationProvider;
  protected config: TranslationProviderConfig;

  constructor(name: string, provider: TranslationProvider, config: TranslationProviderConfig) {
    this.name = name;
    this.provider = provider;
    this.config = config;
  }

  abstract translate(
    text: string,
    sourceLang: string,
    targetLang: string,
    options?: TranslationOptions
  ): Promise<string>;

  abstract translateBatch(
    texts: string[],
    sourceLang: string,
    targetLang: string,
    options?: TranslationOptions
  ): Promise<string[]>;

  abstract estimateCost(inputTokens: number, outputTokens: number): TranslationCost;

  protected validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error(`API key is required for ${this.provider} provider`);
    }
  }

  protected async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  protected buildSystemPrompt(sourceLang: string, targetLang: string, options?: TranslationOptions): string {
    const qualityInstructions = {
      draft: 'Provide a quick, basic translation that conveys the general meaning.',
      standard: 'Provide an accurate translation that maintains the original meaning and tone.',
      professional: 'Provide a high-quality, polished translation suitable for professional use. Pay careful attention to nuance, tone, and cultural adaptation.'
    };

    const quality = options?.quality || 'standard';
    
    let prompt = `You are a professional translator. Translate the following text from ${sourceLang} to ${targetLang}.

${qualityInstructions[quality]}

Important instructions:
- Maintain the original formatting (line breaks, spacing, punctuation)
- Preserve any special characters, numbers, or codes exactly as they appear
- Do not add explanations or notes - return only the translation`;

    if (options?.preserveFormatting) {
      prompt += '\n- Pay special attention to preserving all formatting elements';
    }

    if (options?.glossary && Object.keys(options.glossary).length > 0) {
      prompt += '\n\nGlossary (use these specific translations for the following terms):';
      for (const [term, translation] of Object.entries(options.glossary)) {
        prompt += `\n- "${term}" → "${translation}"`;
      }
    }

    return prompt;
  }

  protected estimateTokens(text: string): number {
    // Simple estimation: ~4 characters per token
    // This is a rough estimate and should be overridden by providers with better tokenization
    return Math.ceil(text.length / 4);
  }
}