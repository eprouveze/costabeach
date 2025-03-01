import { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3ServiceException
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3ClientInstance, getBucketName } from './config';
import { DocumentCategory, Language } from '@/lib/types';

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
  language: Language,
  expiresIn: number = 3600
): Promise<{ uploadUrl: string; filePath: string }> => {
  try {
    const s3Client = getS3ClientInstance();
    const bucketName = getBucketName();
    const filePath = generateS3FilePath(userId, fileName, category, language);
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      ContentType: fileType,
    });
    
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
    
    return { uploadUrl, filePath };
  } catch (error) {
    console.error('Error generating upload URL:', error);
    throw new Error('Failed to generate upload URL. Please try again later.');
  }
};

/**
 * Get a signed URL for downloading a file from S3
 */
export const getDownloadUrl = async (
  filePath: string,
  expiresIn: number = 3600
): Promise<string> => {
  try {
    const s3Client = getS3ClientInstance();
    const bucketName = getBucketName();
    
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: filePath,
    });
    
    return getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating download URL:', error);
    throw new Error('Failed to generate download URL. Please try again later.');
  }
};

/**
 * Check if a file exists in S3
 */
export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    const s3Client = getS3ClientInstance();
    const bucketName = getBucketName();
    
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: filePath,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error instanceof S3ServiceException && error.name === 'NotFound') {
      return false;
    }
    console.error('Error checking if file exists:', error);
    throw new Error('Failed to check if file exists. Please try again later.');
  }
};

/**
 * Delete a file from S3
 */
export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    const s3Client = getS3ClientInstance();
    const bucketName = getBucketName();
    
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: filePath,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file. Please try again later.');
  }
};

/**
 * List files in a directory
 */
export const listFiles = async (
  prefix: string,
  maxKeys: number = 1000
): Promise<string[]> => {
  try {
    const s3Client = getS3ClientInstance();
    const bucketName = getBucketName();
    
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });
    
    const response = await s3Client.send(command);
    
    if (!response.Contents) {
      return [];
    }
    
    return response.Contents.map(item => item.Key || '').filter(Boolean);
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error('Failed to list files. Please try again later.');
  }
};

/**
 * Upload a file directly to S3 (server-side)
 */
export const uploadFile = async (
  key: string,
  body: Buffer | Uint8Array | Blob | string,
  contentType?: string
): Promise<string> => {
  try {
    const s3Client = getS3ClientInstance();
    const bucketName = getBucketName();
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    
    await s3Client.send(command);
    
    // Return the URL to the uploaded file
    return `https://${bucketName}.s3.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file. Please try again later.');
  }
}; 