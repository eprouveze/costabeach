import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Language, Permission } from "@/lib/types";
import { translateText, getOrCreateTranslatedDocument } from "@/lib/utils/translations";
import { prisma } from "@/lib/db";
import { TranslationService } from "@/lib/services/translationService";

export const translationsRouter = router({
  // Translate text from one language to another
  translateText: publicProcedure
    .input(
      z.object({
        text: z.string(),
        sourceLanguage: z.nativeEnum(Language),
        targetLanguage: z.nativeEnum(Language),
        formality: z.enum(['default', 'more', 'less']).optional(),
        context: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { text, sourceLanguage, targetLanguage, formality, context } = input;
      
      if (sourceLanguage === targetLanguage) {
        return { translatedText: text };
      }
      
      try {
        const translatedText = await translateText(
          text,
          sourceLanguage,
          targetLanguage,
          { formality, context }
        );
        
        return { translatedText };
      } catch (error) {
        console.error("Translation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to translate text: ${(error as Error).message}`,
        });
      }
    }),
  
  // Request translation of a document
  requestDocumentTranslation: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
        targetLanguage: z.nativeEnum(Language),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { documentId, targetLanguage } = input;
      
      // Get the document to translate
      const document = await prisma.documents.findUnique({
        where: { id: documentId },
      });
      
      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }
      
      // Check if document is already in the target language
      if (document.language === targetLanguage) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Document is already in the target language",
        });
      }
      
      // Check if translation already exists
      const existingTranslation = await prisma.documents.findFirst({
        where: {
          originalDocumentId: documentId,
          language: targetLanguage as unknown as any,
        },
      });
      
      if (existingTranslation) {
        return { 
          success: true, 
          documentId: existingTranslation.id,
          message: "Translation already exists",
          status: "completed"
        };
      }
      
      try {
        // Process translation synchronously since Inngest is not configured
        const translatedDocument = await getOrCreateTranslatedDocument(
          documentId,
          targetLanguage
        );
        
        return { 
          success: true, 
          documentId: translatedDocument.id,
          message: "Document translation completed",
          status: "completed"
        };
      } catch (error) {
        console.error("Document translation request error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to request document translation: ${(error as Error).message}`,
        });
      }
    }),
  
  // Get translation status
  getTranslationStatus: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
        targetLanguage: z.nativeEnum(Language),
      })
    )
    .query(async ({ input }) => {
      const { documentId, targetLanguage } = input;
      
      // Check if translation exists
      const translatedDocument = await prisma.documents.findFirst({
        where: {
          originalDocumentId: documentId,
          language: targetLanguage as unknown as any,
        },
      });
      
      if (translatedDocument) {
        return {
          status: "completed",
          documentId: translatedDocument.id,
        };
      }
      
      // Since we're processing translations synchronously, 
      // if it doesn't exist, it means it hasn't been requested yet
      return {
        status: "not_requested",
      };
    }),
    
  // Admin procedures for translation management
  adminGetTranslationStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin permissions required",
        });
      }

      const translationService = new TranslationService();
      const [stats, orphanedTranslations] = await Promise.all([
        translationService.getTranslationStats(),
        translationService.getOrphanedTranslations()
      ]);

      return {
        stats,
        orphanedTranslations,
        orphanedCount: orphanedTranslations.length
      };
    }),

  adminCleanupOrphanedTranslations: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin permissions required",
        });
      }

      const translationService = new TranslationService();
      const result = await translationService.cleanupOrphanedTranslations();

      return {
        message: `Successfully cleaned up ${result.count} orphaned translation(s)`,
        count: result.count,
        deletedIds: result.deletedIds
      };
    }),

  adminDeleteTranslation: protectedProcedure
    .input(z.object({
      translationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin permissions required",
        });
      }

      const translationService = new TranslationService();
      
      try {
        const deletedTranslation = await translationService.deleteTranslation(input.translationId);
        return {
          message: "Translation deleted successfully",
          translation: deletedTranslation
        };
      } catch (error) {
        if (error instanceof Error && error.message === 'Translation not found') {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Translation not found",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete translation: ${(error as Error).message}`,
        });
      }
    }),
}); 