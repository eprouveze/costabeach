'use client';

import React from 'react';
import { formatDuration, formatBytes } from '../utils';

interface TranslationResultProps {
  result: {
    file: string; // Base64 encoded
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
  };
  onReset: () => void;
}

export function TranslationResult({ result, onReset }: TranslationResultProps) {
  const { file, filename, metadata } = result;
  
  const downloadFile = () => {
    const byteCharacters = atob(file);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const successRate = metadata.totalElements > 0 
    ? ((metadata.translatedElements / metadata.totalElements) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="h-8 w-8 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-green-800">
              Translation Completed!
            </h3>
            <p className="text-green-600">
              Your PDF has been successfully translated.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {metadata.translatedElements}
          </div>
          <div className="text-sm text-blue-500">
            Elements Translated
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {successRate}%
          </div>
          <div className="text-sm text-green-500">
            Success Rate
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {formatDuration(metadata.executionTime)}
          </div>
          <div className="text-sm text-purple-500">
            Processing Time
          </div>
        </div>

        {metadata.cost && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">
              ${metadata.cost.totalCost.toFixed(4)}
            </div>
            <div className="text-sm text-orange-500">
              Translation Cost
            </div>
          </div>
        )}
      </div>

      {metadata.cost && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Cost Breakdown</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Input Tokens:</span>
              <span className="font-medium ml-2">{metadata.cost.inputTokens.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Output Tokens:</span>
              <span className="font-medium ml-2">{metadata.cost.outputTokens.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {metadata.failedElements > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-yellow-800">
              {metadata.failedElements} elements could not be translated
            </span>
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={downloadFile}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Translated PDF
        </button>

        <button
          onClick={onReset}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Translate Another File
        </button>
      </div>
    </div>
  );
}