import { prisma } from '@/lib/db';
import { Document, Language, DocumentCategory } from '@/lib/types';
import { createDocument, getDownloadUrl } from '@/lib/utils/documents';
import { extractPdfText, generatePdfFromPages, uploadTranslatedPdf } from '@/lib/utils/pdf';

// In-memory cache for translations to avoid redundant API calls
type TranslationCacheKey = `${string}_${Language}`;
type TranslationCache = {
  [key: TranslationCacheKey]: {
    translatedText: string;
    timestamp: number;
    documentId?: string;
  };
};

// Cache expiration time in milliseconds (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// In-memory cache for translations
const translationCache: TranslationCache = {};

// Language name mapping for Claude
const languageToName = {
  [Language.ENGLISH]: 'English',
  [Language.FRENCH]: 'French',
  [Language.ARABIC]: 'Arabic',
};

/**
 * Get a cached translation if available and not expired
 */
export const getCachedTranslation = (
  originalText: string,
  sourceLanguage: Language,
  targetLanguage: Language
): string | null => {
  const cacheKey = `${originalText.substring(0, 100)}_${sourceLanguage}->${targetLanguage}` as TranslationCacheKey;
  const cachedItem = translationCache[cacheKey];
  
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_EXPIRATION) {
    return cachedItem.translatedText;
  }
  
  return null;
};

/**
 * Cache a translation result
 */
export const cacheTranslation = (
  originalText: string,
  sourceLanguage: Language,
  targetLanguage: Language,
  translatedText: string,
  documentId?: string
): void => {
  const cacheKey = `${originalText.substring(0, 100)}_${sourceLanguage}->${targetLanguage}` as TranslationCacheKey;
  
  translationCache[cacheKey] = {
    translatedText,
    timestamp: Date.now(),
    documentId
  };
};

/**
 * Build Claude-styled chat messages for translation.
 */
const createTranslationPayload = (
  text: string,
  sourceLanguage: Language,
  targetLanguage: Language,
  options?: {
    formality?: 'default' | 'more' | 'less';
    context?: string;
  },
): { system: string; messages: { role: 'user' | 'assistant'; content: string }[] } => {
  const sourceLang = languageToName[sourceLanguage];
  const targetLang = languageToName[targetLanguage];

  let formalityInstruction = '';
  if (options?.formality === 'more') {
    formalityInstruction = ' Use formal, professional tone.';
  } else if (options?.formality === 'less') {
    formalityInstruction = ' Use casual, informal tone.';
  }

  const contextBlock = options?.context
    ? `Context: ${options.context}\n\n`
    : '';

  const systemPrompt = `You are a professional translator specializing in residential community management and building administration documents.${formalityInstruction}\n\nIMPORTANT GUIDELINES:\n- Maintain the original meaning and intent precisely\n- Preserve formatting, structure, and any special characters (including HTML tags, markdown, bullet points)\n- Keep proper nouns, building names, and personal names unchanged\n- For community management terms, use standard Moroccan real estate and property management terminology\n- Translate financial terms using Moroccan Dirham (MAD) conventions and local business practices\n- For legal/regulatory content, ensure compliance with Moroccan property law and regulations\n- Use Moroccan Arabic dialect and cultural references when translating to Arabic\n- For French translations, use Moroccan French conventions and terminology\n- Ensure cultural appropriateness for Moroccan residents and property owners\n- Respond ONLY with the translated text, no explanations or extra content`;

  const userInstruction = `${contextBlock}Translate the following text from ${sourceLang} to ${targetLang}.`;

  return {
    system: systemPrompt,
    messages: [
      { role: 'user', content: userInstruction },
      { role: 'user', content: text },
    ],
  };
};

/**
 * Translate text using Claude Sonnet 4 API
 */
