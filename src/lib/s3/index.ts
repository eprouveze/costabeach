// Export configuration
export {
  S3_CONFIG,
  validateS3Config,
  getS3Client,
  getS3ClientInstance,
  resetS3ClientInstance,
  getBucketName,
  getBucketUrl
} from './config';

// Export operations
export {
  generateS3FilePath,
  getUploadUrl,
  getDownloadUrl,
  fileExists,
  deleteFile,
  listFiles,
  uploadFile
} from './operations';

// Re-export types from AWS SDK that might be useful
export type {
  PutObjectCommandInput,
  GetObjectCommandInput,
  DeleteObjectCommandInput,
  HeadObjectCommandInput,
  ListObjectsV2CommandInput
} from '@aws-sdk/client-s3'; 