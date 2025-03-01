import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { 
  S3_CONFIG, 
  validateS3Config, 
  getS3Client, 
  getS3ClientInstance,
  resetS3ClientInstance,
  getBucketName
} from '../config';
import {
  generateS3FilePath,
  getUploadUrl,
  getDownloadUrl,
  fileExists,
  deleteFile,
  listFiles,
  uploadFile
} from '../operations';
import { DocumentCategory, Language } from '@/lib/types';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3', () => {
  const mockSend = jest.fn().mockResolvedValue({
    Contents: [
      { Key: 'documents/test1.pdf' },
      { Key: 'documents/test2.pdf' }
    ]
  });
  
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: mockSend
    })),
    PutObjectCommand: jest.fn(),
    GetObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
    HeadObjectCommand: jest.fn(),
    ListObjectsV2Command: jest.fn(),
    S3ServiceException: class S3ServiceException extends Error {
      name: string;
      constructor(message: string) {
        super(message);
        this.name = 'NotFound';
      }
    }
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://example.com/signed-url')
}));

describe('S3 Configuration', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.AWS_REGION = 'us-west-2';
    process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
    process.env.BUCKET_NAME = 'test-bucket';
    resetS3ClientInstance();
  });
  
  afterAll(() => {
    process.env = originalEnv;
  });
  
  describe('validateS3Config', () => {
    it('should return valid when all required env vars are set', () => {
      const result = validateS3Config();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should return invalid when AWS_ACCESS_KEY_ID is missing', () => {
      process.env.AWS_ACCESS_KEY_ID = '';
      const result = validateS3Config();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('AWS_ACCESS_KEY_ID is not defined');
    });
    
    it('should return invalid when AWS_SECRET_ACCESS_KEY is missing', () => {
      process.env.AWS_SECRET_ACCESS_KEY = '';
      const result = validateS3Config();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('AWS_SECRET_ACCESS_KEY is not defined');
    });
    
    it('should return invalid when AWS_REGION is missing', () => {
      process.env.AWS_REGION = '';
      const result = validateS3Config();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('AWS_REGION is not defined');
    });
    
    it('should return invalid when BUCKET_NAME is missing', () => {
      process.env.BUCKET_NAME = '';
      const result = validateS3Config();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('BUCKET_NAME is not defined');
    });
  });
  
  describe('getS3Client', () => {
    it('should create an S3Client with the correct configuration', () => {
      const client = getS3Client();
      expect(S3Client).toHaveBeenCalledWith({
        region: 'us-west-2',
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key'
        }
      });
    });
    
    it('should log warnings when configuration is invalid', () => {
      process.env.AWS_ACCESS_KEY_ID = '';
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      getS3Client();
      expect(consoleSpy).toHaveBeenCalledWith(
        'S3 configuration is incomplete:',
        'AWS_ACCESS_KEY_ID is not defined'
      );
      consoleSpy.mockRestore();
    });
  });
  
  describe('getS3ClientInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = getS3ClientInstance();
      const instance2 = getS3ClientInstance();
      expect(instance1).toBe(instance2);
      expect(S3Client).toHaveBeenCalledTimes(1);
    });
    
    it('should create a new instance after reset', () => {
      const instance1 = getS3ClientInstance();
      resetS3ClientInstance();
      const instance2 = getS3ClientInstance();
      expect(instance1).not.toBe(instance2);
      expect(S3Client).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('getBucketName', () => {
    it('should return the configured bucket name', () => {
      expect(getBucketName()).toBe('test-bucket');
    });
    
    it('should return the default bucket name when not configured', () => {
      process.env.BUCKET_NAME = '';
      expect(getBucketName()).toBe('costa-beach-documents');
    });
  });
});

