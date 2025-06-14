import { prisma } from '@/lib/db';
import { Document, Language, DocumentCategory } from '@/lib/types';
import { createDocument } from './documents';
import { getDownloadUrl } from './documents';

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
  targetLanguage: Language
): string | null => {
  const cacheKey = `${originalText.substring(0, 100)}_${targetLanguage}` as TranslationCacheKey;
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
  targetLanguage: Language,
  translatedText: string,
  documentId?: string
): void => {
  const cacheKey = `${originalText.substring(0, 100)}_${targetLanguage}` as TranslationCacheKey;
  
  translationCache[cacheKey] = {
    translatedText,
    timestamp: Date.now(),
    documentId
  };
};

/**
 * Create translation prompt for Claude
 */
const createTranslationPrompt = (
  text: string,
  sourceLanguage: Language,
  targetLanguage: Language,
  options?: {
    formality?: 'default' | 'more' | 'less';
    context?: string;
  }
): string => {
  const sourceLang = languageToName[sourceLanguage];
  const targetLang = languageToName[targetLanguage];
  
  let formalityInstruction = '';
  if (options?.formality === 'more') {
    formalityInstruction = ' Use formal, professional tone.';
  } else if (options?.formality === 'less') {
    formalityInstruction = ' Use casual, informal tone.';
  }
  
  const contextInstruction = options?.context 
    ? `\n\nContext: ${options.context}\n\n`
    : '\n\n';
  
  return `You are a professional translator specializing in residential community management and building administration documents. Translate the following text from ${sourceLang} to ${targetLang}.

IMPORTANT GUIDELINES:
- Maintain the original meaning and intent precisely
- Preserve formatting, structure, and any special characters (including HTML tags, markdown, bullet points)
- Keep proper nouns, building names, and personal names unchanged
- For community management terms, use standard Moroccan real estate and property management terminology
- Translate financial terms using Moroccan Dirham (MAD) conventions and local business practices
- For legal/regulatory content, ensure compliance with Moroccan property law and regulations
- Use Moroccan Arabic dialect and cultural references when translating to Arabic
- For French translations, use Moroccan French conventions and terminology
- Ensure cultural appropriateness for Moroccan residents and property owners${formalityInstruction}
- Return ONLY the translated text, no explanations or additional content

CONTEXT: This is for a residential building management system in Morocco, serving property owners and residents. Documents may include budgets, maintenance notices, community rules, legal documents, and administrative communications.${contextInstruction}Text to translate:
${text}`;
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
  // Check cache first
  const cachedTranslation = getCachedTranslation(text, targetLanguage);
  if (cachedTranslation) {
    return cachedTranslation;
  }
  
  try {
    // Use Claude API for translation
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key is not configured');
    }
    
    const prompt = createTranslationPrompt(text, sourceLanguage, targetLanguage, options);
    
    const requestBody = {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    };
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Claude API error: ${response.status} ${errorData}`);
    }
    
    const data = await response.json();
    const translatedText = data.content[0].text.trim();
    
    // Cache the result
    cacheTranslation(text, targetLanguage, translatedText);
    
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
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
  if (originalDocument.fileType.includes('text') || 
      originalDocument.fileType.includes('pdf') ||
      originalDocument.fileType.includes('doc')) {
    
    try {
      // Get the document content (this would need to be implemented)
      const downloadUrl = await getDownloadUrl(originalDocument.filePath);
      const response = await fetch(downloadUrl);
      const content = await response.text();
      
      // Translate the content
      const translatedContent = await translateText(
        content,
        originalDocument.language as unknown as Language,
        targetLanguage
      );
      
      // Create a new document with the translated content
      // This would need to save the translated content to a new file
      // For now, we'll just create a placeholder document
      
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