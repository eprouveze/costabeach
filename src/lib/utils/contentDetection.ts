import { Language } from '@/lib/types';

export interface ContentAnalysis {
  isExtractable: boolean;
  detectedLanguage?: Language;
  confidence: number;
  fileType: string;
  extractionMethod?: 'text' | 'pdf' | 'office' | 'ocr' | 'none';
  estimatedCharacterCount?: number;
}

/**
 * Analyze if content can be extracted and translated from a file
 */
export class ContentDetector {
  
  /**
   * Determine if file content can be extracted for translation
   */
  static async analyzeFile(
    fileType: string,
    fileName?: string,
    fileSize?: number
  ): Promise<ContentAnalysis> {
    const analysis: ContentAnalysis = {
      isExtractable: false,
      confidence: 0,
      fileType
    };

    // Text-based files - highest confidence
    if (this.isTextFile(fileType)) {
      analysis.isExtractable = true;
      analysis.confidence = 0.95;
      analysis.extractionMethod = 'text';
      analysis.estimatedCharacterCount = fileSize ? fileSize * 0.8 : undefined; // Rough estimate
      return analysis;
    }

    // PDF files - high confidence but depends on content
    if (this.isPDFFile(fileType)) {
      analysis.isExtractable = true;
      analysis.confidence = 0.8; // Lower because some PDFs are scanned images
      analysis.extractionMethod = 'pdf';
      analysis.estimatedCharacterCount = fileSize ? fileSize * 0.1 : undefined; // PDF overhead
      return analysis;
    }

    // Office documents - high confidence
    if (this.isOfficeDocument(fileType)) {
      analysis.isExtractable = true;
      analysis.confidence = 0.9;
      analysis.extractionMethod = 'office';
      analysis.estimatedCharacterCount = fileSize ? fileSize * 0.2 : undefined;
      return analysis;
    }

    // Image files - low confidence, would need OCR
    if (this.isImageFile(fileType)) {
      analysis.isExtractable = true;
      analysis.confidence = 0.3; // Low confidence without OCR implementation
      analysis.extractionMethod = 'ocr';
      analysis.estimatedCharacterCount = 0; // Unknown without processing
      return analysis;
    }

    // Other files - not extractable
    analysis.extractionMethod = 'none';
    return analysis;
  }

  /**
   * Detect language from text content
   */
  static detectLanguage(text: string): { language: Language; confidence: number } {
    // Simple language detection based on common words and patterns
    const textLower = text.toLowerCase();
    
    // French indicators
    const frenchWords = ['le', 'la', 'les', 'de', 'du', 'des', 'et', 'ou', 'est', 'sont', 'avec', 'pour', 'dans', 'sur'];
    const frenchScore = this.calculateLanguageScore(textLower, frenchWords);
    
    // English indicators  
    const englishWords = ['the', 'and', 'or', 'is', 'are', 'with', 'for', 'in', 'on', 'at', 'to', 'of'];
    const englishScore = this.calculateLanguageScore(textLower, englishWords);
    
    // Arabic indicators (simplified)
    const arabicPattern = /[\u0600-\u06FF]/g;
    const arabicScore = (text.match(arabicPattern) || []).length / text.length;

    // Determine most likely language
    if (arabicScore > 0.3) {
      return { language: Language.ARABIC, confidence: Math.min(arabicScore * 2, 1) };
    } else if (frenchScore > englishScore) {
      return { language: Language.FRENCH, confidence: Math.min(frenchScore, 0.9) };
    } else if (englishScore > 0) {
      return { language: Language.ENGLISH, confidence: Math.min(englishScore, 0.9) };
    }
    
    // Default to French if uncertain (common in Morocco)
    return { language: Language.FRENCH, confidence: 0.1 };
  }

  /**
   * Calculate language score based on common words
   */
  private static calculateLanguageScore(text: string, words: string[]): number {
    const textWords = text.split(/\s+/);
    const matches = textWords.filter(word => words.includes(word.toLowerCase())).length;
    return matches / Math.max(textWords.length, 1);
  }

  /**
   * Check if file type is plain text
   */
  private static isTextFile(fileType: string): boolean {
    const textTypes = [
      'text/plain',
      'text/html',
      'text/css',
      'text/javascript',
      'text/csv',
      'text/xml',
      'application/json',
      'application/xml'
    ];
    return textTypes.some(type => fileType.includes(type));
  }

  /**
   * Check if file type is PDF
   */
  private static isPDFFile(fileType: string): boolean {
    return fileType.includes('application/pdf');
  }

  /**
   * Check if file type is an Office document
   */
  private static isOfficeDocument(fileType: string): boolean {
    const officeTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.oasis.opendocument.presentation'
    ];
    return officeTypes.some(type => fileType.includes(type));
  }

  /**
   * Check if file type is an image
   */
  private static isImageFile(fileType: string): boolean {
    return fileType.startsWith('image/');
  }

  /**
   * Estimate translation cost (in characters)
   */
  static estimateTranslationCost(
    analysis: ContentAnalysis,
    targetLanguages: Language[]
  ): {
    estimatedCharacters: number;
    estimatedCost: number; // In cents, assuming $20 per million characters
    processingTime: number; // In minutes
  } {
    const baseCharacters = analysis.estimatedCharacterCount || 0;
    const multiplier = analysis.confidence;
    const estimatedCharacters = Math.round(baseCharacters * multiplier);
    
    // Cost calculation: $20 per million characters
    const costPerCharacter = 20 / 1000000; // $0.00002 per character
    const estimatedCost = Math.round(estimatedCharacters * targetLanguages.length * costPerCharacter * 100); // in cents
    
    // Processing time estimate (rough)
    const timePerCharacter = 0.001; // 1ms per character base
    const processingTime = Math.max(
      Math.round(estimatedCharacters * timePerCharacter * targetLanguages.length / 60), 
      1
    ); // in minutes
    
    return {
      estimatedCharacters,
      estimatedCost,
      processingTime
    };
  }
}