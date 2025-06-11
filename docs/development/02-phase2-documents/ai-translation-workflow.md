# AI Translation Workflow

## 🎯 Overview

Phase 2 introduces comprehensive AI-powered document translation using DeepL and OpenAI, enabling automatic translation of documents between French, Arabic, and English. The workflow includes job queuing, progress tracking, and quality validation.

## 🏗️ Current State Analysis

### Existing Translation Infrastructure ✅
```typescript
// From src/lib/api/routers/translations.ts (154 lines)
- Basic translation request handling
- Background job processing with Inngest
- Translation status tracking
- DeepL API integration foundation
```

### Enhancement Goals 🚀
1. **Complete Workflow**: End-to-end translation pipeline
2. **Quality Validation**: AI-powered quality scoring and validation
3. **Batch Processing**: Multiple document translation queues
4. **User Interface**: Translation request and progress tracking UI
5. **Cost Management**: Translation budget and usage tracking

## 🔄 Translation Workflow Architecture

### Enhanced Translation Router

**Update**: `src/lib/api/routers/translations.ts`
```typescript
import { z } from 'zod';
import { router, procedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { inngest } from '@/lib/inngest';
import { deepL, openai } from '@/lib/ai-clients';

export const translationsRouter = router({
  // Request document translation
  requestTranslation: procedure
    .input(z.object({
      documentId: z.string(),
      targetLanguage: z.enum(['en', 'fr', 'ar']),
      priority: z.enum(['low', 'normal', 'high']).default('normal'),
      translationType: z.enum(['professional', 'ai', 'hybrid']).default('professional'),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { documentId, targetLanguage, priority, translationType, notes } = input;
      
      // Verify document access
      const { data: document } = await ctx.supabase
        .from('documents')
        .select('id, title, language, file_size, searchable_text')
        .eq('id', documentId)
        .single();
      
      if (!document) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document not found',
        });
      }
      
      // Check if translation already exists
      const { data: existingTranslation } = await ctx.supabase
        .from('document_translations')
        .select('id, status')
        .eq('document_id', documentId)
        .eq('target_language', targetLanguage)
        .single();
      
      if (existingTranslation && existingTranslation.status !== 'failed') {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Translation already exists or in progress',
        });
      }
      
      // Estimate cost and complexity
      const estimatedCost = await estimateTranslationCost(
        document.searchable_text || '',
        document.language,
        targetLanguage,
        translationType
      );
      
      // Check user's translation budget (if applicable)
      if (ctx.user.role === 'user') {
        const hasExceededBudget = await checkTranslationBudget(ctx.user.id, estimatedCost);
        if (hasExceededBudget) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Monthly translation budget exceeded',
          });
        }
      }
      
      // Create translation job
      const { data: translation } = await ctx.supabase
        .from('document_translations')
        .insert({
          document_id: documentId,
          source_language: document.language,
          target_language: targetLanguage,
          status: 'pending',
          service_used: translationType === 'professional' ? 'deepl' : 'openai',
          requested_by: ctx.user.id,
          estimated_cost_cents: estimatedCost,
          notes,
        })
        .select()
        .single();
      
      // Queue background job
      const jobId = await inngest.send({
        name: 'document.translate',
        data: {
          translationId: translation.id,
          documentId,
          targetLanguage,
          translationType,
          priority,
          requestedBy: ctx.user.id,
        },
      });
      
      // Update translation with job ID
      await ctx.supabase
        .from('document_translations')
        .update({ job_id: jobId.ids[0] })
        .eq('id', translation.id);
      
      // Log audit action
      await logAuditAction(ctx.user.id, 'request_translation', 'document', documentId, {
        targetLanguage,
        translationType,
        estimatedCost,
      });
      
      return {
        translationId: translation.id,
        jobId: jobId.ids[0],
        status: 'pending',
        estimatedCost,
        estimatedCompletion: calculateEstimatedCompletion(priority, estimatedCost),
      };
    }),

  // Get translation status
  getTranslationStatus: procedure
    .input(z.string()) // translationId
    .query(async ({ input, ctx }) => {
      const { data: translation } = await ctx.supabase
        .from('document_translations')
        .select(`
          id, status, progress, confidence_score, translated_content,
          started_at, completed_at, error_message, service_used,
          actual_cost_cents, quality_score,
          document:document_id(title, language)
        `)
        .eq('id', input)
        .single();
      
      if (!translation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Translation not found',
        });
      }
      
      // Get job status from Inngest if still running
      let jobStatus = null;
      if (translation.job_id && ['pending', 'in_progress'].includes(translation.status)) {
        jobStatus = await inngest.jobs.get(translation.job_id);
      }
      
      return {
        ...translation,
        jobStatus,
        estimatedTimeRemaining: calculateTimeRemaining(translation),
      };
    }),

  // Get all translations for a document
  getDocumentTranslations: procedure
    .input(z.string()) // documentId
    .query(async ({ input, ctx }) => {
      const { data: translations } = await ctx.supabase
        .from('document_translations')
        .select(`
          id, target_language, status, confidence_score,
          completed_at, quality_score, service_used,
          requester:requested_by(name)
        `)
        .eq('document_id', input)
        .order('created_at', { ascending: false });
      
      return translations || [];
    }),

  // Get user's translation history
  getUserTranslations: procedure
    .input(z.object({
      status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { status, limit, offset } = input;
      
      let query = ctx.supabase
        .from('document_translations')
        .select(`
          id, status, target_language, progress, quality_score,
          created_at, completed_at, actual_cost_cents,
          document:document_id(id, title, language)
        `)
        .eq('requested_by', ctx.user.id)
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query.range(offset, offset + limit - 1);
      
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch translations',
        });
      }
      
      return {
        translations: data || [],
        hasMore: (data?.length || 0) === limit,
      };
    }),

  // Cancel translation
  cancelTranslation: procedure
    .input(z.string()) // translationId
    .mutation(async ({ input, ctx }) => {
      const { data: translation } = await ctx.supabase
        .from('document_translations')
        .select('id, status, job_id, requested_by')
        .eq('id', input)
        .single();
      
      if (!translation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Translation not found',
        });
      }
      
      // Check permissions
      if (translation.requested_by !== ctx.user.id && !['admin', 'contentEditor'].includes(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to cancel this translation',
        });
      }
      
      if (!['pending', 'in_progress'].includes(translation.status)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Translation cannot be cancelled',
        });
      }
      
      // Cancel the job
      if (translation.job_id) {
        await inngest.jobs.cancel(translation.job_id);
      }
      
      // Update status
      const { data } = await ctx.supabase
        .from('document_translations')
        .update({
          status: 'cancelled',
          error_message: 'Cancelled by user',
        })
        .eq('id', input)
        .select()
        .single();
      
      return data;
    }),

  // Retry failed translation
  retryTranslation: procedure
    .input(z.string()) // translationId
    .mutation(async ({ input, ctx }) => {
      const { data: translation } = await ctx.supabase
        .from('document_translations')
        .select('*')
        .eq('id', input)
        .single();
      
      if (!translation || translation.status !== 'failed') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Translation cannot be retried',
        });
      }
      
      // Reset translation status
      await ctx.supabase
        .from('document_translations')
        .update({
          status: 'pending',
          error_message: null,
          started_at: null,
          progress: 0,
        })
        .eq('id', input);
      
      // Queue new job
      const jobId = await inngest.send({
        name: 'document.translate',
        data: {
          translationId: input,
          documentId: translation.document_id,
          targetLanguage: translation.target_language,
          translationType: translation.service_used === 'deepl' ? 'professional' : 'ai',
          priority: 'normal',
          requestedBy: ctx.user.id,
        },
      });
      
      return { jobId: jobId.ids[0] };
    }),

  // Rate translation quality
  rateTranslation: procedure
    .input(z.object({
      translationId: z.string(),
      rating: z.number().min(1).max(5),
      feedback: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { translationId, rating, feedback } = input;
      
      const { data } = await ctx.supabase
        .from('document_translations')
        .update({
          user_rating: rating,
          user_feedback: feedback,
        })
        .eq('id', translationId)
        .eq('requested_by', ctx.user.id)
        .select()
        .single();
      
      if (!data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Translation not found or not authorized',
        });
      }
      
      return data;
    }),

  // Admin: Get translation analytics
  getTranslationAnalytics: procedure
    .input(z.object({
      dateRange: z.object({
        from: z.date(),
        to: z.date(),
      }),
    }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }
      
      const { dateRange } = input;
      
      // Get translation volume and costs
      const { data: analytics } = await ctx.supabase
        .from('document_translations')
        .select('status, service_used, actual_cost_cents, quality_score, created_at')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());
      
      const summary = {
        totalTranslations: analytics?.length || 0,
        completedTranslations: analytics?.filter(t => t.status === 'completed').length || 0,
        totalCostCents: analytics?.reduce((sum, t) => sum + (t.actual_cost_cents || 0), 0) || 0,
        averageQuality: analytics?.filter(t => t.quality_score)
          .reduce((sum, t) => sum + t.quality_score, 0) / 
          (analytics?.filter(t => t.quality_score).length || 1) || 0,
        serviceBreakdown: {
          deepl: analytics?.filter(t => t.service_used === 'deepl').length || 0,
          openai: analytics?.filter(t => t.service_used === 'openai').length || 0,
        },
      };
      
      return { analytics, summary };
    }),
});

// Helper functions
async function estimateTranslationCost(
  text: string, 
  sourceLanguage: string, 
  targetLanguage: string, 
  type: string
): Promise<number> {
  const wordCount = text.split(/\s+/).length;
  
  if (type === 'professional') {
    // DeepL pricing: ~$25 per million characters
    const charCount = text.length;
    return Math.ceil(charCount * 0.000025 * 100); // Convert to cents
  } else {
    // OpenAI pricing: ~$0.002 per 1K tokens
    const estimatedTokens = wordCount * 1.3; // Rough estimation
    return Math.ceil(estimatedTokens * 0.000002 * 100); // Convert to cents
  }
}

async function checkTranslationBudget(userId: string, estimatedCost: number): Promise<boolean> {
  // Check monthly budget (would be configurable per user/role)
  const monthlyBudgetCents = 500; // $5 monthly budget for regular users
  
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);
  
  const { data: monthlyUsage } = await supabase
    .from('document_translations')
    .select('actual_cost_cents')
    .eq('requested_by', userId)
    .gte('created_at', currentMonth.toISOString())
    .eq('status', 'completed');
  
  const currentUsage = monthlyUsage?.reduce((sum, t) => sum + (t.actual_cost_cents || 0), 0) || 0;
  
  return (currentUsage + estimatedCost) > monthlyBudgetCents;
}

function calculateEstimatedCompletion(priority: string, estimatedCost: number): Date {
  const baseMinutes = Math.max(2, Math.ceil(estimatedCost / 10)); // 2 min minimum, 1 min per 10 cents
  
  const priorityMultiplier = {
    high: 0.5,
    normal: 1,
    low: 2,
  }[priority] || 1;
  
  const estimatedMinutes = baseMinutes * priorityMultiplier;
  
  return new Date(Date.now() + estimatedMinutes * 60 * 1000);
}
```

