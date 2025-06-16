import {
  TranslationRequest,
  TranslationResult,
  TranslationElement,
  TranslationModel,
  TranslationOptions,
  TranslationCost,
  BatchProcessingOptions,
  ProgressUpdate,
} from '../types';
import {
  createBatches,
  deduplicateContent,
  distributeTranslations,
  processBatchesWithConcurrency,
  Batch,
} from '../utils/batch';
import { ProgressTracker } from '../utils/progress';
import { QualityChecker } from '../utils/quality';
import { RecoveryManager } from '../utils/recovery';

export class TranslationService {
  private model: TranslationModel;
  private qualityChecker: QualityChecker;
  private recoveryManager: RecoveryManager;

  constructor(
    model: TranslationModel,
    options?: {
      recoveryDir?: string;
      qualityCheckOptions?: {
        minLengthRatio?: number;
        maxLengthRatio?: number;
      };
    }
  ) {
    this.model = model;
    this.qualityChecker = new QualityChecker(options?.qualityCheckOptions);
    this.recoveryManager = new RecoveryManager(options?.recoveryDir);
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const startTime = Date.now();
    const progressTracker = new ProgressTracker(request.options?.onProgress);
    
    try {
      // Initialize recovery
      await this.recoveryManager.initialize();
      const recoveryId = await this.recoveryManager.createRecoverySession(request);
      
      progressTracker.setPhase('extracting', 'Analyzing content...');
      
      // Deduplicate content to reduce API calls
      const { uniqueTexts, elementMap } = deduplicateContent(request.elements);
      progressTracker.setTotal(uniqueTexts.size);
      
      progressTracker.setPhase('preparing', 'Preparing translation batches...');
      
      // Create batches for translation
      const batchOptions: BatchProcessingOptions = {
        maxBatchSize: request.options?.batchSize || 10,
        maxTokensPerBatch: 2000, // Adjust based on model limits
        concurrentBatches: 3,
        delayBetweenBatches: 100,
      };
      
      const textEntries = Array.from(uniqueTexts.entries()).map(([text, ids]) => ({
        text,
        ids,
      }));
      
      const batches = createBatches(textEntries, batchOptions);
      
      progressTracker.setPhase('translating', `Translating ${uniqueTexts.size} unique texts...`);
      
      // Process batches
      const translatedBatches = await processBatchesWithConcurrency(
        batches,
        async (batch: Batch<{ text: string; ids: string[] }>) => {
          const texts = batch.items.map(item => item.text);
          const translations = await this.model.translateBatch(
            texts,
            request.sourceLang,
            request.targetLang,
            request.options
          );
          
          // Update progress
          progressTracker.increment(batch.items.length);
          await this.recoveryManager.updateProgress(progressTracker.getProgress());
          
          return { items: batch.items, translations };
        },
        batchOptions.concurrentBatches,
        batchOptions.delayBetweenBatches
      );
      
      progressTracker.setPhase('validating', 'Validating translations...');
      
      // Build translation map
      const uniqueTranslations = new Map<string, string>();
      const errors: Array<{ elementId: string; error: string }> = [];
      let totalCost: TranslationCost = {
        inputTokens: 0,
        outputTokens: 0,
        totalCost: 0,
        currency: 'USD',
      };
      
      for (const batch of translatedBatches) {
        batch.items.forEach((item, index) => {
          const translation = batch.translations[index];
          
          if (translation) {
            // Quality check if enabled
            if (request.options?.quality === 'professional') {
              const qualityResult = this.qualityChecker.check(
                item.text,
                translation,
                item.ids[0], // Use first ID for reporting
                request.sourceLang,
                request.targetLang
              );
              
              if (!qualityResult.passed) {
                // For professional quality, try to fix issues
                // In a real implementation, you might re-translate
                console.warn(`Quality issues detected for element ${item.ids[0]}:`, qualityResult.issues);
              }
            }
            
            uniqueTranslations.set(item.text, translation);
            
            // Mark elements as completed
            for (const id of item.ids) {
              await this.recoveryManager.addCompletedElement(id, {
                ...request.elements[id],
                text: translation,
              });
            }
          } else {
            // Handle translation failure
            for (const id of item.ids) {
              errors.push({ elementId: id, error: 'Translation failed' });
              await this.recoveryManager.addFailedElement(id);
            }
          }
        });
      }
      
      // Estimate costs
      const totalInputTokens = Array.from(uniqueTexts.keys()).reduce(
        (sum, text) => sum + Math.ceil(text.length / 4),
        0
      );
      const totalOutputTokens = Array.from(uniqueTranslations.values()).reduce(
        (sum, text) => sum + Math.ceil(text.length / 4),
        0
      );
      totalCost = this.model.estimateCost(totalInputTokens, totalOutputTokens);
      
      progressTracker.setPhase('applying', 'Applying translations...');
      
      // Distribute translations back to all elements
      const translatedElements = distributeTranslations(
        uniqueTranslations,
        elementMap,
        request.elements
      );
      
      // Complete recovery session
      await this.recoveryManager.complete();
      progressTracker.setPhase('completed', 'Translation completed!');
      
      const executionTime = Date.now() - startTime;
      
      return {
        translatedElements,
        metadata: {
          totalElements: Object.keys(request.elements).length,
          translatedElements: Object.keys(translatedElements).length,
          failedElements: errors.length,
          executionTime,
          cost: totalCost,
          errors: errors.map(e => ({
            elementId: e.elementId,
            error: e.error,
            code: 'TRANSLATION_FAILED',
            retryable: true,
          })),
        },
      };
    } catch (error) {
      progressTracker.setPhase('error', `Translation failed: ${error.message}`);
      await this.recoveryManager.saveState();
      throw error;
    }
  }

  async resumeTranslation(recoveryId: string): Promise<TranslationResult | null> {
    const state = await this.recoveryManager.loadState(recoveryId);
    if (!state) {
      return null;
    }
    
    // Get remaining elements
    const remainingElements = await this.recoveryManager.getResumableElements(state);
    
    // Create new request with remaining elements
    const resumeRequest: TranslationRequest = {
      ...state.request,
      elements: remainingElements,
    };
    
    // Continue translation
    const result = await this.translate(resumeRequest);
    
    // Merge with previously completed translations
    return {
      translatedElements: {
        ...state.translatedElements,
        ...result.translatedElements,
      },
      metadata: {
        ...result.metadata,
        totalElements: Object.keys(state.request.elements).length,
        translatedElements: Object.keys(state.translatedElements).length + result.metadata.translatedElements,
      },
    };
  }

  async listRecoverySessions() {
    return this.recoveryManager.listRecoverySessions();
  }

  async cleanupOldSessions(olderThanDays: number = 7) {
    return this.recoveryManager.cleanup(olderThanDays);
  }
}