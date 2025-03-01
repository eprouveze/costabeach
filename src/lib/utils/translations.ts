import { prisma } from '@/lib/db';
import { Document, Language, DocumentCategory } from '@/lib/types';
import { generateChatCompletion } from '@/lib/aiClient';
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
 * Translate text using OpenAI
 */
export const translateText = async (
  text: string,
  sourceLanguage: Language,
  targetLanguage: Language
): Promise<string> => {
  // Check cache first
  const cachedTranslation = getCachedTranslation(text, targetLanguage);
  if (cachedTranslation) {
    return cachedTranslation;
  }
  
  // Prepare the prompt for translation
  const prompt = `
    Translate the following text from ${sourceLanguage} to ${targetLanguage}.
    Maintain the original formatting, including paragraphs, bullet points, and any special characters.
    Ensure the translation is natural and fluent in the target language.
    
    Text to translate:
    ${text}
  `;
  
  try {
    // Use the O1 model for high-quality translations
    const translatedText = await generateChatCompletion(
      [{ role: "user", content: prompt }],
      "O1",
      { temperature: 0.3 } // Lower temperature for more consistent translations
    );
    
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
  const originalDocument = await prisma.document.findUnique({
    where: { id: originalDocumentId },
  });
  
  if (!originalDocument) {
    throw new Error('Original document not found');
  }
  
  // Check if translation already exists
  const existingTranslation = await prisma.document.findFirst({
    where: {
      translatedDocumentId: originalDocumentId,
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
        originalDocument.fileSize,
        originalDocument.fileType,
        originalDocument.category as unknown as DocumentCategory,
        targetLanguage as any,
        originalDocument.authorId,
        originalDocument.isPublished
      );
      
      // Update the relationship between original and translated documents
      await prisma.document.update({
        where: { id: translatedDocument.id },
        data: {
          translatedDocumentId: originalDocument.id,
          isTranslated: true,
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
      `${originalDocument.title} (${targetLanguage})`,
      originalDocument.description ? 
        `${originalDocument.description} (Original in ${originalDocument.language})` : null,
      originalDocument.filePath,
      originalDocument.fileSize,
      originalDocument.fileType,
      originalDocument.category as unknown as DocumentCategory,
      targetLanguage as any,
      originalDocument.authorId,
      originalDocument.isPublished
    );
    
    // Update the relationship
    await prisma.document.update({
      where: { id: translatedDocument.id },
      data: {
        translatedDocumentId: originalDocument.id,
        isTranslated: true,
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
  const existingTranslation = await prisma.document.findFirst({
    where: {
      translatedDocumentId: documentId,
      language: targetLanguage as any,
    },
  });
  
  if (existingTranslation) {
    return existingTranslation as unknown as Document;
  }
  
  // Create a new translation
  return createTranslatedDocument(documentId, targetLanguage);
}; 