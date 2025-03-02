import React from 'react';
import { Meta } from '@storybook/react';
import { I18nProvider } from '@/lib/i18n/client';

const meta: Meta = {
  title: 'Documentation/Translation Service',
  decorators: [
    (Story) => (
      <I18nProvider>
        <Story />
      </I18nProvider>
    ),
  ],
};

export default meta;

export const Documentation = () => {
  return (
    <div className="prose max-w-none">
      <h1>Translation Service</h1>

      <p>The Costa Beach HOA Portal includes a comprehensive translation service that allows for seamless translation of documents and text between supported languages.</p>

      <h2>Supported Languages</h2>

      <p>The system currently supports the following languages:</p>

      <ul>
        <li>French (primary language)</li>
        <li>Arabic</li>
        <li>English</li>
      </ul>

      <h2>Features</h2>

      <h3>Text Translation</h3>

      <p>The translation service can translate arbitrary text between any of the supported languages. This is useful for:</p>

      <ul>
        <li>Translating user-generated content</li>
        <li>Providing on-the-fly translations of UI elements</li>
        <li>Supporting multilingual communication</li>
      </ul>

      <h3>Document Translation</h3>

      <p>Documents can be translated between languages with the following capabilities:</p>

      <ul>
        <li>Automatic translation of document content for text-based files</li>
        <li>Translation of document metadata (title, description) for all file types</li>
        <li>Background processing for large documents</li>
        <li>Caching to avoid redundant translations</li>
      </ul>

      <h2>Technical Implementation</h2>

      <h3>DeepL Integration</h3>

      <p>The translation service uses DeepL's professional translation API to provide high-quality translations. The system:</p>

      <ol>
        <li>Uses DeepL's advanced neural machine translation technology</li>
        <li>Maintains formatting and structure of the original text</li>
        <li>Optimizes for natural, fluent translations in the target language</li>
        <li>Supports formality levels for appropriate tone in different contexts</li>
      </ol>

      <h3>DeepL API Parameters</h3>

      <p>The translation service leverages DeepL's API parameters for optimal results:</p>

      <ul>
        <li><strong>formality</strong>: Controls the level of formal language in the output (options: 'more', 'less', or 'default')</li>
        <li><strong>context</strong>: Can provide additional context to influence translation results without being translated itself</li>
      </ul>

      <h3>Caching System</h3>

      <p>To improve performance and reduce API costs, the translation service implements a caching system:</p>

      <ul>
        <li>Translations are cached in memory for 24 hours</li>
        <li>Cache keys are based on the source text and target language</li>
        <li>Long texts are truncated in the cache key to avoid memory issues</li>
      </ul>

      <h3>Background Processing</h3>

      <p>Document translations are processed in the background using Inngest:</p>

      <ol>
        <li>User requests a document translation</li>
        <li>System checks if translation already exists</li>
        <li>If not, a background job is created</li>
        <li>User can check translation status while processing</li>
        <li>Once complete, the translated document is available for viewing</li>
      </ol>

      <h2>Usage Examples</h2>

      <h3>Translating Text (Client-Side)</h3>

      <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
        <code className="language-tsx">
{`import { trpc } from '@/lib/trpc/react';

// In a React component
const { mutate, isLoading } = trpc.translations.translateText.useMutation();

const handleTranslate = () => {
  mutate({
    text: "Hello world",
    sourceLanguage: "english",
    targetLanguage: "french"
  }, {
    onSuccess: (data) => {
      console.log(data.translatedText); // "Bonjour le monde"
    }
  });
};`}
        </code>
      </pre>

      <h3>Requesting Document Translation</h3>

      <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
        <code className="language-tsx">
{`import { trpc } from '@/lib/trpc/react';

// In a React component
const { mutate } = trpc.translations.requestDocumentTranslation.useMutation();

const handleRequestTranslation = (documentId) => {
  mutate({
    documentId,
    targetLanguage: "arabic"
  }, {
    onSuccess: (data) => {
      if (data.status === "completed") {
        // Translation was already available
        showDocument(data.documentId);
      } else {
        // Translation is being processed
        showTranslationPending();
      }
    }
  });
};`}
        </code>
      </pre>

      <h3>Checking Translation Status</h3>

      <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
        <code className="language-tsx">
{`import { trpc } from '@/lib/trpc/react';

// In a React component
const { data, refetch } = trpc.translations.getTranslationStatus.useQuery({
  documentId: "doc-123",
  targetLanguage: "arabic"
});

// Poll for updates
useEffect(() => {
  if (data?.status === "pending") {
    const interval = setInterval(refetch, 5000);
    return () => clearInterval(interval);
  }
}, [data, refetch]);`}
        </code>
      </pre>

      <h3>Controlling Translation Formality</h3>

      <p>For languages that support formality levels (like German, French, Italian, etc.), you can specify the desired level:</p>

      <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
        <code className="language-tsx">
{`// In the translations router
const translatedText = await translateText(
  text,
  sourceLanguage,
  targetLanguage,
  { formality: 'more' } // For more formal translations
);`}
        </code>
      </pre>

      <h2>Best Practices</h2>

      <ol>
        <li><strong>Avoid Unnecessary Translations</strong>: Only translate content when needed to reduce API costs</li>
        <li><strong>Use Polling for Status Updates</strong>: When waiting for document translations, use polling rather than webhooks</li>
        <li><strong>Handle Errors Gracefully</strong>: Always provide fallback options if translations fail</li>
        <li><strong>Consider Content Size</strong>: Very large documents may take longer to translate</li>
        <li><strong>Respect Rate Limits</strong>: Be mindful of DeepL API rate limits when implementing translation features</li>
        <li><strong>Use Appropriate Formality</strong>: Select the right formality level based on the content type and audience</li>
        <li><strong>Provide Context</strong>: When translating domain-specific content, provide context to improve accuracy</li>
      </ol>
    </div>
  );
}; 