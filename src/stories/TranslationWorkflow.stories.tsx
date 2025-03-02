import React from 'react';
import { Meta } from '@storybook/react';

const meta: Meta = {
  title: 'Documentation/Translation Workflow',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Documentation = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Document Translation Workflow</h1>
      
      <p className="mb-4">
        The Costa Beach HOA Portal supports document translation between English, French, and Arabic languages.
        This documentation explains how the translation workflow functions and how users can interact with it.
      </p>
      
      <h2 className="text-2xl font-semibold mt-8 mb-4">Translation Request Process</h2>
      
      <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg mb-8">
        <h3 className="text-xl font-semibold mb-4">User Flow</h3>
        <ol className="list-decimal pl-6 space-y-2">
          <li>User views a document in a language different from their preferred language</li>
          <li>User clicks the "Request Translation" button in the document viewer</li>
          <li>System checks if a translation already exists</li>
          <li>If no translation exists, a background job is created</li>
          <li>User receives confirmation that translation is in progress</li>
          <li>User can continue browsing while translation is processed</li>
          <li>Once complete, the translated document becomes available</li>
        </ol>
      </div>
      
      <h2 className="text-2xl font-semibold mt-8 mb-4">Technical Implementation</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Client-Side Components</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>DocumentPreview</strong>: Displays document content and translation request button</li>
            <li><strong>DocumentCard</strong>: Shows document metadata with translation status</li>
            <li><strong>useDocuments Hook</strong>: Manages document operations including translation requests</li>
          </ul>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Server-Side Components</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>translationsRouter</strong>: Handles translation requests and status checks</li>
            <li><strong>Inngest Functions</strong>: Processes document translations in the background</li>
            <li><strong>DeepL Integration</strong>: Translates document content using the DeepL API</li>
          </ul>
        </div>
      </div>
      
      <h2 className="text-2xl font-semibold mt-8 mb-4">Translation Status</h2>
      
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-4 text-left">UI Indicator</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td className="py-3 px-4">None</td>
              <td className="py-3 px-4">No translation has been requested</td>
              <td className="py-3 px-4">Translation request button is available</td>
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td className="py-3 px-4">Pending</td>
              <td className="py-3 px-4">Translation has been requested and is in progress</td>
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                  <span>Translation in progress indicator</span>
                </div>
              </td>
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td className="py-3 px-4">Completed</td>
              <td className="py-3 px-4">Translation is complete and available</td>
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  <span>Translation available indicator</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <h2 className="text-2xl font-semibold mt-8 mb-4">Background Processing</h2>
      
      <p className="mb-4">
        Document translations are processed in the background using Inngest to ensure a smooth user experience:
      </p>
      
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-8">
        <h3 className="text-xl font-semibold mb-4">Inngest Workflow</h3>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Translation request creates a <code>document/translate</code> event</li>
          <li>Inngest function processes the event asynchronously</li>
          <li>Document content is retrieved and sent to DeepL for translation</li>
          <li>Translated content is saved as a new document with relationship to original</li>
          <li>Translation status is updated to "completed"</li>
        </ol>
      </div>
      
      <h2 className="text-2xl font-semibold mt-8 mb-4">Code Examples</h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Requesting a Translation</h3>
        <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
          <code>{`// In a React component
const { mutate, isLoading } = trpc.translations.requestDocumentTranslation.useMutation();

const handleRequestTranslation = (documentId) => {
  mutate({
    documentId,
    targetLanguage: "french" // or "english" or "arabic"
  }, {
    onSuccess: () => {
      toast.success("Translation requested successfully");
    },
    onError: (error) => {
      toast.error(\`Translation request failed: \${error.message}\`);
    }
  });
};`}</code>
        </pre>
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Checking Translation Status</h3>
        <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
          <code>{`// In a React component
const { data, isLoading } = trpc.translations.getTranslationStatus.useQuery(
  { 
    documentId: "document-id", 
    targetLanguage: "french" 
  },
  { 
    // Refetch every 5 seconds if status is pending
    refetchInterval: (data) => data?.status === "pending" ? 5000 : false
  }
);

// Render based on status
if (isLoading) return <LoadingIndicator />;

if (data?.status === "pending") {
  return <TranslationInProgress />;
} else if (data?.status === "completed") {
  return <TranslationAvailable documentId={data.documentId} />;
} else {
  return <RequestTranslationButton onClick={handleRequestTranslation} />;
}`}</code>
        </pre>
      </div>
      
      <h2 className="text-2xl font-semibold mt-8 mb-4">Best Practices</h2>
      
      <ul className="list-disc pl-6 space-y-2 mb-8">
        <li>Always check if a translation already exists before requesting a new one</li>
        <li>Provide clear visual indicators of translation status to users</li>
        <li>Implement polling to update the UI when translations are completed</li>
        <li>Handle errors gracefully and provide clear error messages</li>
        <li>Consider document size and type when estimating translation time</li>
      </ul>
      
      <div className="bg-yellow-50 dark:bg-yellow-900 p-6 rounded-lg mb-8">
        <h3 className="text-xl font-semibold mb-4">Limitations</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Only text-based documents (PDF, text, HTML, DOC) can have their content translated</li>
          <li>For non-text documents, only metadata (title, description) is translated</li>
          <li>Very large documents may take longer to translate</li>
          <li>Translation quality depends on the DeepL API's capabilities</li>
        </ul>
      </div>
    </div>
  );
}; 