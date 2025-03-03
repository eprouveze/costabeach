import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { 
  createDocument, 
  getDocumentsByCategory, 
  getDownloadUrl, 
  getUploadUrl, 
  incrementDownloadCount, 
  incrementViewCount,
  canManageDocumentCategory
} from "@/lib/utils/documents";
import { DocumentCategory, Language, Permission } from "@/lib/types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const documentsRouter = createTRPCRouter({
  // Get a signed URL for uploading a document to S3
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        category: z.nativeEnum(DocumentCategory),
        language: z.nativeEnum(Language),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { fileName, fileType, fileSize, category, language } = input;
      const userId = ctx.session.user.id;
      
      // Get the user from the database to check permissions
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { permissions: true }
      });
      
      // Check if user has permission to upload documents in this category
      const userPermissions = user?.permissions || [];
      if (!canManageDocumentCategory(userPermissions, category)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to upload documents in this category",
        });
      }
      
      try {
        const { uploadUrl, filePath } = await getUploadUrl(
          userId,
          fileName,
          fileType,
          category,
          language
        );
        
        return { uploadUrl, filePath };
      } catch (error) {
        console.error("Error generating upload URL:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate upload URL",
        });
      }
    }),
  
  // Create a document record in the database
  createDocument: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        filePath: z.string(),
        fileSize: z.number(),
        fileType: z.string(),
        category: z.nativeEnum(DocumentCategory),
        language: z.nativeEnum(Language),
        isPublished: z.boolean().default(true),
        parentDocumentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Get the user from the database to check permissions
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { permissions: true }
      });
      
      // Check if user has permission to create documents in this category
      const userPermissions = user?.permissions || [];
      if (!canManageDocumentCategory(userPermissions, input.category)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to create documents in this category",
        });
      }
      
      try {
        const document = await createDocument(
          input.title,
          input.description || null,
          input.filePath,
          input.fileSize,
          input.fileType,
          input.category,
          input.language,
          userId,
          input.isPublished
        );
        
        return document;
      } catch (error) {
        console.error("Error creating document:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create document",
        });
      }
    }),
  
  // Get documents by category
  getDocumentsByCategory: publicProcedure
    .input(
      z.object({
        category: z.nativeEnum(DocumentCategory),
        language: z.nativeEnum(Language).optional(),
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
        searchQuery: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { category, language, limit, offset, searchQuery } = input;
      
      try {
        const documents = await getDocumentsByCategory(
          category,
          language,
          limit,
          offset,
          searchQuery
        );
        
        return documents;
      } catch (error) {
        console.error("Error fetching documents:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch documents",
        });
      }
    }),
  
  // Get a signed URL for downloading a document
  getDownloadUrl: publicProcedure
    .input(
      z.object({
        documentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { documentId } = input;
      
      try {
        // Increment download count
        await incrementDownloadCount(documentId);
        
        // Get document from database to get the file path
        const document = await prisma.document.findUnique({
          where: { id: documentId },
          select: { filePath: true },
        });
        
        if (!document) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }
        
        const downloadUrl = await getDownloadUrl(document.filePath);
        
        return { downloadUrl };
      } catch (error) {
        console.error("Error generating download URL:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate download URL",
        });
      }
    }),
  
  // Increment view count for a document
  incrementViewCount: publicProcedure
    .input(
      z.object({
        documentId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { documentId } = input;
      
      try {
        await incrementViewCount(documentId);
        return { success: true };
      } catch (error) {
        console.error("Error incrementing view count:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to increment view count",
        });
      }
    }),
  
  // Delete a document
  deleteDocument: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { documentId } = input;
      const userId = ctx.session.user.id;
      
      try {
        // Get the document to check category
        const document = await prisma.document.findUnique({
          where: { id: documentId },
          select: { category: true, authorId: true },
        });
        
        if (!document) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }
        
        // Get the user from the database to check permissions
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { permissions: true, isAdmin: true }
        });
        
        // Check if user has permission to delete this document
        const userPermissions = user?.permissions || [];
        const canDelete = 
          user?.isAdmin || 
          document.authorId === userId || 
          canManageDocumentCategory(userPermissions, document.category as DocumentCategory);
        
        if (!canDelete) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to delete this document",
          });
        }
        
        // Delete document from database
        await prisma.document.delete({
          where: { id: documentId },
        });
        
        // Note: We're not deleting the file from S3 here
        // This could be implemented as a background job or separate function
        
        return { success: true };
      } catch (error) {
        console.error("Error deleting document:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete document",
        });
      }
    }),
  
  healthCheck: publicProcedure
    .query(() => {
      return {
        status: "ok",
        timestamp: new Date().toISOString()
      };
    }),
}); 