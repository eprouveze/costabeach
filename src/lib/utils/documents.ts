import { prisma } from '@/lib/db';
import { Document, DocumentCategory, Language } from '@/lib/types';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.BUCKET_NAME || 'costa-beach-documents';

/**
 * Generate a unique file path for S3
 */
export const generateS3FilePath = (
  userId: string,
  fileName: string,
  category: DocumentCategory,
  language: Language
): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `documents/${category}/${language}/${userId}_${timestamp}_${sanitizedFileName}`;
};

/**
 * Get a signed URL for uploading a file to S3
 */
export const getUploadUrl = async (
  userId: string,
  fileName: string,
  fileType: string,
  category: DocumentCategory,
  language: Language
): Promise<{ uploadUrl: string; filePath: string }> => {
  const filePath = generateS3FilePath(userId, fileName, category, language);
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: filePath,
    ContentType: fileType,
  });
  
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  return { uploadUrl, filePath };
};

/**
 * Get a signed URL for downloading a file from S3
 */
export const getDownloadUrl = async (filePath: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: filePath,
  });
  
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

/**
 * Create a document record in the database
 */
export const createDocument = async (
  title: string,
  description: string | null,
  filePath: string,
  fileSize: number,
  fileType: string,
  category: DocumentCategory,
  language: Language,
  authorId: string,
  isPublished: boolean = true
): Promise<Document> => {
  return prisma.document.create({
    data: {
      title,
      description,
      filePath,
      fileSize,
      fileType,
      category,
      language,
      authorId,
      isPublished,
    },
  });
};

/**
 * Get documents by category
 */
export const getDocumentsByCategory = async (
  category: DocumentCategory,
  language?: Language,
  limit: number = 20,
  offset: number = 0
): Promise<Document[]> => {
  const where: any = { category, isPublished: true };
  
  if (language) {
    where.language = language;
  }
  
  return prisma.document.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

/**
 * Increment view count for a document
 */
export const incrementViewCount = async (documentId: string): Promise<void> => {
  await prisma.document.update({
    where: { id: documentId },
    data: { viewCount: { increment: 1 } },
  });
};

/**
 * Increment download count for a document
 */
export const incrementDownloadCount = async (documentId: string): Promise<void> => {
  await prisma.document.update({
    where: { id: documentId },
    data: { downloadCount: { increment: 1 } },
  });
};

/**
 * Check if a user has permission to manage documents in a specific category
 */
export const canManageDocumentCategory = (
  userPermissions: string[],
  category: DocumentCategory
): boolean => {
  if (userPermissions.includes('manageDocuments')) {
    return true;
  }
  
  switch (category) {
    case DocumentCategory.COMITE_DE_SUIVI:
      return userPermissions.includes('manageComiteDocuments');
    case DocumentCategory.SOCIETE_DE_GESTION:
      return userPermissions.includes('manageSocieteDocuments');
    case DocumentCategory.LEGAL:
      return userPermissions.includes('manageLegalDocuments');
    default:
      return false;
  }
}; 