describe('S3 Operations', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.AWS_REGION = 'us-west-2';
    process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
    process.env.BUCKET_NAME = 'test-bucket';
    resetS3ClientInstance();
  });
  
  afterAll(() => {
    process.env = originalEnv;
  });
  
  describe('generateS3FilePath', () => {
    it('should generate a valid S3 file path', () => {
      const userId = 'user123';
      const fileName = 'test-document.pdf';
      const category = DocumentCategory.COMITE_DE_SUIVI;
      const language = Language.FRENCH;
      
      const filePath = generateS3FilePath(userId, fileName, category, language);
      
      expect(filePath).toContain('documents/comiteDeSuivi/french');
      expect(filePath).toContain(userId);
      expect(filePath).toContain('test-document.pdf');
    });
    
    it('should sanitize file names with special characters', () => {
      const userId = 'user123';
      const fileName = 'test document with spaces & special chars!.pdf';
      const category = DocumentCategory.LEGAL;
      const language = Language.ARABIC;
      
      const filePath = generateS3FilePath(userId, fileName, category, language);
      
      expect(filePath).toContain('documents/legal/arabic');
      expect(filePath).toContain(userId);
      expect(filePath).toContain('test_document_with_spaces___special_chars_.pdf');
      expect(filePath).not.toContain('spaces & special');
    });
  });
  
  describe('getUploadUrl', () => {
    it('should generate a signed URL for uploading', async () => {
      const userId = 'user123';
      const fileName = 'test-document.pdf';
      const fileType = 'application/pdf';
      const category = DocumentCategory.COMITE_DE_SUIVI;
      const language = Language.FRENCH;
      
      const result = await getUploadUrl(userId, fileName, fileType, category, language);
      
      expect(result.uploadUrl).toBe('https://example.com/signed-url');
      expect(result.filePath).toContain('documents/comiteDeSuivi/french');
      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: expect.stringContaining('documents/comiteDeSuivi/french'),
        ContentType: 'application/pdf'
      });
      expect(getSignedUrl).toHaveBeenCalled();
    });
    
    it('should handle errors gracefully', async () => {
      (getSignedUrl as jest.Mock).mockRejectedValueOnce(new Error('Test error'));
      
      const userId = 'user123';
      const fileName = 'test-document.pdf';
      const fileType = 'application/pdf';
      const category = DocumentCategory.COMITE_DE_SUIVI;
      const language = Language.FRENCH;
      
      await expect(getUploadUrl(userId, fileName, fileType, category, language))
        .rejects.toThrow('Failed to generate upload URL. Please try again later.');
    });
  });
  
  describe('getDownloadUrl', () => {
    it('should generate a signed URL for downloading', async () => {
      const filePath = 'documents/comiteDeSuivi/french/user123_123456789_test-document.pdf';
      
      const url = await getDownloadUrl(filePath);
      
      expect(url).toBe('https://example.com/signed-url');
      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: filePath
      });
      expect(getSignedUrl).toHaveBeenCalled();
    });
    
    it('should handle errors gracefully', async () => {
      (getSignedUrl as jest.Mock).mockRejectedValueOnce(new Error('Test error'));
      
      const filePath = 'documents/comiteDeSuivi/french/user123_123456789_test-document.pdf';
      
      await expect(getDownloadUrl(filePath))
        .rejects.toThrow('Failed to generate download URL. Please try again later.');
    });
  });
  
  describe('fileExists', () => {
    it('should return true when file exists', async () => {
      const filePath = 'documents/test.pdf';
      const mockS3Client = getS3ClientInstance();
      
      const exists = await fileExists(filePath);
      
      expect(exists).toBe(true);
      expect(HeadObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: filePath
      });
      expect(mockS3Client.send).toHaveBeenCalled();
    });
    
    it('should return false when file does not exist', async () => {
      const filePath = 'documents/nonexistent.pdf';
      const mockS3Client = getS3ClientInstance();
      
      (mockS3Client.send as jest.Mock).mockRejectedValueOnce(
        new (jest.requireMock('@aws-sdk/client-s3').S3ServiceException)('NotFound')
      );
      
      const exists = await fileExists(filePath);
      
      expect(exists).toBe(false);
    });
    
    it('should handle unexpected errors', async () => {
      const filePath = 'documents/test.pdf';
      const mockS3Client = getS3ClientInstance();
      
      (mockS3Client.send as jest.Mock).mockRejectedValueOnce(new Error('Unexpected error'));
      
      await expect(fileExists(filePath))
        .rejects.toThrow('Failed to check if file exists. Please try again later.');
    });
  });
  
  describe('listFiles', () => {
    it('should list files with the given prefix', async () => {
      const prefix = 'documents/';
      
      const files = await listFiles(prefix);
      
      expect(files).toEqual(['documents/test1.pdf', 'documents/test2.pdf']);
      expect(ListObjectsV2Command).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Prefix: prefix,
        MaxKeys: 1000
      });
    });
    
    it('should return empty array when no contents', async () => {
      const prefix = 'empty/';
      const mockS3Client = getS3ClientInstance();
      
      (mockS3Client.send as jest.Mock).mockResolvedValueOnce({});
      
      const files = await listFiles(prefix);
      
      expect(files).toEqual([]);
    });
    
    it('should handle errors gracefully', async () => {
      const prefix = 'documents/';
      const mockS3Client = getS3ClientInstance();
      
      (mockS3Client.send as jest.Mock).mockRejectedValueOnce(new Error('Test error'));
      
      await expect(listFiles(prefix))
        .rejects.toThrow('Failed to list files. Please try again later.');
    });
  });
}); 