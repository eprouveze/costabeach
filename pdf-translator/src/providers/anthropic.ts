import Anthropic from '@anthropic-ai/sdk';
import { BaseTranslationModel } from './base';
import { TranslationProviderConfig, TranslationOptions, TranslationCost } from '../types';

export class AnthropicTranslationModel extends BaseTranslationModel {
  private client: Anthropic;
  private model: string;

  constructor(config: TranslationProviderConfig) {
    super('Anthropic', 'anthropic', config);
    this.validateConfig();
    
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      defaultHeaders: config.headers,
    });
    
    this.model = config.model || 'claude-3-5-sonnet-20241022';
  }

  async translate(
    text: string,
    sourceLang: string,
    targetLang: string,
    options?: TranslationOptions
  ): Promise<string> {
    return this.retryWithBackoff(async () => {
      const systemPrompt = this.buildSystemPrompt(sourceLang, targetLang, options);
      
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.config.maxTokens || 4096,
        temperature: this.config.temperature || 0.3,
        system: systemPrompt,
        messages: [
          { role: 'user', content: text }
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Anthropic');
      }

      return content.text;
    }, options?.maxRetries);
  }

  async translateBatch(
    texts: string[],
    sourceLang: string,
    targetLang: string,
    options?: TranslationOptions
  ): Promise<string[]> {
    // For batch translation, we'll create a structured prompt
    const systemPrompt = this.buildSystemPrompt(sourceLang, targetLang, options);
    
    // Process in chunks to avoid token limits
    const results: string[] = [];
    const chunkSize = 10; // Adjust based on text length
    
    for (let i = 0; i < texts.length; i += chunkSize) {
      const chunk = texts.slice(i, i + chunkSize);
      
      // Create a structured prompt for batch translation
      const batchPrompt = `Translate the following ${chunk.length} texts from ${sourceLang} to ${targetLang}. 
Return ONLY the translations, each on a new line, in the same order as provided.
Do not include numbers, bullets, or any other formatting.

Texts to translate:
${chunk.map((text, idx) => `[${idx + 1}] ${text}`).join('\n\n')}`;

      const response = await this.retryWithBackoff(async () => {
        const result = await this.client.messages.create({
          model: this.model,
          max_tokens: this.config.maxTokens || 4096,
          temperature: this.config.temperature || 0.3,
          system: systemPrompt,
          messages: [
            { role: 'user', content: batchPrompt }
          ],
        });

        const content = result.content[0];
        if (content.type !== 'text') {
          throw new Error('Unexpected response type from Anthropic');
        }

        return content.text;
      }, options?.maxRetries);

      // Parse the response
      const translations = response.split('\n').filter(line => line.trim());
      if (translations.length !== chunk.length) {
        // Fallback to individual translation if batch parsing fails
        for (const text of chunk) {
          const translated = await this.translate(text, sourceLang, targetLang, options);
          results.push(translated);
        }
      } else {
        results.push(...translations);
      }

      // Report progress
      if (options?.onProgress) {
        options.onProgress({
          current: Math.min(i + chunkSize, texts.length),
          total: texts.length,
          percentage: Math.min(((i + chunkSize) / texts.length) * 100, 100),
          phase: 'translating'
        });
      }
    }
    
    return results;
  }

  estimateCost(inputTokens: number, outputTokens: number): TranslationCost {
    // Pricing as of 2024 (prices per 1M tokens)
    const pricing = {
      'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
      'claude-3-5-haiku-20241022': { input: 1.00, output: 5.00 },
      'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
      'claude-3-sonnet-20240229': { input: 3.00, output: 15.00 },
      'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
    };

    const modelPricing = pricing[this.model as keyof typeof pricing] || pricing['claude-3-5-sonnet-20241022'];
    
    const inputCost = (inputTokens / 1_000_000) * modelPricing.input;
    const outputCost = (outputTokens / 1_000_000) * modelPricing.output;
    
    return {
      inputTokens,
      outputTokens,
      totalCost: inputCost + outputCost,
      currency: 'USD',
      breakdown: {
        provider: 'anthropic',
        model: this.model,
        pricePerInputToken: modelPricing.input / 1_000_000,
        pricePerOutputToken: modelPricing.output / 1_000_000,
      }
    };
  }
}