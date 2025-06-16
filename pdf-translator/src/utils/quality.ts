import { QualityCheckResult, QualityIssue } from '../types';

export class QualityChecker {
  private readonly lengthRatioThreshold: number;
  private readonly minLengthRatio: number;
  private readonly maxLengthRatio: number;

  constructor(options?: {
    minLengthRatio?: number;
    maxLengthRatio?: number;
  }) {
    this.minLengthRatio = options?.minLengthRatio || 0.5;
    this.maxLengthRatio = options?.maxLengthRatio || 2.0;
    this.lengthRatioThreshold = 0.3; // 30% deviation warning
  }

  check(
    original: string,
    translated: string,
    elementId: string,
    sourceLang: string,
    targetLang: string
  ): QualityCheckResult {
    const issues: QualityIssue[] = [];
    
    // Check for empty translation
    if (!translated.trim()) {
      issues.push({
        type: 'untranslated',
        severity: 'error',
        elementId,
        description: 'Translation is empty',
        original,
        translated
      });
    }

    // Check if text appears untranslated
    if (original === translated && original.length > 10) {
      issues.push({
        type: 'untranslated',
        severity: 'warning',
        elementId,
        description: 'Text appears to be untranslated',
        original,
        translated
      });
    }

    // Check length ratio
    const lengthRatio = translated.length / original.length;
    if (lengthRatio < this.minLengthRatio || lengthRatio > this.maxLengthRatio) {
      const severity = Math.abs(1 - lengthRatio) > this.lengthRatioThreshold ? 'warning' : 'info';
      issues.push({
        type: 'length_mismatch',
        severity,
        elementId,
        description: `Translation length ratio is ${lengthRatio.toFixed(2)} (expected between ${this.minLengthRatio} and ${this.maxLengthRatio})`,
        original,
        translated
      });
    }

    // Check format preservation
    const formatIssues = this.checkFormatting(original, translated, elementId);
    issues.push(...formatIssues);

    // Check placeholder preservation
    const placeholderIssues = this.checkPlaceholders(original, translated, elementId);
    issues.push(...placeholderIssues);

    // Calculate quality score
    const score = this.calculateScore(issues);

    return {
      passed: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      score
    };
  }

  private checkFormatting(original: string, translated: string, elementId: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Check line break preservation
    const originalLineBreaks = (original.match(/\n/g) || []).length;
    const translatedLineBreaks = (translated.match(/\n/g) || []).length;
    
    if (originalLineBreaks !== translatedLineBreaks) {
      issues.push({
        type: 'format_mismatch',
        severity: 'warning',
        elementId,
        description: `Line break count mismatch: ${originalLineBreaks} → ${translatedLineBreaks}`,
        original,
        translated
      });
    }

    // Check bullet points
    const originalBullets = (original.match(/^[\s]*[•·▪▫◦‣⁃-]\s/gm) || []).length;
    const translatedBullets = (translated.match(/^[\s]*[•·▪▫◦‣⁃-]\s/gm) || []).length;
    
    if (originalBullets !== translatedBullets) {
      issues.push({
        type: 'format_mismatch',
        severity: 'warning',
        elementId,
        description: `Bullet point count mismatch: ${originalBullets} → ${translatedBullets}`,
        original,
        translated
      });
    }

    // Check numbered lists
    const originalNumbers = (original.match(/^\s*\d+[\.\)]\s/gm) || []).length;
    const translatedNumbers = (translated.match(/^\s*\d+[\.\)]\s/gm) || []).length;
    
    if (originalNumbers !== translatedNumbers) {
      issues.push({
        type: 'format_mismatch',
        severity: 'warning',
        elementId,
        description: `Numbered list item count mismatch: ${originalNumbers} → ${translatedNumbers}`,
        original,
        translated
      });
    }

    return issues;
  }

  private checkPlaceholders(original: string, translated: string, elementId: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Common placeholder patterns
    const placeholderPatterns = [
      /\{[^}]+\}/g,           // {placeholder}
      /\[[^\]]+\]/g,          // [placeholder]
      /%[sdifg]/g,            // %s, %d, etc.
      /\$\{[^}]+\}/g,         // ${placeholder}
      /\{\{[^}]+\}\}/g,       // {{placeholder}}
      /#\{[^}]+\}/g,          // #{placeholder}
    ];

    for (const pattern of placeholderPatterns) {
      const originalMatches = original.match(pattern) || [];
      const translatedMatches = translated.match(pattern) || [];

      if (originalMatches.length !== translatedMatches.length) {
        issues.push({
          type: 'placeholder_mismatch',
          severity: 'error',
          elementId,
          description: `Placeholder count mismatch for pattern ${pattern.source}: ${originalMatches.length} → ${translatedMatches.length}`,
          original,
          translated
        });
      } else if (originalMatches.length > 0) {
        // Check if placeholders match exactly
        const originalSet = new Set(originalMatches);
        const translatedSet = new Set(translatedMatches);
        
        if (!this.setsEqual(originalSet, translatedSet)) {
          issues.push({
            type: 'placeholder_mismatch',
            severity: 'error',
            elementId,
            description: `Placeholder content mismatch: ${Array.from(originalSet).join(', ')} → ${Array.from(translatedSet).join(', ')}`,
            original,
            translated
          });
        }
      }
    }

    // Check for URLs
    const urlPattern = /https?:\/\/[^\s]+/g;
    const originalUrls = original.match(urlPattern) || [];
    const translatedUrls = translated.match(urlPattern) || [];
    
    if (!this.arraysEqual(originalUrls, translatedUrls)) {
      issues.push({
        type: 'placeholder_mismatch',
        severity: 'error',
        elementId,
        description: 'URL mismatch in translation',
        original,
        translated
      });
    }

    // Check for email addresses
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const originalEmails = original.match(emailPattern) || [];
    const translatedEmails = translated.match(emailPattern) || [];
    
    if (!this.arraysEqual(originalEmails, translatedEmails)) {
      issues.push({
        type: 'placeholder_mismatch',
        severity: 'error',
        elementId,
        description: 'Email address mismatch in translation',
        original,
        translated
      });
    }

    return issues;
  }

  private calculateScore(issues: QualityIssue[]): number {
    if (issues.length === 0) return 100;

    const weights = {
      error: 10,
      warning: 5,
      info: 1
    };

    const totalPenalty = issues.reduce((sum, issue) => {
      return sum + weights[issue.severity];
    }, 0);

    return Math.max(0, 100 - totalPenalty);
  }

  private setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
    if (a.size !== b.size) return false;
    for (const item of a) {
      if (!b.has(item)) return false;
    }
    return true;
  }

  private arraysEqual<T>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  }
}