export const translateText = async (
  text: string,
  sourceLanguage: Language,
  targetLanguage: Language,
  options?: {
    formality?: 'default' | 'more' | 'less';
    context?: string;
  }
): Promise<string> => {
  // If the text is extremely large we split it into smaller chunks to stay under the 200k-token Claude limit.
  // Rough heuristic: 1 token ≈ 4 characters for typical PDF/plain-text mix. We keep chunks ≤ 40 000 chars (≈10 k tokens).
  const MAX_CHARS_PER_CHUNK = 40000;

  if (text.length > MAX_CHARS_PER_CHUNK) {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += MAX_CHARS_PER_CHUNK) {
      chunks.push(text.slice(i, i + MAX_CHARS_PER_CHUNK));
    }

    const translatedChunks: string[] = [];
    for (const [index, chunk] of chunks.entries()) {
      console.log(`🔄 Translating chunk ${index + 1}/${chunks.length} (length: ${chunk.length})`);
      const translatedChunk = await translateText(
        chunk,
        sourceLanguage,
        targetLanguage,
        options,
      );
      translatedChunks.push(translatedChunk.trim());
    }

    return translatedChunks.join('\n');
  }
  
  // Check cache first
  const cachedTranslation = getCachedTranslation(text, sourceLanguage, targetLanguage);
  if (cachedTranslation) {
    return cachedTranslation;
  }
  
  try {
    // Use Claude API for translation
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    // Enhanced API key validation
    if (!apiKey) {
      console.error('Translation failed: ANTHROPIC_API_KEY environment variable is not set');
      throw new Error('Anthropic API key is not configured. Please set ANTHROPIC_API_KEY environment variable.');
    }
    
    if (apiKey === 'sk-ant-your-anthropic-api-key' || apiKey.includes('your-anthropic-api-key')) {
      console.error('Translation failed: ANTHROPIC_API_KEY is set to placeholder value');
      throw new Error('Anthropic API key is set to placeholder value. Please update ANTHROPIC_API_KEY with a valid API key.');
    }
    
    if (!apiKey.startsWith('sk-ant-')) {
      console.error('Translation failed: Invalid ANTHROPIC_API_KEY format');
      throw new Error('Invalid Anthropic API key format. API key should start with "sk-ant-".');
    }
    
    console.log('Translation request:', {
      sourceLanguage,
      targetLanguage,
      textLength: text.length,
      apiKeyPresent: !!apiKey,
      apiKeyPrefix: apiKey.substring(0, 10) + '...'
    });
    
    const { system: systemPrompt, messages } = createTranslationPayload(
      text,
      sourceLanguage,
      targetLanguage,
      options,
    );
    
    const requestBody = {
      model: "claude-3-5-sonnet-20241022", // Using stable model version
      max_tokens: 4000,
      system: systemPrompt,
      messages,
    };
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });
      
      if (response.status === 401) {
        throw new Error(`Authentication failed: Invalid API key. Please check your ANTHROPIC_API_KEY. Status: ${response.status}`);
      } else if (response.status === 403) {
        throw new Error(`Access forbidden: Check API key permissions. Status: ${response.status}`);
      } else if (response.status === 429) {
        throw new Error(`Rate limit exceeded: Too many requests. Status: ${response.status}`);
      } else {
        throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
    }
    
    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Invalid Claude API response structure:', data);
      throw new Error('Invalid response structure from Claude API');
    }
    
    const translatedText = data.content[0].text.trim();
    
    // Detect common refusal phrases *before* caching
    if (/^(i'?m\s+sorry|sorry,\s+i\s+can)/i.test(translatedText)) {
      throw new Error('MODEL_REFUSAL');
    }

    console.log('Translation successful:', {
      sourceLanguage,
      targetLanguage,
      originalLength: text.length,
      translatedLength: translatedText.length,
    });

    // Cache the successful result
    cacheTranslation(text, sourceLanguage, targetLanguage, translatedText);
    
    return translatedText;
  } catch (error) {
    console.error('Translation error details:', {
      error: error,
      message: (error as Error).message,
      stack: (error as Error).stack,
      sourceLanguage,
      targetLanguage,
      textPreview: text.substring(0, 100) + '...'
    });
    throw new Error(`Failed to translate text: ${(error as Error).message}`);
  }
};

/**
 * Create a translated version of a document
 */
