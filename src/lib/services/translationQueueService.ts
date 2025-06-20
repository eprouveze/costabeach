import { prisma } from "@/lib/db";
import { Language, TranslationStatus, TranslationQuality } from '@/lib/types';
import { translateText, getOrCreateTranslatedDocument } from '@/lib/utils/translations';

export class TranslationQueueService {
  /**
   * Create translation jobs for a document in all target languages
   */
  static async createTranslationJobs(
    documentId: string, 
    sourceLanguage: Language,
    targetLanguages: Language[] = [Language.FRENCH, Language.ENGLISH, Language.ARABIC],
    requestedBy: string
  ): Promise<void> {
    // Filter out the source language from target languages
    const filteredTargets = targetLanguages.filter(lang => lang !== sourceLanguage);
    
    for (const targetLanguage of filteredTargets) {
      try {
        // Check if job already exists
        const existingJob = await prisma.document_translations.findFirst({
          where: {
            document_id: documentId,
            target_language: targetLanguage
          }
        });

        if (!existingJob) {
          await prisma.document_translations.create({
            data: {
              document_id: documentId,
              source_language: sourceLanguage,
              target_language: targetLanguage,
              status: TranslationStatus.PENDING,
              requested_by: requestedBy
            }
          });
          
          console.log(`Created translation job: ${documentId} -> ${targetLanguage}`);
        }
      } catch (error) {
        console.error(`Failed to create translation job for ${documentId} -> ${targetLanguage}:`, error);
      }
    }
  }

  /**
   * Process pending translation jobs
   */
  static async processPendingJobs(batchSize: number = 5): Promise<void> {
    // First, mark any jobs stuck in PROCESSING for >30 minutes as failed so they are visible in UI
    await this.cleanupStalledProcessingJobs();

    const pendingJobs = await prisma.document_translations.findMany({
      where: {
        status: TranslationStatus.PENDING
      },
      take: batchSize,
      orderBy: {
        created_at: 'asc'
      }
    });

    for (const job of pendingJobs) {
      await this.processTranslationJob(job.id);
    }
  }

  /**
   * Process a specific translation job
   */
  static async processTranslationJob(jobId: string): Promise<void> {
    const job = await prisma.document_translations.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      console.error(`Translation job not found: ${jobId}`);
      return;
    }

    // Get the document separately
    const document = await prisma.documents.findUnique({
      where: { id: job.document_id },
      select: {
        id: true,
        fileType: true,
        language: true,
        sourceLanguage: true,
        title: true,
        description: true,
        filePath: true,
        fileSize: true,
        category: true,
        isPublic: true,
        createdBy: true
      }
    });

    if (!document) {
      console.error(`Document not found for translation job: ${job.document_id}`);
      return;
    }

    try {
      // Check API configuration before starting
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey || apiKey === 'sk-ant-your-anthropic-api-key' || apiKey.includes('your-anthropic-api-key')) {
        throw new Error('Translation service not configured: Please set a valid ANTHROPIC_API_KEY environment variable');
      }

      // Mark job as processing
      await prisma.document_translations.update({
        where: { id: jobId },
        data: {
          status: TranslationStatus.PROCESSING,
          started_at: new Date()
        }
      });

      console.log(`Processing translation job: ${jobId} (${job.document_id} -> ${job.target_language})`);

      // Check if content is extractable for translation
      const isExtractable = await this.isContentExtractable(document.fileType);
      
      if (!isExtractable) {
        // Create metadata-only translation
        await this.createMetadataOnlyTranslation(document, job.target_language as Language);
      } else {
        // Create full content translation
        await getOrCreateTranslatedDocument(
          job.document_id,
          job.target_language as Language
        );
      }

      // Mark job as completed
      await prisma.document_translations.update({
        where: { id: jobId },
        data: {
          status: TranslationStatus.COMPLETED,
          completed_at: new Date()
        }
      });

      console.log(`Translation job completed: ${jobId}`);

    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error(`Translation job failed: ${jobId}`, {
        error: errorMessage,
        documentId: job.document_id,
        targetLanguage: job.target_language,
        stack: (error as Error).stack
      });
      
      // Categorise well-known non-retryable errors
      const isConfigError = errorMessage.includes('API key') ||
        errorMessage.includes('not configured') ||
        errorMessage.includes('placeholder value') ||
        errorMessage.includes('Authentication failed');

      const isUntranslatable = errorMessage === 'EMPTY_PDF_TEXT' || errorMessage === 'MODEL_REFUSAL';
      
      // Update job with error
      await prisma.document_translations.update({
        where: { id: jobId },
        data: {
          status: TranslationStatus.FAILED,
          error_message: isConfigError
            ? `Configuration Error: ${errorMessage}`
            : isUntranslatable
              ? `Untranslatable: ${errorMessage}`
              : errorMessage,
        }
      });
      
