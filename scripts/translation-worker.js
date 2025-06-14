#!/usr/bin/env node

/**
 * Translation Worker Cron Job
 * 
 * This script can be run as a cron job to process translation queue.
 * 
 * Usage:
 *   node scripts/translation-worker.js [--once] [--batch-size=5]
 * 
 * Options:
 *   --once        Process one batch and exit
 *   --batch-size  Number of jobs to process in one batch (default: 5)
 * 
 * Cron example (every 5 minutes):
 *   */5 * * * * cd /path/to/costabeach && node scripts/translation-worker.js --once
 */

const { TranslationQueueService } = require('../src/lib/services/translationQueueService');
const { TranslationWorker } = require('../src/lib/services/translationWorker');

async function main() {
  const args = process.argv.slice(2);
  const isOnce = args.includes('--once');
  const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='));
  const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 5;

  console.log(`Translation worker starting (once: ${isOnce}, batch: ${batchSize})`);

  try {
    if (isOnce) {
      // Process one batch and exit
      console.log('Processing single batch...');
      await TranslationQueueService.processPendingJobs(batchSize);
      
      const stats = await TranslationQueueService.getTranslationStats();
      console.log('Queue stats:', stats);
      
      console.log('Single batch processing completed');
      process.exit(0);
    } else {
      // Start continuous worker
      const worker = new TranslationWorker();
      await worker.start(30000); // 30 second intervals
      
      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log('Received SIGINT, shutting down gracefully...');
        worker.stop();
        process.exit(0);
      });
      
      process.on('SIGTERM', () => {
        console.log('Received SIGTERM, shutting down gracefully...');
        worker.stop();
        process.exit(0);
      });
      
      console.log('Translation worker is running. Press Ctrl+C to stop.');
    }
  } catch (error) {
    console.error('Translation worker error:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch((error) => {
  console.error('Main function error:', error);
  process.exit(1);
});