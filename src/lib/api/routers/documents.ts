import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { 
  createDocument, 
  getDocumentsByCategory, 
  getDownloadUrl, 
  getUploadUrl, 
  incrementDownloadCount, 
  incrementViewCount,
  canManageDocumentCategory,
  deleteS3File
} from "@/lib/utils/documents";
import { DocumentCategory, Language, Permission, TranslationQuality, TranslationStatus } from "@/lib/types";
import { TranslationQueueService } from "@/lib/services/translationQueueService";
import { ContentDetector } from "@/lib/utils/contentDetection";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/utils/audit";
import { checkPermission } from "@/lib/utils/permissions";
import { whatsappNotificationService } from "@/lib/services/whatsappNotificationService";

export const documentsRouter = router({
  // Health check procedure
  healthCheck: publicProcedure
    .query(async () => {
      return { status: "ok", timestamp: new Date().toISOString() };
    }),
  
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
      const userId = ctx.user?.id;
      
      // Get the user from the database to check permissions
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { permissions: true, isAdmin: true }
      });
      
      // Check if user has permission to upload documents in this category
      const userPermissions = user?.permissions || [];
      const isAdmin = user?.isAdmin || false;
      
      if (!isAdmin && !canManageDocumentCategory(userPermissions, category)) {
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
      if (!ctx.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create documents",
        });
      }
      const userId = ctx.user.id;
      
      // Get the user from the database to check permissions
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { permissions: true, isAdmin: true }
      });
      
      // Check if user has permission to create documents in this category
      const userPermissions = user?.permissions || [];
      const isAdmin = user?.isAdmin || false;
      
      if (!isAdmin && !canManageDocumentCategory(userPermissions, input.category)) {
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
        
        // Analyze content and queue translations for all languages
        try {
          const contentAnalysis = await ContentDetector.analyzeFile(
            input.fileType,
            input.title,
            input.fileSize
          );
          
          // Update document with content analysis results
          await prisma.documents.update({
            where: { id: document.id },
            data: {
              sourceLanguage: input.language,
              translationQuality: TranslationQuality.ORIGINAL,
              translationStatus: TranslationStatus.COMPLETED,
              contentExtractable: contentAnalysis.isExtractable
            }
          });
          
          // Create translation jobs for all other languages
          await TranslationQueueService.createTranslationJobs(
            document.id,
            input.language,
            [Language.FRENCH, Language.ENGLISH, Language.ARABIC],
            userId
          );
          
          console.log(`Queued translations for document: ${document.id} (${input.language} -> others)`);
        } catch (translationError) {
          console.error('Failed to queue translations for document:', document.id, translationError);
          // Don't fail the upload if translation queueing fails
        }
        
        // Create audit log for document creation
        await createAuditLog(
          userId,
          "create",
          "Document",
          document.id,
          {
            title: document.title,
            category: document.category,
            language: document.language
          }
        );
        
        // Send WhatsApp notification for document upload
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true }
          });
          
          const uploaderName = user ? 
            user.name || user.email || 'Unknown User' : 
            'Unknown User';
          
          // Create document URL (this would be the actual URL to view the document)
          const documentUrl = `${process.env.NEXTAUTH_URL || 'https://costabeach.com'}/documents/${document.id}`;
          
          await whatsappNotificationService.sendDocumentNotification({
            title: document.title,
            category: document.category,
            language: document.language,
            uploadedBy: uploaderName,
            fileSize: document.fileSize,
            documentUrl
          });
        } catch (notificationError) {
          // Don't fail the document creation if notification fails
          console.error('Failed to send WhatsApp notification for document:', notificationError);
        }
        
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
  // Get a single document by ID
  getDocumentById: publicProcedure
    .input(
      z.object({
        documentId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { documentId } = input;
      
      try {
        const document = await prisma.documents.findUnique({
          where: { id: documentId },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        });
        
        if (!document) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }
        
        return {
          id: document.id,
          title: document.title,
          description: document.description,
          category: document.category,
          language: document.language,
          fileType: document.fileType,
          fileSize: Number(document.fileSize),
          filePath: document.filePath,
          viewCount: document.viewCount || 0,
          downloadCount: document.downloadCount || 0,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
          author: document.user,
          originalDocumentId: document.originalDocumentId
        };
      } catch (error) {
        console.error("Error fetching document:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch document",
        });
      }
    }),

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

  // Get documents with their translations
  getDocumentsWithTranslations: publicProcedure
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
        // Get original documents (not translations)
        const originalDocuments = await prisma.documents.findMany({
          where: {
            category: category,
            isTranslation: false,
            ...(searchQuery && {
              OR: [
                { title: { contains: searchQuery, mode: 'insensitive' } },
                { description: { contains: searchQuery, mode: 'insensitive' } },
              ],
            }),
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            // Get all translations for this document
            other_documents: {
              where: {
                isTranslation: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
          skip: offset,
        });

        // Transform the data to include translations grouped by language
        const documentsWithTranslations = originalDocuments.map((doc) => ({
          original: {
            ...doc,
            fileSize: Number(doc.fileSize),
            authorId: doc.createdBy || '',
            author: doc.user ? { id: doc.user.id, name: doc.user.name } : undefined,
            isTranslated: doc.other_documents.length > 0,
            isPublished: doc.isPublic || false,
          },
          translations: doc.other_documents.map((translation) => ({
            ...translation,
            fileSize: Number(translation.fileSize),
            authorId: translation.createdBy || '',
            isTranslated: false,
            isPublished: translation.isPublic || false,
          })),
        }));

        return documentsWithTranslations;
      } catch (error) {
        console.error("Error fetching documents with translations:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch documents with translations",
        });
      }
    }),

  // Get all documents for admin view (including private)
  getAllDocuments: protectedProcedure
    .input(
      z.object({
        includePrivate: z.boolean().default(false),
        limit: z.number().min(1).max(1000).default(100),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { includePrivate, limit, offset } = input;
      const userId = ctx.user?.id;
      
      // Get user permissions to check if they can view private documents
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { permissions: true, isAdmin: true }
      });
      
      // Only admins or users with MANAGE_DOCUMENTS permission can see private documents
      const canViewPrivate = user?.isAdmin || 
        (user?.permissions && user.permissions.includes('manageDocuments'));
      
      if (includePrivate && !canViewPrivate) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view private documents",
        });
      }
      
      try {
        const whereClause: any = {};
        
        // If not including private, only show public documents
        if (!includePrivate) {
          whereClause.isPublic = true;
        }

        // Only get original documents (not translations) to group them properly
        whereClause.isTranslation = false;
        
        const originalDocuments = await prisma.documents.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            // Include all translations for this document
            other_documents: {
              where: {
                isTranslation: true,
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        });
        
        // Convert to the expected Document type format with grouped translations
        return originalDocuments.map(doc => ({
          id: doc.id,
          title: doc.title,
          description: doc.description,
          filePath: doc.filePath,
          fileSize: Number(doc.fileSize),
          fileType: doc.fileType,
          category: doc.category as DocumentCategory,
          language: doc.language as Language,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          originalDocumentId: doc.originalDocumentId,
          isTranslation: false, // These are original documents
          isTranslated: doc.other_documents.length > 0,
          isPublished: doc.isPublic || false,
          authorId: doc.createdBy || '',
          viewCount: doc.viewCount || 0,
          downloadCount: doc.downloadCount || 0,
          // Add available languages including the original
          availableLanguages: [
            doc.language as Language,
            ...doc.other_documents.map(t => t.language as Language)
          ].filter((lang, index, arr) => arr.indexOf(lang) === index), // Remove duplicates
          // Convert translation relationships to proper format
          translations: doc.other_documents.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            filePath: t.filePath,
            fileSize: Number(t.fileSize),
            fileType: t.fileType,
            category: t.category as DocumentCategory,
            language: t.language as Language,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            originalDocumentId: t.originalDocumentId,
            isTranslation: true,
            isTranslated: false,
            isPublished: t.isPublic || false,
            authorId: t.createdBy || '',
            viewCount: t.viewCount || 0,
            downloadCount: t.downloadCount || 0,
            author: t.user ? { 
              id: t.user.id, 
              name: t.user.name || t.user.email || 'Unknown' 
            } : { id: t.createdBy || '', name: 'Unknown' }
          })),
          author: doc.user ? { 
            id: doc.user.id, 
            name: doc.user.name || doc.user.email || 'Unknown' 
          } : { id: doc.createdBy || '', name: 'Unknown' }
        }));
      } catch (error) {
        console.error("Error fetching all documents:", error);
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
      const userId = ctx.user?.id || 'anonymous';
      
      try {
        // Increment download count
        await incrementDownloadCount(documentId);
        
        // Get document from database to get the file path
        const document = await prisma.documents.findUnique({
          where: { id: documentId },
          select: { filePath: true, title: true },
        });
        
        if (!document) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }
        
        // Create audit log for document download (if user is logged in)
        if (userId !== 'anonymous') {
          await createAuditLog(
            userId,
            "download",
            "Document",
            documentId,
            { title: document.title }
          );
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
    .mutation(async ({ ctx, input }) => {
      const { documentId } = input;
      const userId = ctx.user?.id || 'anonymous';
      
      try {
        await incrementViewCount(documentId);
        
        // Create audit log for document view (if user is logged in)
        if (userId !== 'anonymous') {
          const document = await prisma.documents.findUnique({
            where: { id: documentId },
            select: { title: true },
          });
          
          if (document) {
            await createAuditLog(
              userId,
              "view",
              "Document",
              documentId,
              { title: document.title }
            );
          }
        }
        
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
      if (!ctx.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete documents",
        });
      }
      const userId = ctx.user.id;
      
      try {
        // Get the document to check category and get file path for S3 deletion
        const document = await prisma.documents.findUnique({
          where: { id: documentId },
          select: { category: true, createdBy: true, title: true, filePath: true },
        });
        
        if (!document) {
          // Document already deleted or never existed
          console.log(`Document ${documentId} not found - it may have already been deleted`);
          return { success: true, message: "Document was already deleted" };
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
          document.createdBy === userId || 
          canManageDocumentCategory(userPermissions, document.category as DocumentCategory);
        
        if (!canDelete) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to delete this document",
          });
        }
        
        // Create audit log for document deletion
        await createAuditLog(
          userId,
          "delete",
          "Document",
          documentId,
          { 
            title: document.title,
            category: document.category,
            filePath: document.filePath
          }
        );
        
        // Delete file from S3 first
        try {
          await deleteS3File(document.filePath);
          console.log(`Successfully deleted S3 file: ${document.filePath}`);
        } catch (s3Error) {
          console.error(`Failed to delete S3 file: ${document.filePath}`, s3Error);
          // Continue with database deletion even if S3 deletion fails
          // The file will be orphaned but the user operation should succeed
        }
        
        // Delete document from database
        await prisma.documents.delete({
          where: { id: documentId },
        });
        
        return { success: true };
      } catch (error) {
        console.error("Error deleting document:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete document",
        });
      }
    }),
  
  // Get audit logs for documents
  getDocumentAuditLogs: protectedProcedure
    .input(
      z.object({
        documentId: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user?.id;
      
      // Get the user to check if they are an admin or content editor
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      
      if (!user || (user.role !== 'admin' && user.role !== 'contentEditor')) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access audit logs",
        });
      }
      
      try {
        const where: any = { entityType: "Document" };
        if (input.documentId) {
          where.entityId = input.documentId;
        }
        
        // Check if auditLog model exists in the schema
        // If not, return empty results
        if (!('auditLog' in prisma)) {
          console.warn('AuditLog model not found in Prisma schema. Returning empty results.');
          return {
            logs: [],
            total: 0
          };
        }
        
        const [logs, total] = await Promise.all([
          // @ts-ignore - auditLog might not exist in the schema
          prisma.auditLog.findMany({
            where,
            orderBy: {
              createdAt: "desc",
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            skip: input.offset,
            take: input.limit,
          }),
          // @ts-ignore - auditLog might not exist in the schema
          prisma.auditLog.count({ where }),
        ]);
        
        return { logs, total };
      } catch (error) {
        console.error("Error fetching document audit logs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch audit logs",
        });
      }
    }),
  
  // Add updateDocument mutation with audit logging after createDocument
  updateDocument: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.nativeEnum(DocumentCategory),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update documents",
        });
      }
      
      // Check if user has permission to manage this document category
      const permissionMap = {
        [DocumentCategory.COMITE_DE_SUIVI]: Permission.MANAGE_COMITE_DOCUMENTS,
        [DocumentCategory.LEGAL]: Permission.MANAGE_LEGAL_DOCUMENTS,
        [DocumentCategory.SOCIETE_DE_GESTION]: Permission.MANAGE_SOCIETE_DOCUMENTS,
        [DocumentCategory.GENERAL]: Permission.MANAGE_GENERAL_DOCUMENTS,
        [DocumentCategory.FINANCE]: Permission.MANAGE_FINANCE_DOCUMENTS,
      };

      const requiredPermission = permissionMap[input.category] || Permission.MANAGE_DOCUMENTS;
      
      // Get user permissions from database
      const user = await prisma.user.findUnique({
        where: { id: ctx.user?.id },
        select: { permissions: true, isAdmin: true }
      });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      
      const userPermissions = user.permissions as Permission[] || [];
      
      if (!checkPermission(userPermissions, requiredPermission) && !user.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this document.",
        });
      }

      // Get the existing document
      const existingDoc = await prisma.documents.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          title: true,
          description: true,
          category: true
        },
      });

      if (!existingDoc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      // Update the document
      const updatedDocument = await prisma.documents.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
          category: input.category as any,
        },
      });

      // Log the update action
      await createAuditLog(
        ctx.user?.id || 'system',
        "update",
        "Document",
        input.id,
        {
          title: input.title,
          category: input.category,
          previousTitle: existingDoc.title,
          previousCategory: existingDoc.category,
          changedFields: {
            title: existingDoc.title !== input.title,
            description: existingDoc.description !== input.description,
            category: existingDoc.category !== input.category,
          }
        }
      );

      return updatedDocument;
    }),
}); 