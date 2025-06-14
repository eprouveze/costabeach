/**
 * Translation Worker Service
 * 
 * Background service that processes translation jobs from the queue.
 * Can be run as a cron job or continuous worker process.
 */

import { TranslationQueueService } from './translationQueueService';
import { prisma } from "@/lib/db";
import { TranslationStatus } from '@/lib/types';

export class TranslationWorker {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  
  /**
   * Start the background worker
   */
  async start(intervalMs: number = 30000): Promise<void> { // 30 seconds default
    if (this.isRunning) {
      console.log('Translation worker is already running');
      return;
    }
    
    this.isRunning = true;
    console.log('Starting translation worker...');
    
    // Process immediately
    await this.processBatch();
    
    // Set up recurring processing
    this.intervalId = setInterval(async () => {
      try {
        await this.processBatch();
      } catch (error) {
        console.error('Translation worker batch processing error:', error);
      }
    }, intervalMs);
    
    console.log(`Translation worker started with ${intervalMs}ms interval`);
  }
  
  /**
   * Stop the background worker
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('Translation worker is not running');
      return;
    }
    
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('Translation worker stopped');
  }
  
  /**
   * Process a batch of translation jobs
   */
  private async processBatch(): Promise<void> {
    try {
      // Get pending jobs count
      const stats = await TranslationQueueService.getTranslationStats();
      
      if (stats.pending === 0) {
        console.log('No pending translation jobs');
        return;
      }
      
      console.log(`Processing ${stats.pending} pending translation jobs...`);
      
      // Process jobs in batches to avoid overwhelming the system
      const batchSize = Math.min(stats.pending, 3); // Process max 3 at a time
      await TranslationQueueService.processPendingJobs(batchSize);
      
      // Log updated stats
      const updatedStats = await TranslationQueueService.getTranslationStats();
      console.log('Translation queue stats:', updatedStats);
      
    } catch (error) {
      console.error('Translation worker batch processing failed:', error);
    }
  }
  
  /**
   * Process a single job (useful for testing or manual processing)
   */
  async processJob(jobId: string): Promise<void> {
    try {
      console.log(`Processing translation job: ${jobId}`);
      await TranslationQueueService.processTranslationJob(jobId);
      console.log(`Translation job completed: ${jobId}`);
    } catch (error) {
      console.error(`Translation job failed: ${jobId}`, error);
      throw error;
    }
  }
  
  /**
   * Health check for the worker
   */
  async healthCheck(): Promise<{
    isRunning: boolean;
    stats: any;
    stalledJobs: number;
  }> {
    const stats = await TranslationQueueService.getTranslationStats();
    
    // Check for stalled jobs (processing for more than 30 minutes)
    const stalledJobs = await prisma.documentTranslationJob.count({
      where: {
        status: TranslationStatus.PROCESSING,
        startedAt: {
          lt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        }
      }
    });
    
    return {
      isRunning: this.isRunning,
      stats,
      stalledJobs
    };
  }
  
  /**
   * Recover stalled jobs
   */
  async recoverStalledJobs(): Promise<number> {
    const stalledJobsResult = await prisma.documentTranslationJob.updateMany({
      where: {
        status: TranslationStatus.PROCESSING,
        startedAt: {
          lt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        }
      },
      data: {
        status: TranslationStatus.PENDING,
        startedAt: null,
        errorMessage: 'Job stalled and recovered'
      }
    });
    
    console.log(`Recovered ${stalledJobsResult.count} stalled translation jobs`);
    return stalledJobsResult.count;
  }
  
  /**
   * Retry failed jobs
   */
  async retryFailedJobs(): Promise<void> {
    await TranslationQueueService.retryFailedJobs();
    console.log('Failed translation jobs queued for retry');
  }
}

// Singleton instance
export const translationWorker = new TranslationWorker();