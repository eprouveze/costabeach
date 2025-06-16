import OpenAI from 'openai';
import { BaseTranslationModel } from './base';
import { TranslationProviderConfig, TranslationOptions, TranslationCost } from '../types';

export class OpenAITranslationModel extends BaseTranslationModel {
  private client: OpenAI;
  private model: string;

  constructor(config: TranslationProviderConfig) {
    super('OpenAI', 'openai', config);
    this.validateConfig();
    
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      defaultHeaders: config.headers,
    });
    
    this.model = config.model || 'gpt-4o-mini';
  }

  async translate(
    text: string,
    sourceLang: string,
    targetLang: string,
    options?: TranslationOptions
  ): Promise<string> {
    return this.retryWithBackoff(async () => {
      const systemPrompt = this.buildSystemPrompt(sourceLang, targetLang, options);
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: this.config.temperature || 0.3,
        max_tokens: this.config.maxTokens,
      });

      const translated = response.choices[0]?.message?.content;
      if (!translated) {
        throw new Error('No translation returned from OpenAI');
      }

      return translated;
    }, options?.maxRetries);
  }

  async translateBatch(
    texts: string[],
    sourceLang: string,
    targetLang: string,
    options?: TranslationOptions
  ): Promise<string[]> {
    const systemPrompt = this.buildSystemPrompt(sourceLang, targetLang, options);
    
    // For batch translation, we'll process in parallel with rate limiting
    const batchSize = options?.batchSize || 5;
    const results: string[] = new Array(texts.length);
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map((text, index) => 
        this.translate(text, sourceLang, targetLang, options)
          .then(result => ({ index: i + index, result }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ index, result }) => {
        results[index] = result;
      });

      // Report progress if callback provided
      if (options?.onProgress) {
        options.onProgress({
          current: Math.min(i + batchSize, texts.length),
          total: texts.length,
          percentage: Math.min(((i + batchSize) / texts.length) * 100, 100),
          phase: 'translating'
        });
      }
    }
    
    return results;
  }

  estimateCost(inputTokens: number, outputTokens: number): TranslationCost {
    // Pricing as of 2024 (prices per 1M tokens)
    const pricing = {
      'gpt-4o': { input: 2.50, output: 10.00 },
      'gpt-4o-mini': { input: 0.15, output: 0.60 },
      'gpt-4-turbo': { input: 10.00, output: 30.00 },
      'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
    };

    const modelPricing = pricing[this.model as keyof typeof pricing] || pricing['gpt-4o-mini'];
    
    const inputCost = (inputTokens / 1_000_000) * modelPricing.input;
    const outputCost = (outputTokens / 1_000_000) * modelPricing.output;
    
    return {
      inputTokens,
      outputTokens,
      totalCost: inputCost + outputCost,
      currency: 'USD',
      breakdown: {
        provider: 'openai',
        model: this.model,
        pricePerInputToken: modelPricing.input / 1_000_000,
        pricePerOutputToken: modelPricing.output / 1_000_000,
      }
    };
  }
}