### Background Translation Job

**Create**: `src/lib/inngest/translation-job.ts`
```typescript
import { inngest } from './client';
import { createSupabaseClient } from '@/lib/supabase';
import { deepL, openai } from '@/lib/ai-clients';
import { extractTextFromPDF } from '@/lib/pdf-utils';

export const translateDocumentJob = inngest.createFunction(
  { id: 'document.translate' },
  { event: 'document.translate' },
  async ({ event, step }) => {
    const { translationId, documentId, targetLanguage, translationType } = event.data;
    const supabase = createSupabaseClient();
    
    // Step 1: Get translation record and document
    const { translation, document } = await step.run('get-translation-data', async () => {
      const { data: translation } = await supabase
        .from('document_translations')
        .select('*')
        .eq('id', translationId)
        .single();
      
      const { data: document } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();
      
      if (!translation || !document) {
        throw new Error('Translation or document not found');
      }
      
      return { translation, document };
    });
    
    // Step 2: Update status to in_progress
    await step.run('update-status-in-progress', async () => {
      await supabase
        .from('document_translations')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
          progress: 10,
        })
        .eq('id', translationId);
    });
    
    // Step 3: Extract text if not already available
    const extractedText = await step.run('extract-text', async () => {
      if (document.searchable_text) {
        return document.searchable_text;
      }
      
      // Download and extract text from PDF
      const { data: signedUrl } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600);
      
      if (!signedUrl?.signedUrl) {
        throw new Error('Failed to get document URL');
      }
      
      const text = await extractTextFromPDF(signedUrl.signedUrl);
      
      // Update document with extracted text
      await supabase
        .from('documents')
        .update({ searchable_text: text })
        .eq('id', documentId);
      
      return text;
    });
    
    // Step 4: Update progress
    await step.run('update-progress-30', async () => {
      await supabase
        .from('document_translations')
        .update({ progress: 30 })
        .eq('id', translationId);
    });
    
    // Step 5: Perform translation
    const translationResult = await step.run('perform-translation', async () => {
      try {
        if (translationType === 'professional' && ['en', 'fr', 'de', 'es'].includes(targetLanguage)) {
          // Use DeepL for professional translation
          const result = await deepL.translateText(
            extractedText,
            document.language,
            targetLanguage
          );
          
          return {
            translatedText: result.text,
            confidence: 0.95, // DeepL is generally high quality
            service: 'deepl',
            detectedLanguage: result.detectedSourceLang,
          };
        } else {
          // Use OpenAI for AI translation (supports Arabic better)
          const result = await translateWithOpenAI(
            extractedText,
            document.language,
            targetLanguage
          );
          
          return {
            translatedText: result.translation,
            confidence: result.confidence,
            service: 'openai',
            detectedLanguage: document.language,
          };
        }
      } catch (error) {
        console.error('Translation failed:', error);
        throw error;
      }
    });
    
    // Step 6: Update progress
    await step.run('update-progress-80', async () => {
      await supabase
        .from('document_translations')
        .update({ progress: 80 })
        .eq('id', translationId);
    });
    
    // Step 7: Quality validation
    const qualityScore = await step.run('validate-quality', async () => {
      return await validateTranslationQuality(
        extractedText,
        translationResult.translatedText,
        document.language,
        targetLanguage
      );
    });
    
    // Step 8: Calculate actual cost
    const actualCost = await step.run('calculate-cost', async () => {
      if (translationResult.service === 'deepl') {
        return Math.ceil(extractedText.length * 0.000025 * 100);
      } else {
        // OpenAI cost calculation based on tokens used
        const tokens = Math.ceil(extractedText.length / 4); // Rough token estimation
        return Math.ceil(tokens * 0.000002 * 100);
      }
    });
    
    // Step 9: Complete translation
    await step.run('complete-translation', async () => {
      await supabase
        .from('document_translations')
        .update({
          status: 'completed',
          translated_content: translationResult.translatedText,
          confidence_score: translationResult.confidence,
          quality_score: qualityScore,
          actual_cost_cents: actualCost,
          completed_at: new Date().toISOString(),
          progress: 100,
        })
        .eq('id', translationId);
    });
    
    // Step 10: Send notification
    await step.run('send-notification', async () => {
      await inngest.send({
        name: 'notification.send',
        data: {
          userId: translation.requested_by,
          type: 'translation_completed',
          data: {
            documentTitle: document.title,
            targetLanguage,
            translationId,
            qualityScore,
          },
        },
      });
    });
    
    return {
      success: true,
      translationId,
      qualityScore,
      actualCost,
    };
  }
);

// OpenAI translation function
async function translateWithOpenAI(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<{ translation: string; confidence: number }> {
  const languageNames = {
    en: 'English',
    fr: 'French',
    ar: 'Arabic',
  };
  
  const prompt = `