export const createTranslatedDocument = async (
  originalDocumentId: string,
  targetLanguage: Language
): Promise<Document> => {
  // Get the original document
  const originalDocument = await prisma.documents.findUnique({
    where: { id: originalDocumentId },
  });
  
  if (!originalDocument) {
    throw new Error('Original document not found');
  }
  
  // Check if translation already exists
  const existingTranslation = await prisma.documents.findFirst({
    where: {
      originalDocumentId: originalDocumentId,
      language: targetLanguage as any,
    },
  });
  
  if (existingTranslation) {
    return existingTranslation as unknown as Document;
  }
  
  // For text-based documents, we can translate the content
  if (originalDocument.fileType.includes('pdf')) {
    try {
      // 1. Download original PDF
      const downloadUrl = await getDownloadUrl(originalDocument.filePath);
      const pdfBuffer = Buffer.from(await (await fetch(downloadUrl)).arrayBuffer());

      // 2. Extract text & split into pages
      const pdfText = await extractPdfText(pdfBuffer);

      if (!pdfText.trim()) {
        throw new Error('EMPTY_PDF_TEXT');
      }

      const pages = pdfText.split(/\f/).filter(Boolean);

      // Fallback when no form-feed page markers found
      const pageChunks = pages.length > 0 ? pages : pdfText.split(/\n{2,}/);

      // 3. Translate page-by-page
      const translatedPages: string[] = [];
      for (const [idx, pageTxt] of pageChunks.entries()) {
        console.log(`📄 Translating PDF page ${idx + 1}/${pageChunks.length}`);
        translatedPages.push(
          await translateText(
            pageTxt,
            originalDocument.language as unknown as Language,
            targetLanguage,
          ),
        );
      }

      // 4. Rebuild PDF
      const translatedPdfBytes = await generatePdfFromPages(translatedPages);

      // 5. Upload new PDF
      const newFilePath = await uploadTranslatedPdf(
        translatedPdfBytes,
        originalDocument.filePath,
        targetLanguage as any,
      );

      // 6. Create DB record
      const translatedDocument = await createDocument(
        `${originalDocument.title} (${targetLanguage})`,
        originalDocument.description ? `${originalDocument.description} (Translated)` : null,
        newFilePath,
        translatedPdfBytes.byteLength,
        'application/pdf',
        originalDocument.category as unknown as DocumentCategory,
        targetLanguage as any,
        originalDocument.createdBy || '',
        originalDocument.isPublic || false,
      );

      // Update relationship
      await prisma.documents.update({
        where: { id: translatedDocument.id },
        data: { originalDocumentId: originalDocument.id, isTranslation: true },
      });

      return translatedDocument as unknown as Document;
    } catch (error) {
      console.error('PDF translation error:', error);
      throw new Error(`Failed to translate PDF: ${(error as Error).message}`);
    }
  }

  // Generic text-based flow (txt, doc, etc.)
  if (originalDocument.fileType.includes('text') || originalDocument.fileType.includes('doc')) {
    try {
      // Get the document content (this would need to be implemented)
      const downloadUrl = await getDownloadUrl(originalDocument.filePath);
      const response = await fetch(downloadUrl);
      const content = await response.text();
      
      // Translate the content
      // TODO: Implement saving translated content to new file
      const translatedContent = await translateText(
        content,
        originalDocument.language as unknown as Language,
        targetLanguage
      );
      
      // Create a new document with the translated content
      // This would need to save the translated content to a new file
      // For now, we'll just create a placeholder document
      // Note: translatedContent is not used yet - needs file saving implementation
      
      const translatedDocument = await createDocument(
        `${originalDocument.title} (${targetLanguage})`,
        originalDocument.description ? 
          `${originalDocument.description} (Translated from ${originalDocument.language})` : null,
        originalDocument.filePath, // This would need to be updated with the new file path
        Number(originalDocument.fileSize),
        originalDocument.fileType,
        originalDocument.category as unknown as DocumentCategory,
        targetLanguage as any,
        originalDocument.createdBy || '',
        originalDocument.isPublic || false
      );
      
      // Update the relationship between original and translated documents
      await prisma.documents.update({
        where: { id: translatedDocument.id },
        data: {
          originalDocumentId: originalDocument.id,
          isTranslation: true,
        },
      });
      
      return translatedDocument as unknown as Document;
    } catch (error) {
      console.error('Document translation error:', error);
      throw new Error(`Failed to translate document: ${(error as Error).message}`);
    }
  } else {
    // For non-text documents, we can't translate the content directly
    // We could create a document with translated metadata only
    const translatedDocument = await createDocument(
      `${originalDocument.title} (Original in ${originalDocument.language})`,
      originalDocument.description ? 
        `${originalDocument.description} (Original in ${originalDocument.language})` : null,
      originalDocument.filePath,
      Number(originalDocument.fileSize),
      originalDocument.fileType,
      originalDocument.category as unknown as DocumentCategory,
      targetLanguage as any,
      originalDocument.createdBy || '',
      originalDocument.isPublic || false
    );
    
    // Update the relationship
    await prisma.documents.update({
      where: { id: translatedDocument.id },
      data: {
        originalDocumentId: originalDocument.id,
        isTranslation: true,
      },
    });
    
    return translatedDocument as unknown as Document;
  }
};

/**
 * Get or create a translated version of a document
 */
export const getOrCreateTranslatedDocument = async (
  documentId: string,
  targetLanguage: Language
): Promise<Document> => {
  // Check if translation already exists
  const existingTranslation = await prisma.documents.findFirst({
    where: {
      originalDocumentId: documentId,
      language: targetLanguage as any,
    },
  });
  
  if (existingTranslation) {
    return existingTranslation as unknown as Document;
  }
  
  // Create a new translation
  return createTranslatedDocument(documentId, targetLanguage);
}; 