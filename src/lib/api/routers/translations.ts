import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Language } from "@/lib/types";
import { translateText, getOrCreateTranslatedDocument } from "@/lib/utils/translations";
import { PrismaClient } from "@prisma/client";
import { inngest } from "@/lib/inngest";

const prisma = new PrismaClient();

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
      const userId = ctx.session.user.id;
      
      // Get the document to translate
      const document = await prisma.document.findUnique({
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
      const existingTranslation = await prisma.document.findFirst({
        where: {
          original_document_id: documentId,
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
        // Create a background job for translation using Inngest
        await inngest.send({
          name: "document/translate",
          data: {
            documentId,
            targetLanguage,
            userId,
          },
        });
        
        return { 
          success: true, 
          message: "Document translation requested",
          status: "pending"
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
      const translatedDocument = await prisma.document.findFirst({
        where: {
          original_document_id: documentId,
          language: targetLanguage as unknown as any,
        },
      });
      
      if (translatedDocument) {
        return {
          status: "completed",
          documentId: translatedDocument.id,
        };
      }
      
      // For now, we'll just return "pending" if the translation doesn't exist
      // In a real implementation, we would check the job status in Inngest
      return {
        status: "pending",
      };
    }),
}); 