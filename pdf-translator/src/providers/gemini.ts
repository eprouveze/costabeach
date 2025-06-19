import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseTranslationModel } from './base';
import { TranslationProviderConfig, TranslationOptions, TranslationCost } from '../types';

export class GeminiTranslationModel extends BaseTranslationModel {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(config: TranslationProviderConfig) {
    super('Gemini', 'gemini', config);
    this.validateConfig();
    
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || 'gemini-1.5-flash';
  }

  async translate(
    text: string,
    sourceLang: string,
    targetLang: string,
    options?: TranslationOptions
  ): Promise<string> {
    return this.retryWithBackoff(async () => {
      const systemPrompt = this.buildSystemPrompt(sourceLang, targetLang, options);
      const generativeModel = this.client.getGenerativeModel({ 
        model: this.model,
        generationConfig: {
          temperature: this.config.temperature || 0.3,
          maxOutputTokens: this.config.maxTokens,
        }
      });

      const prompt = `${systemPrompt}\n\nText to translate:\n${text}`;
      const result = await generativeModel.generateContent(prompt);
      const response = await result.response;
      const translated = response.text();

      if (!translated) {
        throw new Error('No translation returned from Gemini');
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
    const generativeModel = this.client.getGenerativeModel({ 
      model: this.model,
      generationConfig: {
        temperature: this.config.temperature || 0.3,
        maxOutputTokens: this.config.maxTokens,
      }
    });

    const results: string[] = [];
    const chunkSize = 15; // Gemini can handle larger batches
    
    for (let i = 0; i < texts.length; i += chunkSize) {
      const chunk = texts.slice(i, i + chunkSize);
      
      const batchPrompt = `${systemPrompt}

Translate the following ${chunk.length} texts from ${sourceLang} to ${targetLang}.
Return ONLY the translations, each on a new line, in the same order as provided.

Texts to translate:
${chunk.map((text, idx) => `[${idx + 1}] ${text}`).join('\n\n')}`;

      try {
        const result = await generativeModel.generateContent(batchPrompt);
        const response = await result.response;
        const batchTranslation = response.text();
        
        // Parse the response
        const translations = batchTranslation.split('\n').filter(line => line.trim());
        
        if (translations.length !== chunk.length) {
          // Fallback to individual translation
          for (const text of chunk) {
            const translated = await this.translate(text, sourceLang, targetLang, options);
            results.push(translated);
          }
        } else {
          results.push(...translations);
        }
      } catch (error) {
        // If batch fails, fall back to individual translation
        for (const text of chunk) {
          const translated = await this.translate(text, sourceLang, targetLang, options);
          results.push(translated);
        }
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
      'gemini-1.5-pro': { 
        input: 1.25, // Under 128K context
        output: 5.00 
      },
      'gemini-1.5-flash': { 
        input: 0.075, // Under 128K context
        output: 0.30 
      },
      'gemini-1.0-pro': { 
        input: 0.50, 
        output: 1.50 
      },
    };

    const modelKey = Object.keys(pricing).find(key => this.model.includes(key)) || 'gemini-1.5-flash';
    const modelPricing = pricing[modelKey as keyof typeof pricing];
    
    const inputCost = (inputTokens / 1_000_000) * modelPricing.input;
    const outputCost = (outputTokens / 1_000_000) * modelPricing.output;
    
    return {
      inputTokens,
      outputTokens,
      totalCost: inputCost + outputCost,
      currency: 'USD',
      breakdown: {
        provider: 'gemini',
        model: this.model,
        pricePerInputToken: modelPricing.input / 1_000_000,
        pricePerOutputToken: modelPricing.output / 1_000_000,
      }
    };
  }
}