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
export const getDownloadUrl = async (
  filePath: string,
  expiresIn: number = 3600,
  forceDownload: boolean = true
): Promise<string> => {
  const fileName = filePath.split('/').pop() || 'download';
  
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: filePath,
    ResponseContentDisposition: forceDownload 
      ? `attachment; filename="${encodeURIComponent(fileName)}"` 
      : `inline; filename="${encodeURIComponent(fileName)}"`,
  });
  
  return getSignedUrl(s3Client, command, { expiresIn });
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
  // Convert the DocumentCategory enum to the Prisma enum value
  let prismaCategory;
  switch (category) {
    case DocumentCategory.COMITE_DE_SUIVI:
      prismaCategory = 'comiteDeSuivi';
      break;
    case DocumentCategory.SOCIETE_DE_GESTION:
      prismaCategory = 'societeDeGestion';
      break;
    case DocumentCategory.LEGAL:
      prismaCategory = 'legal';
      break;
    default:
      prismaCategory = 'comiteDeSuivi'; // Default fallback
  }
  
  // Convert the Language enum to the Prisma enum value
  let prismaLanguage;
  switch (language) {
    case Language.FRENCH:
      prismaLanguage = 'french';
      break;
    case Language.ARABIC:
      prismaLanguage = 'arabic';
      break;
    default:
      prismaLanguage = 'french'; // Default fallback
  }
  
  const document = await prisma.document.create({
    data: {
      title,
      description,
      filePath,
      fileSize,
      fileType,
      category: prismaCategory as any,
      language: prismaLanguage as any,
      authorId,
      isPublished,
    },
  });
  
  // Convert the document to the expected type
  return {
    ...document,
    category: category,
    language: language,
  } as Document;
};

/**
 * Get documents by category
 */
export const getDocumentsByCategory = async (
  category: DocumentCategory,
  language?: Language,
  limit: number = 20,
  offset: number = 0,
  searchQuery?: string
): Promise<Document[]> => {
  // Convert the DocumentCategory enum to the Prisma enum value
  let prismaCategory;
  switch (category) {
    case DocumentCategory.COMITE_DE_SUIVI:
      prismaCategory = 'comiteDeSuivi';
      break;
    case DocumentCategory.SOCIETE_DE_GESTION:
      prismaCategory = 'societeDeGestion';
      break;
    case DocumentCategory.LEGAL:
      prismaCategory = 'legal';
      break;
    default:
      prismaCategory = 'comiteDeSuivi'; // Default fallback
  }
  
  // Convert the Language enum to the Prisma enum value if provided
  let prismaLanguage;
  if (language) {
    switch (language) {
      case Language.FRENCH:
        prismaLanguage = 'french';
        break;
      case Language.ARABIC:
        prismaLanguage = 'arabic';
        break;
      default:
        prismaLanguage = 'french'; // Default fallback
    }
  }
  
  const where: any = { 
    category: prismaCategory, 
    isPublished: true 
  };
  
  if (prismaLanguage) {
    where.language = prismaLanguage;
  }
  
  // Add search functionality
  if (searchQuery && searchQuery.trim() !== '') {
    where.OR = [
      { title: { contains: searchQuery, mode: 'insensitive' } },
      { description: { contains: searchQuery, mode: 'insensitive' } }
    ];
  }
  
  const documents = await prisma.document.findMany({
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
      // The translatedDocument relation is commented out until the column exists in the database
      // translatedDocument: true
    },
  });
  
  // Convert the documents to the expected type
  return documents.map(doc => ({
    ...doc,
    category: category,
    language: language || (doc.language === 'french' ? Language.FRENCH : Language.ARABIC),
    translatedDocument: null, // Add this field to satisfy the type, even though it doesn't exist in the database
  })) as Document[];
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