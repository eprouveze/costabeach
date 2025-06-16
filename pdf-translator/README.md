# PDF Translator

A comprehensive TypeScript/React package for translating PDF documents using AI language models. This package extracts reusable translation components from a SwiftUI translation app and ports them to work with Next.js applications.

## Features

- **Multi-Provider Support**: OpenAI (GPT models), Anthropic (Claude), and Google Gemini
- **PDF Processing**: Extract text while preserving document structure and formatting
- **Batch Translation**: Efficient processing of large documents with smart batching
- **Progress Tracking**: Real-time progress updates with detailed phase information
- **Quality Assurance**: Built-in quality checks for translation accuracy
- **Recovery System**: Resume interrupted translations from where they left off
- **Cost Tracking**: Monitor translation costs across different providers
- **React Components**: Pre-built UI components for easy integration

## Installation

```bash
npm install pdf-translator
```

## Dependencies

The package requires these peer dependencies:

```bash
npm install react react-dom next
```

## Quick Start

### 1. Basic Setup

```typescript
import { PDFTranslator } from 'pdf-translator';

export default function TranslatePage() {
  return (
    <div>
      <PDFTranslator />
    </div>
  );
}
```

### 2. API Routes Setup

Create the following API routes in your Next.js application:

**`pages/api/translate.ts`** (or `app/api/translate/route.ts` for App Router):

```typescript
import handler from 'pdf-translator/src/api/translate';
export default handler;
```

**`pages/api/progress.ts`**:

```typescript
import handler from 'pdf-translator/src/api/progress';
export default handler;
```

**`pages/api/recovery.ts`**:

```typescript
import handler from 'pdf-translator/src/api/recovery';
export default handler;
```

### 3. Environment Variables

Set up your API keys:

```bash
# .env.local
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

## Advanced Usage

### Custom Translation Service

```typescript
import { 
  TranslationService, 
  createTranslationModel,
  PDFAdapter 
} from 'pdf-translator';

// Create translation model
const model = createTranslationModel('openai', {
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4o-mini'
});

// Initialize service
const service = new TranslationService(model);

// Process PDF
const pdfAdapter = new PDFAdapter();
const elements = await pdfAdapter.extractText(pdfBuffer);

const result = await service.translate({
  elements,
  sourceLang: 'en',
  targetLang: 'es',
  provider: 'openai',
  options: {
    quality: 'professional',
    batchSize: 10,
    onProgress: (progress) => console.log(progress)
  }
});
```

### Custom Components

```typescript
import {
  FileUpload,
  LanguageSelector,
  ProviderSelector,
  ProgressBar,
  TranslationResult
} from 'pdf-translator';

export function CustomTranslator() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceLang, setSourceLang] = useState('en');
  
  return (
    <div>
      <FileUpload onFileSelect={setFile} />
      <LanguageSelector 
        label="Source Language"
        value={sourceLang}
        onChange={setSourceLang}
      />
      {/* ... */}
    </div>
  );
}
```

## API Reference

### Core Classes

#### `TranslationService`

Main service for orchestrating translations.

```typescript
const service = new TranslationService(model, options?);

// Translate content
const result = await service.translate(request);

// Resume interrupted translation
const result = await service.resumeTranslation(recoveryId);
```

#### `PDFAdapter`

Handles PDF text extraction and translation application.

```typescript
const adapter = new PDFAdapter();

// Extract text elements
const elements = await adapter.extractText(pdfBuffer);

// Apply translations
const translatedPdf = await adapter.applyTranslations(pdfBuffer, translations);
```

### Translation Providers

#### OpenAI

```typescript
import { OpenAITranslationModel } from 'pdf-translator';

const model = new OpenAITranslationModel({
  apiKey: 'sk-...',
  model: 'gpt-4o-mini' // or gpt-4o, gpt-4-turbo
});
```

#### Anthropic

```typescript
import { AnthropicTranslationModel } from 'pdf-translator';

const model = new AnthropicTranslationModel({
  apiKey: 'sk-ant-...',
  model: 'claude-3-5-sonnet-20241022'
});
```

#### Google Gemini

```typescript
import { GeminiTranslationModel } from 'pdf-translator';

const model = new GeminiTranslationModel({
  apiKey: 'AIza...',
  model: 'gemini-1.5-flash'
});
```

### Utility Functions

#### Batch Processing

```typescript
import { createBatches, deduplicateContent } from 'pdf-translator';

// Create efficient batches
const batches = createBatches(items, {
  maxBatchSize: 10,
  maxTokensPerBatch: 2000
});

// Remove duplicate content
const { uniqueTexts, elementMap } = deduplicateContent(elements);
```

#### Progress Tracking

```typescript
import { ProgressTracker } from 'pdf-translator';

const tracker = new ProgressTracker((progress) => {
  console.log(`${progress.percentage}% complete`);
});

tracker.setTotal(100);
tracker.setPhase('translating');
tracker.increment(10);
```

#### Quality Checking

```typescript
import { QualityChecker } from 'pdf-translator';

const checker = new QualityChecker();
const result = checker.check(original, translated, elementId, 'en', 'es');

if (!result.passed) {
  console.log('Quality issues:', result.issues);
}
```

## Component Props

### `PDFTranslator`

The main component includes all functionality:

```typescript
interface PDFTranslatorProps {
  defaultProvider?: TranslationProvider;
  defaultQuality?: 'draft' | 'standard' | 'professional';
  onTranslationComplete?: (result: TranslationResult) => void;
  onError?: (error: string) => void;
}
```

### `FileUpload`

```typescript
interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedFormats?: string[];
  maxSize?: number;
}
```

### `ProviderSelector`

```typescript
interface ProviderSelectorProps {
  value: TranslationProvider;
  onChange: (provider: TranslationProvider) => void;
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  model?: string;
  onModelChange?: (model: string) => void;
}
```

## Supported Languages

The package supports translation between 20+ languages including:

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese Simplified (zh)
- Chinese Traditional (zh-TW)
- Arabic (ar)
- Hindi (hi)
- And more...

## Cost Estimation

Translation costs are automatically calculated:

```typescript
const cost = model.estimateCost(inputTokens, outputTokens);
console.log(`Estimated cost: $${cost.totalCost}`);
```

### Typical Costs (as of 2024)

- **GPT-4o-mini**: ~$0.15-0.60 per 1M tokens
- **Claude 3.5 Sonnet**: ~$3.00-15.00 per 1M tokens  
- **Gemini 1.5 Flash**: ~$0.075-0.30 per 1M tokens

## Error Handling

The package includes comprehensive error handling:

```typescript
try {
  const result = await service.translate(request);
} catch (error) {
  if (error.code === 'TRANSLATION_FAILED') {
    // Handle translation failure
  } else if (error.code === 'INVALID_PDF') {
    // Handle invalid PDF
  }
}
```

## Recovery System

Resume interrupted translations:

```typescript
// List available recovery sessions
const sessions = await service.listRecoverySessions();

// Resume a specific session
const result = await service.resumeTranslation(sessionId);
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  TranslationRequest,
  TranslationResult,
  TranslationElement,
  ProgressUpdate,
  QualityCheckResult
} from 'pdf-translator';
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- GitHub Issues: [Report bugs or request features](https://github.com/eprouveze/costabeach/issues)
- Documentation: [Full API documentation](https://github.com/eprouveze/costabeach/tree/main/pdf-translator)

## Roadmap

- [ ] Support for more file formats (Word, PowerPoint)
- [ ] Advanced layout preservation
- [ ] Batch processing of multiple files
- [ ] Integration with cloud storage providers
- [ ] Custom translation models support