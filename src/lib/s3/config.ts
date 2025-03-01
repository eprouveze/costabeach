import { S3Client } from '@aws-sdk/client-s3';

// Default values for S3 configuration
const DEFAULT_REGION = 'us-west-2';
const DEFAULT_BUCKET_NAME = 'costa-beach-documents';

// Environment variables for S3 configuration
export const S3_CONFIG = {
  get region() {
    return process.env.AWS_REGION || DEFAULT_REGION;
  },
  get accessKeyId() {
    return process.env.AWS_ACCESS_KEY_ID || '';
  },
  get secretAccessKey() {
    return process.env.AWS_SECRET_ACCESS_KEY || '';
  },
  get bucketName() {
    return process.env.BUCKET_NAME || DEFAULT_BUCKET_NAME;
  },
};

// Validate S3 configuration
export const validateS3Config = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!process.env.AWS_ACCESS_KEY_ID) {
    errors.push('AWS_ACCESS_KEY_ID is not defined');
  }

  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    errors.push('AWS_SECRET_ACCESS_KEY is not defined');
  }

  if (!process.env.AWS_REGION) {
    errors.push('AWS_REGION is not defined');
  }

  if (!process.env.BUCKET_NAME) {
    errors.push('BUCKET_NAME is not defined');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Initialize S3 client with error handling
export const getS3Client = (): S3Client => {
  const validation = validateS3Config();
  
  if (!validation.isValid) {
    console.warn('S3 configuration is incomplete:', validation.errors.join(', '));
    console.warn('Using default values where possible. Some S3 operations may fail.');
  }
  
  return new S3Client({
    region: S3_CONFIG.region,
    credentials: {
      accessKeyId: S3_CONFIG.accessKeyId,
      secretAccessKey: S3_CONFIG.secretAccessKey,
    },
  });
};

// Singleton instance of S3 client
let s3ClientInstance: S3Client | null = null;

// Get or create S3 client instance
export const getS3ClientInstance = (): S3Client => {
  if (!s3ClientInstance) {
    s3ClientInstance = getS3Client();
  }
  return s3ClientInstance;
};

// Reset S3 client instance (useful for testing)
export const resetS3ClientInstance = (): void => {
  s3ClientInstance = null;
};

// Get S3 bucket name
export const getBucketName = (): string => {
  return S3_CONFIG.bucketName;
};

// Get S3 bucket URL
export const getBucketUrl = (): string => {
  const bucketName = getBucketName();
  const region = S3_CONFIG.region;
  return `https://${bucketName}.s3.${region}.amazonaws.com`;
}; 