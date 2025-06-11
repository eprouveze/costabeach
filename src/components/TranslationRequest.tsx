// Translation Request Component
// React component for requesting document translations

import React, { useState } from 'react';

interface Document {
  id: string;
  title: string;
  category: string;
  language: string;
}

interface Translation {
  id: string;
  status: string;
  estimated_cost_cents?: number;
}

interface TranslationRequestProps {
  document: Document;
  onSuccess?: (translation: Translation) => void;
  onError?: (error: string) => void;
}

// Language options
const LANGUAGES = [
  { code: 'french', name: 'French' },
  { code: 'arabic', name: 'Arabic' },
];

export function TranslationRequest({ document, onSuccess, onError }: TranslationRequestProps) {
  const [targetLanguage, setTargetLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<Translation | null>(null);

  // Get available target languages (exclude source language)
  const availableLanguages = LANGUAGES.filter(lang => lang.code !== document.language);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!targetLanguage) {
      setError('Please select a target language');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: document.id,
          source_language: document.language,
          target_language: targetLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request translation');
      }

      setSuccess(data.translation);
      onSuccess?.(data.translation);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCost = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (success) {
    return (
      <div className="translation-request-success">
        <h3>Translation Requested Successfully</h3>
        <p>Translation ID: {success.id}</p>
        <p>Status: {success.status}</p>
        {success.estimated_cost_cents && (
          <p>Estimated cost: {formatCost(success.estimated_cost_cents)}</p>
        )}
      </div>
    );
  }

  return (
    <div className="translation-request-form">
      <h3>Request Translation</h3>
      <p>Document: {document.title}</p>
      <p>Source language: {document.language}</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="target-language">Target Language:</label>
          <select
            id="target-language"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Select target language</option>
            {availableLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !targetLanguage}
          className="submit-button"
        >
          {isLoading ? 'Requesting translation...' : 'Request Translation'}
        </button>
      </form>
    </div>
  );
}