import { RecoveryState, TranslationRequest, ProgressUpdate, TranslationElement } from '../types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class RecoveryManager {
  private recoveryDir: string;
  private autoSaveInterval: number;
  private autoSaveTimer?: NodeJS.Timeout;
  private currentState?: RecoveryState;

  constructor(recoveryDir: string = './translation_recovery', autoSaveInterval: number = 30000) {
    this.recoveryDir = recoveryDir;
    this.autoSaveInterval = autoSaveInterval;
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.recoveryDir, { recursive: true });
  }

  async createRecoverySession(request: TranslationRequest): Promise<string> {
    const id = `recovery_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    this.currentState = {
      id,
      timestamp: Date.now(),
      request,
      progress: {
        current: 0,
        total: Object.keys(request.elements).length,
        percentage: 0,
        phase: 'initializing'
      },
      completedElements: [],
      failedElements: [],
      translatedElements: {}
    };

    await this.saveState();
    this.startAutoSave();
    
    return id;
  }

  async updateProgress(progress: ProgressUpdate): Promise<void> {
    if (this.currentState) {
      this.currentState.progress = progress;
      this.currentState.timestamp = Date.now();
    }
  }

  async addCompletedElement(elementId: string, translation: TranslationElement): Promise<void> {
    if (this.currentState) {
      this.currentState.completedElements.push(elementId);
      this.currentState.translatedElements[elementId] = translation;
      this.currentState.timestamp = Date.now();
    }
  }

  async addFailedElement(elementId: string): Promise<void> {
    if (this.currentState) {
      this.currentState.failedElements.push(elementId);
      this.currentState.timestamp = Date.now();
    }
  }

  async saveState(): Promise<void> {
    if (!this.currentState) return;
    
    const filePath = path.join(this.recoveryDir, `${this.currentState.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(this.currentState, null, 2));
  }

  async loadState(id: string): Promise<RecoveryState | null> {
    try {
      const filePath = path.join(this.recoveryDir, `${id}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      this.currentState = JSON.parse(data);
      return this.currentState;
    } catch (error) {
      return null;
    }
  }

  async listRecoverySessions(): Promise<Array<{ id: string; timestamp: number; progress: number }>> {
    try {
      const files = await fs.readdir(this.recoveryDir);
      const sessions = await Promise.all(
        files
          .filter(file => file.endsWith('.json'))
          .map(async file => {
            try {
              const filePath = path.join(this.recoveryDir, file);
              const data = await fs.readFile(filePath, 'utf-8');
              const state: RecoveryState = JSON.parse(data);
              return {
                id: state.id,
                timestamp: state.timestamp,
                progress: state.progress.percentage
              };
            } catch {
              return null;
            }
          })
      );
      
      return sessions.filter((s): s is { id: string; timestamp: number; progress: number } => s !== null);
    } catch {
      return [];
    }
  }

  async deleteRecoverySession(id: string): Promise<void> {
    try {
      const filePath = path.join(this.recoveryDir, `${id}.json`);
      await fs.unlink(filePath);
    } catch {
      // Ignore errors
    }
  }

  async getResumableElements(state: RecoveryState): Promise<Record<string, TranslationElement>> {
    const remainingElements: Record<string, TranslationElement> = {};
    const completedIds = new Set(state.completedElements);
    const failedIds = new Set(state.failedElements);
    
    Object.entries(state.request.elements).forEach(([id, element]) => {
      if (!completedIds.has(id)) {
        remainingElements[id] = element;
      }
    });
    
    return remainingElements;
  }

  private startAutoSave(): void {
    this.stopAutoSave();
    this.autoSaveTimer = setInterval(() => {
      this.saveState().catch(console.error);
    }, this.autoSaveInterval);
  }

  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
    }
  }

  async complete(): Promise<void> {
    this.stopAutoSave();
    if (this.currentState) {
      this.currentState.progress.phase = 'completed';
      await this.saveState();
    }
  }

  async cleanup(olderThanDays: number = 7): Promise<void> {
    const files = await fs.readdir(this.recoveryDir);
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    
    await Promise.all(
      files.map(async file => {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.recoveryDir, file);
          const stats = await fs.stat(filePath);
          if (stats.mtime.getTime() < cutoffTime) {
            await fs.unlink(filePath);
          }
        }
      })
    );
  }
}