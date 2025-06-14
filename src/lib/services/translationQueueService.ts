import { PrismaClient } from '@prisma/client';
import { Language, TranslationStatus, TranslationQuality } from '@/lib/types';
import { translateText, getOrCreateTranslatedDocument } from '@/lib/utils/translations';

const prisma = new PrismaClient();

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
        const existingJob = await prisma.document_translations.findUnique({
          where: {
            document_id_target_language: {
              document_id: documentId,
              target_language: targetLanguage
            }
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
    const pendingJobs = await prisma.documentTranslationJob.findMany({
      where: {
        status: TranslationStatus.PENDING,
        attempts: {
          lt: prisma.documentTranslationJob.fields.maxAttempts
        }
      },
      include: {
        document: true
      },
      take: batchSize,
      orderBy: {
        createdAt: 'asc'
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
    const job = await prisma.documentTranslationJob.findUnique({
      where: { id: jobId },
      include: { document: true }
    });

    if (!job || !job.document) {
      console.error(`Translation job not found: ${jobId}`);
      return;
    }

    try {
      // Mark job as processing
      await prisma.documentTranslationJob.update({
        where: { id: jobId },
        data: {
          status: TranslationStatus.PROCESSING,
          startedAt: new Date(),
          attempts: {
            increment: 1
          }
        }
      });

      const sourceLanguage = job.document.sourceLanguage || job.document.language;
      
      // Check if content is extractable for translation
      const isExtractable = await this.isContentExtractable(job.document.fileType);
      
      if (!isExtractable) {
        // Create metadata-only translation
        await this.createMetadataOnlyTranslation(job.document, job.targetLanguage as Language);
      } else {
        // Create full content translation
        await getOrCreateTranslatedDocument(
          job.document.id,
          job.targetLanguage as Language
        );
      }

      // Mark job as completed
      await prisma.documentTranslationJob.update({
        where: { id: jobId },
        data: {
          status: TranslationStatus.COMPLETED,
          completedAt: new Date()
        }
      });

      console.log(`Translation job completed: ${jobId}`);

    } catch (error) {
      console.error(`Translation job failed: ${jobId}`, error);
      
      // Update job with error
      await prisma.documentTranslationJob.update({
        where: { id: jobId },
        data: {
          status: TranslationStatus.FAILED,
          errorMessage: (error as Error).message
        }
      });
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
    const failedJobs = await prisma.documentTranslationJob.findMany({
      where: {
        status: TranslationStatus.FAILED,
        attempts: {
          lt: prisma.documentTranslationJob.fields.maxAttempts
        }
      }
    });

    for (const job of failedJobs) {
      // Reset job status to pending for retry
      await prisma.documentTranslationJob.update({
        where: { id: job.id },
        data: {
          status: TranslationStatus.PENDING,
          errorMessage: null
        }
      });
    }

    console.log(`Queued ${failedJobs.length} failed jobs for retry`);
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
      prisma.documentTranslationJob.count({ where: { status: TranslationStatus.PENDING } }),
      prisma.documentTranslationJob.count({ where: { status: TranslationStatus.PROCESSING } }),
      prisma.documentTranslationJob.count({ where: { status: TranslationStatus.COMPLETED } }),
      prisma.documentTranslationJob.count({ where: { status: TranslationStatus.FAILED } }),
      prisma.documentTranslationJob.count()
    ]);

    return { pending, processing, completed, failed, total };
  }
}