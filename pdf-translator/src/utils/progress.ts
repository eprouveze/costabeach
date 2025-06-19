import { ProgressUpdate, TranslationPhase } from '../types';

export class ProgressTracker {
  private current: number = 0;
  private total: number = 0;
  private phase: TranslationPhase = 'initializing';
  private startTime: number = Date.now();
  private phaseStartTime: number = Date.now();
  private callback?: (update: ProgressUpdate) => void;

  constructor(callback?: (update: ProgressUpdate) => void) {
    this.callback = callback;
  }

  setTotal(total: number): void {
    this.total = total;
    this.reportProgress();
  }

  setPhase(phase: TranslationPhase, message?: string): void {
    this.phase = phase;
    this.phaseStartTime = Date.now();
    this.reportProgress(message);
  }

  increment(amount: number = 1): void {
    this.current = Math.min(this.current + amount, this.total);
    this.reportProgress();
  }

  setCurrent(current: number): void {
    this.current = Math.min(current, this.total);
    this.reportProgress();
  }

  reset(): void {
    this.current = 0;
    this.total = 0;
    this.phase = 'initializing';
    this.startTime = Date.now();
    this.phaseStartTime = Date.now();
  }

  getProgress(): ProgressUpdate {
    const percentage = this.total > 0 ? (this.current / this.total) * 100 : 0;
    const elapsed = Date.now() - this.startTime;
    const estimatedTimeRemaining = this.estimateTimeRemaining();

    return {
      current: this.current,
      total: this.total,
      percentage,
      phase: this.phase,
      estimatedTimeRemaining
    };
  }

  private reportProgress(message?: string): void {
    if (this.callback) {
      const update = this.getProgress();
      if (message) {
        update.message = message;
      }
      this.callback(update);
    }
  }

  private estimateTimeRemaining(): number | undefined {
    if (this.current === 0 || this.total === 0) {
      return undefined;
    }

    const elapsed = Date.now() - this.startTime;
    const rate = this.current / elapsed;
    const remaining = this.total - this.current;
    
    return remaining / rate;
  }
}

export class BatchProgressTracker extends ProgressTracker {
  private batchSizes: Map<string, number> = new Map();
  private batchProgress: Map<string, number> = new Map();

  setBatchSize(batchId: string, size: number): void {
    this.batchSizes.set(batchId, size);
    this.updateTotal();
  }

  updateBatchProgress(batchId: string, progress: number): void {
    this.batchProgress.set(batchId, progress);
    this.updateCurrent();
  }

  completeBatch(batchId: string): void {
    const size = this.batchSizes.get(batchId) || 0;
    this.batchProgress.set(batchId, size);
    this.updateCurrent();
  }

  private updateTotal(): void {
    const total = Array.from(this.batchSizes.values()).reduce((sum, size) => sum + size, 0);
    this.setTotal(total);
  }

  private updateCurrent(): void {
    const current = Array.from(this.batchProgress.values()).reduce((sum, progress) => sum + progress, 0);
    this.setCurrent(current);
  }
}

export function createProgressBar(
  total: number,
  options?: {
    width?: number;
    complete?: string;
    incomplete?: string;
    head?: string;
    format?: string;
  }
): {
  update: (current: number, message?: string) => void;
  complete: () => void;
} {
  const width = options?.width || 40;
  const complete = options?.complete || '█';
  const incomplete = options?.incomplete || '░';
  const head = options?.head || '';
  const format = options?.format || ':bar :percent :message';

  let lastRender = '';

  const render = (current: number, message?: string) => {
    const percentage = Math.min(100, Math.round((current / total) * 100));
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    const bar = complete.repeat(Math.max(0, filled - 1)) + 
                (filled > 0 ? head || complete : '') + 
                incomplete.repeat(empty);
    
    const output = format
      .replace(':bar', bar)
      .replace(':percent', `${percentage}%`)
      .replace(':current', current.toString())
      .replace(':total', total.toString())
      .replace(':message', message || '');
    
    if (output !== lastRender) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(output);
      lastRender = output;
    }
  };

  return {
    update: render,
    complete: () => {
      render(total, 'Complete');
      process.stdout.write('\n');
    }
  };
}