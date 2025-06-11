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
  
  const document = await prisma.documents.create({
    data: {
      title,
      description,
      file_path: filePath,
      file_size: fileSize,
      file_type: fileType,
      category: prismaCategory as any,
      language: prismaLanguage as any,
      created_by: authorId,
      is_public: isPublished,
    },
  });
  
  // Convert the document to the expected type
  return {
    id: document.id,
    title: document.title,
    description: document.description,
    filePath: document.file_path,
    fileSize: Number(document.file_size),
    fileType: document.file_type,
    category: category,
    language: language,
    createdAt: document.created_at,
    updatedAt: document.updated_at,
    translatedDocument: null,
    translatedDocumentId: null,
    isTranslated: document.is_translation || false,
    isPublished: document.is_public || false,
    authorId: document.created_by || '',
    viewCount: document.view_count || 0,
    downloadCount: document.download_count || 0,
    author: { id: document.created_by || '', name: '' }
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
    case DocumentCategory.FINANCE:
      prismaCategory = 'finance';
      break;
    case DocumentCategory.GENERAL:
      prismaCategory = 'general';
      break;
    default:
      prismaCategory = 'comiteDeSuivi'; // Default fallback
  }
  
  // Debug log
  console.log(`Fetching documents with prisma category: ${prismaCategory} from enum value: ${category}`);
  
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
      case Language.ENGLISH:
        prismaLanguage = 'english';
        break;
      default:
        prismaLanguage = 'french'; // Default fallback
    }
  }
  
  const where: any = { 
    is_public: true 
  };
  
  // Add category condition, if the category is in uppercase, try lowercase and both with and without camelCase
  if (prismaCategory) {
    where.OR = [
      { category: prismaCategory }, // comiteDeSuivi
      { category: prismaCategory.toLowerCase() }, // comitedesuivi
      { category: prismaCategory.toUpperCase() }  // COMITEDESUIVI
    ];
    
    // For special case of comiteDeSuivi
    if (prismaCategory === 'comiteDeSuivi') {
      where.OR.push({ category: 'comitedesuivi' });
      where.OR.push({ category: 'COMITE_DE_SUIVI' });
      where.OR.push({ category: 'Comite De Suivi' });
    }
  }
  
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
  
  try {
    const documents = await prisma.documents.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
      include: {
        users: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    // Convert the documents to the expected type
    return documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      filePath: doc.file_path,
      fileSize: Number(doc.file_size),
      fileType: doc.file_type,
      category: category,
      language: language || (doc.language === 'french' ? Language.FRENCH : Language.ARABIC),
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      translatedDocument: null, // Add this field to satisfy the type, even though it doesn't exist in the database
      translatedDocumentId: null, // Add this field to satisfy the type
      isTranslated: doc.is_translation || false,
      isPublished: doc.is_public || false,
      authorId: doc.created_by || '',
      viewCount: doc.view_count || 0,
      downloadCount: doc.download_count || 0,
      author: doc.users ? { id: doc.users.id, name: doc.users.name || '' } : { id: doc.created_by || '', name: '' }
    })) as Document[];
  } catch (error) {
    // If we get a Prisma error about the translatedDocumentId column, fall back to a simpler query
    if (error instanceof Error && error.message.includes('translated_document_id')) {
      console.warn('Falling back to simple query due to missing translated_document_id column');
      
      // Construct conditions separately for the query
      let languageCondition = '';
      let searchCondition = '';
      
      // Prepare parameters array
      const params: any[] = [];
      
      if (prismaLanguage) {
        languageCondition = 'AND language = $1';
        params.push(prismaLanguage);
      }
      
      if (searchQuery) {
        searchCondition = 'AND (title ILIKE $' + (params.length + 1) + ' OR description ILIKE $' + (params.length + 1) + ')';
        params.push(`%${searchQuery}%`);
      }
      
      // Add the remaining parameters
      params.push(prismaCategory);  // Category parameter
      params.push(limit);           // Limit parameter
      params.push(offset);          // Offset parameter
      
      // Build the query with proper parameter placeholders - removing the is_translated column
      const query = `
        SELECT 
          id, title, description, file_path as "filePath", file_size as "fileSize", 
          file_type as "fileType", category, language, 
          is_public as "isPublished", view_count as "viewCount", 
          download_count as "downloadCount", created_at as "createdAt", 
          updated_at as "updatedAt", created_by as "authorId"
        FROM documents
        WHERE category = $${params.length - 2}
          ${languageCondition}
          AND is_public = true
          ${searchCondition}
        ORDER BY created_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `;
      
      const simpleDocuments = await prisma.$queryRawUnsafe(query, ...params);
      
      // Convert the raw documents to the expected type
      return (simpleDocuments as any[]).map(doc => ({
        ...doc,
        category: category,
        language: language || (doc.language === 'french' ? Language.FRENCH : Language.ARABIC),
        translatedDocument: null,
        translatedDocumentId: null,
        isTranslated: false, // Add default value for isTranslated
        authorId: doc.authorId,
        author: { id: doc.authorId || '', name: '' }, // Basic author info, missing the full name
        isPublished: doc.isPublished
      })) as Document[];
    }
    
    // Re-throw other errors
    throw error;
  }
};

/**
 * Increment view count for a document
 */
export const incrementViewCount = async (documentId: string): Promise<void> => {
  await prisma.documents.update({
    where: { id: documentId },
    data: { view_count: { increment: 1 } },
  });
};

/**
 * Increment download count for a document
 */
export const incrementDownloadCount = async (documentId: string): Promise<void> => {
  await prisma.documents.update({
    where: { id: documentId },
    data: { download_count: { increment: 1 } },
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