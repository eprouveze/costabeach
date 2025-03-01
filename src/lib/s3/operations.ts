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
 * Generate a file path for S3 storage
 */
export const generateS3FilePath = (
  prefix: string,
  id: string,
  fileName: string
): string => {
  return `${prefix}/${id}/${fileName}`;
};

/**
 * Get a pre-signed URL for uploading a file to S3
 */
export const getUploadUrl = async (
  key: string,
  expiresIn = 3600
): Promise<string> => {
  try {
    const s3Client = getS3ClientInstance();
    const bucketName = getBucketName();
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating upload URL:', error);
    throw new Error('Failed to generate upload URL');
  }
};

/**
 * Get a pre-signed URL for downloading a file from S3
 */
export const getDownloadUrl = async (
  key: string,
  expiresIn = 3600
): Promise<string> => {
  try {
    const s3Client = getS3ClientInstance();
    const bucketName = getBucketName();
    
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating download URL:', error);
    throw new Error('Failed to generate download URL');
  }
};

/**
 * Check if a file exists in S3
 */
export const fileExists = async (key: string): Promise<boolean> => {
  try {
    const s3Client = getS3ClientInstance();
    const bucketName = getBucketName();
    
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    if ((error as S3ServiceException).name === 'NotFound') {
      return false;
    }
    console.error('Error checking if file exists:', error);
    throw new Error('Failed to check if file exists');
  }
};

/**
 * Delete a file from S3
 */
export const deleteFile = async (key: string): Promise<void> => {
  try {
    const s3Client = getS3ClientInstance();
    const bucketName = getBucketName();
    
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * List files in S3 with a given prefix
 */
export const listFiles = async (prefix: string): Promise<string[]> => {
  try {
    const s3Client = getS3ClientInstance();
    const bucketName = getBucketName();
    
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });
    
    const response = await s3Client.send(command);
    
    if (!response.Contents) {
      return [];
    }
    
    return response.Contents
      .map(item => item.Key)
      .filter((key): key is string => key !== undefined);
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error('Failed to list files');
  }
};

/**
 * Upload a file to S3
 */
export const uploadFile = async (
  key: string,
  body: Buffer | string
): Promise<void> => {
  try {
    const s3Client = getS3ClientInstance();
    const bucketName = getBucketName();
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
    });
    
    await s3Client.send(command);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}; 