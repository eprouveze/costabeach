import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { I18nProvider } from '@/lib/i18n/client';
import MockTRPCProvider from '../../../.storybook/MockTRPCProvider';

/**
 * # Translation Service
 * 
 * The translation service provides capabilities for translating both text snippets 
 * and entire documents between English, French, and Arabic. This documentation covers
 * the implementation details and usage of this service.
 */

// Create a component for the Story
const TranslationServiceDemo = () => {
  const [text, setText] = React.useState('Hello world!');
  const [targetLanguage, setTargetLanguage] = React.useState('french');
  const [translationResult, setTranslationResult] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const translateText = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate translation results
      const translations: { [key: string]: string } = {
        'french': 'Bonjour le monde!',
        'arabic': 'مرحبا بالعالم!'
      };
      
      setTranslationResult(translations[targetLanguage] || 'Translation not available');
    } catch (error) {
      console.error('Translation error:', error);
      setTranslationResult('Translation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Translation Service</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Text Translation Demo</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="text-input">
              Text to Translate
            </label>
            <textarea
              id="text-input"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="language-select">
              Target Language
            </label>
            <select
              id="language-select"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              <option value="french">French</option>
              <option value="arabic">Arabic</option>
              <option value="english">English</option>
            </select>
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={translateText}
            disabled={loading}
          >
            {loading ? 'Translating...' : 'Translate'}
          </button>
          
          {translationResult && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <h3 className="text-md font-semibold mb-1">Translation:</h3>
              <p className={targetLanguage === 'arabic' ? 'text-right' : ''}>{translationResult}</p>
            </div>
          )}
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Key Features</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><span className="font-semibold">Multiple Languages:</span> Support for English, French, and Arabic</li>
            <li><span className="font-semibold">Text & Document:</span> Translate both text snippets and entire documents</li>
            <li><span className="font-semibold">Background Processing:</span> Long-running translations handled in the background</li>
            <li><span className="font-semibold">Translation Caching:</span> Improved performance through caching</li>
            <li><span className="font-semibold">DeepL Integration:</span> High-quality translations via DeepL API</li>
            <li><span className="font-semibold">Stateful Translation:</span> Track and monitor translation status</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-2xl font-semibold mb-4">Architecture</h2>
        <p className="mb-4">
          The translation service is built with a modular architecture that separates concerns and provides a clean API:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Client Layer</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>React hooks for text translation</li>
              <li>Document translation requests</li>
              <li>Translation status monitoring</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">API Layer</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>tRPC procedures for translation</li>
              <li>Translation status checking</li>
              <li>Rate limiting and caching</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Service Layer</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>DeepL API integration</li>
              <li>Background jobs with Inngest</li>
              <li>Document processing</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-2xl font-semibold mb-4">API Usage</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Text Translation</h3>
          <p className="mb-4">To translate text snippets in a client component:</p>
          <div className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto">
            <pre className="text-sm">
{`// In a React component
const handleTranslate = async (text, sourceLang, targetLang) => {
  try {
    // Simulating the API call that would use tRPC
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text, 
        sourceLanguage: sourceLang,
        targetLanguage: targetLang
      })
    });
    
    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};`}
            </pre>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Document Translation</h3>
          <p className="mb-4">To request a document translation:</p>
          <div className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto">
            <pre className="text-sm">
{`// In a React component
const requestDocumentTranslation = async (documentId, targetLang) => {
  try {
    // Simulating the API call that would use tRPC
    const response = await fetch('/api/translate-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        documentId, 
        targetLanguage: targetLang
      })
    });
    
    const data = await response.json();
    return data.status;
  } catch (error) {
    console.error('Document translation error:', error);
    throw error;
  }
};`}
            </pre>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Implementation Details</h2>
        
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Translation Caching</h3>
          <p>
            The service implements a two-level caching strategy to improve performance and reduce API calls:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><span className="font-semibold">In-memory cache:</span> Recent translations are stored in memory for ultra-fast retrieval</li>
            <li><span className="font-semibold">Database cache:</span> All translations are persisted to the database for long-term storage</li>
          </ul>
        </div>
        
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Background Processing</h3>
          <p>
            Document translations are processed in the background using Inngest to ensure a responsive user experience:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Translation requests are queued as Inngest events</li>
            <li>Background jobs process the translation asynchronously</li>
            <li>Users can monitor translation status while continuing to browse the site</li>
            <li>Completed translations trigger notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof TranslationServiceDemo> = {
  title: 'Documentation/TranslationService',
  component: TranslationServiceDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Documentation for the translation service, which provides capabilities for translating text and documents.',
      },
    },
  },
  decorators: [
    (Story) => (
      <MockTRPCProvider>
        <I18nProvider>
          <Story />
        </I18nProvider>
      </MockTRPCProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TranslationServiceDemo>;

export const Default: Story = {
  args: {},
}; 