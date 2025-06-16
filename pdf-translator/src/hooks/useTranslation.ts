'use client';

import { useState, useCallback } from 'react';
import { TranslationProvider, ProgressUpdate, TranslationOptions } from '../types';

interface TranslateParams {
  file: File;
  sourceLang: string;
  targetLang: string;
  provider: TranslationProvider;
  apiKey: string;
  model?: string;
  quality?: TranslationOptions['quality'];
}

interface TranslationResult {
  file: string;
  filename: string;
  metadata: {
    totalElements: number;
    translatedElements: number;
    failedElements: number;
    executionTime: number;
    cost?: {
      totalCost: number;
      currency: string;
      inputTokens: number;
      outputTokens: number;
    };
  };
}

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (data:application/pdf;base64,)
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }, []);

  const translate = useCallback(async (params: TranslateParams) => {
    setIsTranslating(true);
    setProgress(null);
    setResult(null);
    setError(null);

    try {
      // Convert file to base64
      setProgress({
        current: 0,
        total: 100,
        percentage: 5,
        phase: 'initializing',
        message: 'Preparing file...'
      });

      const fileBase64 = await fileToBase64(params.file);

      setProgress({
        current: 10,
        total: 100,
        percentage: 10,
        phase: 'extracting',
        message: 'Uploading and processing...'
      });

      // Send translation request
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: fileBase64,
          filename: params.file.name,
          sourceLang: params.sourceLang,
          targetLang: params.targetLang,
          provider: params.provider,
          apiKey: params.apiKey,
          model: params.model,
          quality: params.quality,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Translation failed');
      }

      // Simulate progress updates for better UX
      const progressSteps = [
        { percentage: 20, phase: 'extracting' as const, message: 'Extracting text from PDF...' },
        { percentage: 30, phase: 'preparing' as const, message: 'Preparing translation batches...' },
        { percentage: 70, phase: 'translating' as const, message: 'Translating content...' },
        { percentage: 85, phase: 'validating' as const, message: 'Validating translations...' },
        { percentage: 95, phase: 'applying' as const, message: 'Generating translated PDF...' },
      ];

      for (const step of progressSteps) {
        setProgress({
          current: step.percentage,
          total: 100,
          percentage: step.percentage,
          phase: step.phase,
          message: step.message,
        });
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const data = await response.json();

      setProgress({
        current: 100,
        total: 100,
        percentage: 100,
        phase: 'completed',
        message: 'Translation completed!'
      });

      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      setProgress({
        current: 0,
        total: 100,
        percentage: 0,
        phase: 'error',
        message: errorMessage
      });
    } finally {
      setIsTranslating(false);
    }
  }, [fileToBase64]);

  const reset = useCallback(() => {
    setIsTranslating(false);
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  return {
    translate,
    isTranslating,
    progress,
    result,
    error,
    reset,
  };
}