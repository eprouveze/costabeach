import { TranslationElement, BatchProcessingOptions } from '../types';

export interface Batch<T> {
  id: string;
  items: T[];
  tokenCount: number;
}

export function createBatches<T extends { text: string }>(
  items: T[],
  options: BatchProcessingOptions
): Batch<T>[] {
  const batches: Batch<T>[] = [];
  let currentBatch: T[] = [];
  let currentTokenCount = 0;
  let batchIndex = 0;

  for (const item of items) {
    const itemTokens = estimateTokens(item.text);
    
    // Check if adding this item would exceed limits
    if (
      currentBatch.length > 0 && 
      (currentBatch.length >= options.maxBatchSize || 
       currentTokenCount + itemTokens > options.maxTokensPerBatch)
    ) {
      // Create a new batch
      batches.push({
        id: `batch-${batchIndex++}`,
        items: currentBatch,
        tokenCount: currentTokenCount
      });
      currentBatch = [];
      currentTokenCount = 0;
    }
    
    currentBatch.push(item);
    currentTokenCount += itemTokens;
  }
  
  // Add the last batch if it has items
  if (currentBatch.length > 0) {
    batches.push({
      id: `batch-${batchIndex}`,
      items: currentBatch,
      tokenCount: currentTokenCount
    });
  }
  
  return batches;
}

export function deduplicateContent(
  elements: Record<string, TranslationElement>
): {
  uniqueTexts: Map<string, string[]>,
  elementMap: Record<string, string>
} {
  const uniqueTexts = new Map<string, string[]>();
  const elementMap: Record<string, string> = {};
  
  // Group elements by their text content
  Object.entries(elements).forEach(([id, element]) => {
    const text = element.text.trim();
    if (text) {
      if (!uniqueTexts.has(text)) {
        uniqueTexts.set(text, []);
      }
      uniqueTexts.get(text)!.push(id);
      elementMap[id] = text;
    }
  });
  
  return { uniqueTexts, elementMap };
}

export function distributeTranslations(
  uniqueTranslations: Map<string, string>,
  elementMap: Record<string, string>,
  originalElements: Record<string, TranslationElement>
): Record<string, TranslationElement> {
  const translatedElements: Record<string, TranslationElement> = {};
  
  Object.entries(elementMap).forEach(([elementId, originalText]) => {
    const translation = uniqueTranslations.get(originalText);
    if (translation) {
      translatedElements[elementId] = {
        ...originalElements[elementId],
        text: translation
      };
    }
  });
  
  return translatedElements;
}

export async function processBatchesWithConcurrency<T, R>(
  batches: Batch<T>[],
  processor: (batch: Batch<T>) => Promise<R>,
  concurrency: number = 3,
  delayBetweenBatches: number = 0
): Promise<R[]> {
  const results: R[] = [];
  const queue = [...batches];
  const inProgress = new Set<Promise<void>>();
  
  while (queue.length > 0 || inProgress.size > 0) {
    // Start new tasks up to concurrency limit
    while (queue.length > 0 && inProgress.size < concurrency) {
      const batch = queue.shift()!;
      
      const task = processor(batch)
        .then(result => {
          results.push(result);
          if (delayBetweenBatches > 0) {
            return new Promise<void>(resolve => 
              setTimeout(resolve, delayBetweenBatches)
            );
          }
        })
        .finally(() => {
          inProgress.delete(task);
        });
      
      inProgress.add(task);
    }
    
    // Wait for at least one task to complete
    if (inProgress.size > 0) {
      await Promise.race(inProgress);
    }
  }
  
  return results;
}

function estimateTokens(text: string): number {
  // Simple estimation: ~4 characters per token
  // This matches the estimation in the base provider
  return Math.ceil(text.length / 4);
}

export function splitTextIntoChunks(
  text: string,
  maxChunkSize: number,
  delimiter: string = '\n'
): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }
  
  const chunks: string[] = [];
  const lines = text.split(delimiter);
  let currentChunk = '';
  
  for (const line of lines) {
    const lineWithDelimiter = line + delimiter;
    
    if (currentChunk.length + lineWithDelimiter.length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trimEnd());
        currentChunk = '';
      }
      
      // If a single line is too long, split it
      if (lineWithDelimiter.length > maxChunkSize) {
        const words = line.split(' ');
        let wordChunk = '';
        
        for (const word of words) {
          if (wordChunk.length + word.length + 1 > maxChunkSize) {
            if (wordChunk) {
              chunks.push(wordChunk.trimEnd());
              wordChunk = '';
            }
          }
          wordChunk += (wordChunk ? ' ' : '') + word;
        }
        
        if (wordChunk) {
          currentChunk = wordChunk + delimiter;
        }
      } else {
        currentChunk = lineWithDelimiter;
      }
    } else {
      currentChunk += lineWithDelimiter;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trimEnd());
  }
  
  return chunks;
}