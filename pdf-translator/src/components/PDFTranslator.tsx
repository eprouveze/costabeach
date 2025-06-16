'use client';

import React, { useState, useCallback } from 'react';
import { FileUpload } from './FileUpload';
import { LanguageSelector } from './LanguageSelector';
import { ProviderSelector } from './ProviderSelector';
import { ProgressBar } from './ProgressBar';
import { TranslationResult } from './TranslationResult';
import { useTranslation } from '../hooks/useTranslation';
import { TranslationProvider, TranslationOptions } from '../types';

export function PDFTranslator() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [provider, setProvider] = useState<TranslationProvider>('openai');
  const [apiKey, setApiKey] = useState('');
  const [quality, setQuality] = useState<TranslationOptions['quality']>('standard');
  
  const {
    translate,
    isTranslating,
    progress,
    result,
    error,
    reset
  } = useTranslation();

  const handleTranslate = useCallback(async () => {
    if (!file || !apiKey) {
      alert('Please select a file and enter your API key');
      return;
    }

    await translate({
      file,
      sourceLang,
      targetLang,
      provider,
      apiKey,
      quality,
    });
  }, [file, sourceLang, targetLang, provider, apiKey, quality, translate]);

  const handleReset = useCallback(() => {
    setFile(null);
    reset();
  }, [reset]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">PDF Translator</h1>
        
        {!isTranslating && !result && (
          <>
            <FileUpload
              onFileSelect={setFile}
              acceptedFormats={['.pdf']}
              maxSize={50 * 1024 * 1024} // 50MB
            />
            
            {file && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <LanguageSelector
                    label="Source Language"
                    value={sourceLang}
                    onChange={setSourceLang}
                  />
                  <LanguageSelector
                    label="Target Language"
                    value={targetLang}
                    onChange={setTargetLang}
                  />
                </div>
                
                <ProviderSelector
                  value={provider}
                  onChange={setProvider}
                  apiKey={apiKey}
                  onApiKeyChange={setApiKey}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Translation Quality
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as TranslationOptions['quality'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft - Fast and basic</option>
                    <option value="standard">Standard - Balanced quality</option>
                    <option value="professional">Professional - Highest quality</option>
                  </select>
                </div>
                
                <button
                  onClick={handleTranslate}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Translate PDF
                </button>
              </div>
            )}
          </>
        )}
        
        {isTranslating && progress && (
          <div className="space-y-4">
            <ProgressBar
              current={progress.current}
              total={progress.total}
              phase={progress.phase}
              message={progress.message}
            />
            <p className="text-center text-gray-600">
              {progress.message || `${progress.phase}...`}
            </p>
          </div>
        )}
        
        {result && (
          <TranslationResult
            result={result}
            onReset={handleReset}
          />
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-red-800 font-semibold">Translation Error</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={handleReset}
              className="mt-3 text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}