      // Log configuration errors separately for easier debugging
      if (isConfigError) {
        console.error('TRANSLATION CONFIGURATION ERROR:', {
          error: errorMessage,
          suggestion: 'Please update the ANTHROPIC_API_KEY in your .env.local file with a valid API key from https://console.anthropic.com/',
          currentKey: process.env.ANTHROPIC_API_KEY ? 
            (process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...') : 
            'undefined'
        });
      }
    }
  }

  /**
   * Determine if content can be extracted for translation
   */
  private static async isContentExtractable(fileType: string): Promise<boolean> {
    // Text-based files that can be translated
    const extractableTypes = [
      'text/',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json'
    ];

    return extractableTypes.some(type => fileType.includes(type));
  }

  /**
   * Create a metadata-only translation for non-extractable content
   */
  private static async createMetadataOnlyTranslation(
    originalDocument: any,
    targetLanguage: Language
  ): Promise<void> {
    try {
      // Translate title and description only
      const translatedTitle = await translateText(
        originalDocument.title,
        originalDocument.sourceLanguage || originalDocument.language,
        targetLanguage
      );

      let translatedDescription = null;
      if (originalDocument.description) {
        translatedDescription = await translateText(
          originalDocument.description,
          originalDocument.sourceLanguage || originalDocument.language,
          targetLanguage
        );
      }

      // Create document record with translated metadata
      await prisma.documents.create({
        data: {
          title: `${translatedTitle} (${this.getLanguageLabel(targetLanguage)})`,
          description: translatedDescription ? 
            `${translatedDescription} [${this.getLanguageLabel(originalDocument.sourceLanguage || originalDocument.language)} original]` : 
            `[Original document in ${this.getLanguageLabel(originalDocument.sourceLanguage || originalDocument.language)}]`,
          filePath: originalDocument.filePath, // Same file, different metadata
          fileType: originalDocument.fileType,
          fileSize: originalDocument.fileSize,
          category: originalDocument.category,
          language: targetLanguage,
          sourceLanguage: originalDocument.sourceLanguage || originalDocument.language,
          translationQuality: TranslationQuality.MACHINE,
          translationStatus: TranslationStatus.COMPLETED,
          contentExtractable: false,
          originalDocumentId: originalDocument.id,
          isTranslation: true,
          isPublic: originalDocument.isPublic,
          createdBy: originalDocument.createdBy
        }
      });

    } catch (error) {
      console.error('Failed to create metadata-only translation:', error);
      throw error;
    }
  }

  /**
   * Get human-readable language label
   */
  private static getLanguageLabel(language: string): string {
    switch (language) {
      case Language.FRENCH: return 'French';
      case Language.ENGLISH: return 'English';
      case Language.ARABIC: return 'Arabic';
      default: return language;
    }
  }

  /**
   * Retry failed translation jobs
   */
  static async retryFailedJobs(): Promise<void> {
    const failedJobs = await prisma.document_translations.findMany({
      where: {
        status: TranslationStatus.FAILED
      }
    });

    for (const job of failedJobs) {
      // Reset job status to pending for retry
      await prisma.document_translations.update({
        where: { id: job.id },
        data: {
          status: TranslationStatus.PENDING,
          error_message: null
        }
      });
    }

    console.log(`Queued ${failedJobs.length} failed jobs for retry`);
  }

  /**
   * Clean up orphaned translation jobs (jobs for deleted documents)
   */
  static async cleanupOrphanedJobs(): Promise<number> {
    try {
      // Get all existing document IDs
      const existingDocumentIds = await prisma.documents.findMany({
        select: { id: true }
      }).then(docs => docs.map(d => d.id));

      // Find translation jobs where the document no longer exists
      const orphanedJobs = await prisma.document_translations.findMany({
        where: {
          document_id: {
            notIn: existingDocumentIds
          }
        },
        select: { id: true, document_id: true }
      });

      if (orphanedJobs.length === 0) {
        return 0;
      }

      // Delete orphaned jobs
      const result = await prisma.document_translations.deleteMany({
        where: {
          id: {
            in: orphanedJobs.map(job => job.id)
          }
        }
      });

      console.log(`Cleaned up ${result.count} orphaned translation jobs`);
      return result.count;
    } catch (error) {
      console.error('Failed to cleanup orphaned jobs:', error);
      return 0;
    }
  }

  /**
   * Get translation statistics
   */
  static async getTranslationStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  }> {
    const [pending, processing, completed, failed, total] = await Promise.all([
      prisma.document_translations.count({ where: { status: TranslationStatus.PENDING } }),
      prisma.document_translations.count({ where: { status: TranslationStatus.PROCESSING } }),
      prisma.document_translations.count({ where: { status: TranslationStatus.COMPLETED } }),
      prisma.document_translations.count({ where: { status: TranslationStatus.FAILED } }),
      prisma.document_translations.count()
    ]);

    return { pending, processing, completed, failed, total };
  }

  /**
   * Detect jobs that have been PROCESSING for too long (e.g., worker crashed)
   * and mark them as FAILED with an explanatory message so they are not stuck
   * forever in the UI.
   */
  private static async cleanupStalledProcessingJobs(maxMinutes = 30): Promise<void> {
    const threshold = new Date(Date.now() - maxMinutes * 60 * 1000);

    const stalledJobs = await prisma.document_translations.findMany({
      where: {
        status: TranslationStatus.PROCESSING,
        started_at: { lt: threshold },
      },
    });

    if (!stalledJobs.length) return;

    for (const job of stalledJobs) {
      await prisma.document_translations.update({
        where: { id: job.id },
        data: {
          status: TranslationStatus.FAILED,
          error_message: 'Stalled: exceeded processing time limit',
        },
      });
      console.warn(`Marked stalled translation job as failed: ${job.id}`);
    }
  }
}