You are a professional document translator specializing in legal and administrative documents.

Translate the following text from ${languageNames[sourceLanguage]} to ${languageNames[targetLanguage]}.

Requirements:
1. Maintain the original formatting and structure
2. Preserve technical terms and proper nouns
3. Use formal, professional language appropriate for official documents
4. Maintain accuracy while ensuring natural flow in the target language

Text to translate:
${text}

Provide your translation followed by a confidence score (0.0-1.0) indicating the quality and accuracy of the translation.

Format your response as JSON:
{
  "translation": "your translation here",
  "confidence": 0.85,
  "notes": "any important translation notes"
}
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: Math.min(4000, text.length * 2),
  });
  
  try {
    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      translation: result.translation || '',
      confidence: result.confidence || 0.5,
    };
  } catch (error) {
    // Fallback if JSON parsing fails
    return {
      translation: response.choices[0].message.content || '',
      confidence: 0.7,
    };
  }
}

// Quality validation function
async function validateTranslationQuality(
  originalText: string,
  translatedText: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<number> {
  try {
    const validationPrompt = `
You are a translation quality assessor. Evaluate the quality of this translation on a scale of 0.0 to 1.0.

Consider:
1. Accuracy - Is the meaning preserved?
2. Fluency - Does it read naturally in the target language?
3. Completeness - Is all content translated?
4. Terminology - Are technical terms handled correctly?
5. Formatting - Is structure preserved?

Original (${sourceLanguage}):
${originalText.substring(0, 1000)}...

Translation (${targetLanguage}):
${translatedText.substring(0, 1000)}...

Respond with only a number between 0.0 and 1.0:
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: validationPrompt }],
      temperature: 0.1,
      max_tokens: 10,
    });
    
    const score = parseFloat(response.choices[0].message.content?.trim() || '0.5');
    return Math.max(0, Math.min(1, score)); // Ensure 0-1 range
  } catch (error) {
    console.error('Quality validation failed:', error);
    return 0.7; // Default moderate quality score
  }
}
```

## 🎨 Translation UI Components

### Translation Request Interface

**Create**: `src/components/TranslationInterface.tsx`
```typescript
import React, { useState } from 'react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Languages, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'next-intl';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';

interface TranslationInterfaceProps {
  documentId: string;
  document: {
    id: string;
    title: string;
    language: string;
  };
  onTranslationRequested?: (translationId: string) => void;
}

export const TranslationInterface: React.FC<TranslationInterfaceProps> = ({
  documentId,
  document,
  onTranslationRequested,
}) => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [translationType, setTranslationType] = useState<'professional' | 'ai'>('professional');
  const [priority, setPriority] = useState<'normal' | 'high'>('normal');
  const [notes, setNotes] = useState('');
  
  // Get existing translations
  const { data: existingTranslations } = trpc.translations.getDocumentTranslations.useQuery(documentId);
  
  // Request translation mutation
  const requestTranslation = trpc.translations.requestTranslation.useMutation({
    onSuccess: (result) => {
      onTranslationRequested?.(result.translationId);
      setSelectedLanguage('');
      setNotes('');
    },
  });
  
  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ].filter(lang => lang.code !== document.language);
  
  const getTranslationStatus = (langCode: string) => {
    return existingTranslations?.find(t => t.target_language === langCode);
  };
  
  const handleRequestTranslation = async () => {
    if (!selectedLanguage) return;
    
    try {
      await requestTranslation.mutateAsync({
        documentId,
        targetLanguage: selectedLanguage as any,
        priority,
        translationType,
        notes: notes || undefined,
      });
    } catch (error) {
      console.error('Translation request failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Document Info */}
      <div className="flex items-center space-x-3">
        <Languages className="h-5 w-5 text-blue-600" />
        <div>
          <h3 className="font-medium">{t('translation.documentTranslations')}</h3>
          <p className="text-sm text-gray-600">
            {t('translation.originalLanguage')}: {document.language.toUpperCase()}
          </p>
        </div>
      </div>
      
      {/* Existing Translations */}
      {existingTranslations && existingTranslations.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            {t('translation.existingTranslations')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {existingTranslations.map((translation) => (
              <TranslationStatusCard
                key={translation.id}
                translation={translation}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Request New Translation */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-900 mb-4">
          {t('translation.requestNew')}
        </h4>
        
        {/* Language Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('translation.targetLanguage')}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {availableLanguages.map((lang) => {
                const existingTranslation = getTranslationStatus(lang.code);
                const isDisabled = existingTranslation && 
                  !['failed', 'cancelled'].includes(existingTranslation.status);
                
                return (
                  <button
                    key={lang.code}
                    onClick={() => !isDisabled && setSelectedLanguage(lang.code)}
                    disabled={isDisabled}
                    className={cn(
                      "flex items-center space-x-2 p-3 border rounded-lg text-left transition-colors",
                      selectedLanguage === lang.code
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium">{lang.name}</div>
                      {existingTranslation && (
                        <Badge
                          variant={existingTranslation.status === 'completed' ? 'success' : 'secondary'}
                          className="text-xs mt-1"
                        >
                          {t(`translation.status.${existingTranslation.status}`)}
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Translation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('translation.type')}
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="translationType"
                  value="professional"
                  checked={translationType === 'professional'}
                  onChange={(e) => setTranslationType(e.target.value as any)}
                  className="mr-2"
                />
                <div>
                  <div className="font-medium">{t('translation.professional')}</div>
                  <div className="text-sm text-gray-600">
                    {t('translation.professionalDescription')}
                  </div>
                </div>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="translationType"
                  value="ai"
                  checked={translationType === 'ai'}
                  onChange={(e) => setTranslationType(e.target.value as any)}
                  className="mr-2"
                />
                <div>
                  <div className="font-medium">{t('translation.ai')}</div>
                  <div className="text-sm text-gray-600">
                    {t('translation.aiDescription')}
                  </div>
                </div>
              </label>
            </div>
          </div>
          
          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('translation.priority')}
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="normal">{t('translation.priority.normal')}</option>
              <option value="high">{t('translation.priority.high')}</option>
            </select>
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('translation.notes')} ({t('common.optional')})
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('translation.notesPlaceholder')}
              className="w-full border rounded-md px-3 py-2 h-20 resize-none"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {notes.length}/500
            </div>
          </div>
          
          {/* Submit Button */}
          <Button
            onClick={handleRequestTranslation}
            disabled={!selectedLanguage || requestTranslation.isLoading}
            className="w-full"
          >
            {requestTranslation.isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('translation.requesting')}
              </>
            ) : (
              t('translation.requestTranslation')
            )}
          </Button>
          
          {requestTranslation.error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {requestTranslation.error.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Translation Status Card Component
interface TranslationStatusCardProps {
  translation: any;
}

const TranslationStatusCard: React.FC<TranslationStatusCardProps> = ({ translation }) => {
  const { t } = useTranslation();
  
  const getStatusIcon = () => {
    switch (translation.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };
  
  const getStatusColor = () => {
    switch (translation.status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };
  
  return (
    <div className={cn("p-3 border rounded-lg", getStatusColor())}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-medium">
            {translation.target_language.toUpperCase()}
          </span>
        </div>
        <Badge variant="outline" className="text-xs">
          {t(`translation.status.${translation.status}`)}
        </Badge>
      </div>
      
      {translation.quality_score && (
        <div className="text-sm text-gray-600">
          {t('translation.quality')}: {Math.round(translation.quality_score * 100)}%
        </div>
      )}
      
      {translation.completed_at && (
        <div className="text-xs text-gray-500 mt-1">
          {new Date(translation.completed_at).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};
```

## 🎯 Success Criteria

### Functional Requirements ✅
- [ ] Support for professional (DeepL) and AI (OpenAI) translation
- [ ] Complete workflow from request to completion
- [ ] Quality validation and scoring
- [ ] Progress tracking and status updates
- [ ] Cost estimation and budget management
- [ ] Translation cancellation and retry capabilities

### Performance Requirements ✅
- [ ] Translation completion: <5 minutes for documents <10 pages
- [ ] Status updates: Real-time progress tracking
- [ ] Cost calculation: Accurate estimation within 10%
- [ ] Queue processing: Handle 10+ concurrent translations
- [ ] Error recovery: Automatic retry for transient failures

### Quality Requirements ✅
- [ ] Translation accuracy: >90% for professional service
- [ ] Format preservation: Maintain document structure
- [ ] Terminology consistency: Technical terms preserved
- [ ] Quality scoring: AI-powered validation
- [ ] User feedback: Rating and improvement system

### User Experience Requirements ✅
- [ ] Intuitive translation request interface
- [ ] Clear progress indication and status updates
- [ ] Multilingual UI support (FR/AR/EN)
- [ ] Mobile-responsive design
- [ ] Error handling with helpful messages

---

This AI translation workflow provides a comprehensive, quality-focused translation system that supports the multilingual needs of the Costabeach platform while maintaining cost efficiency and user satisfaction.