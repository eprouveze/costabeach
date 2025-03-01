import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  S3_CONFIG,
  validateS3Config,
  getS3Client,
  getS3ClientInstance,
  resetS3ClientInstance,
  getBucketName,
  getBucketUrl,
} from '../config';
import {
  generateS3FilePath,
  getUploadUrl,
  getDownloadUrl,
  fileExists,
  deleteFile,
  listFiles,
  uploadFile,
} from '../operations';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3', () => {
  const mockSend = jest.fn();
  const mockS3Client = function() {
    return {
      send: mockSend,
      config: {
        region: 'test-region',
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
      },
    };
  };
  
  // Make the mock constructor function look like a class
  mockS3Client.prototype = Object.create(Function.prototype);
  
  return {
    S3Client: jest.fn().mockImplementation(mockS3Client),
    PutObjectCommand: jest.fn().mockImplementation((input) => ({
      input,
    })),
    GetObjectCommand: jest.fn().mockImplementation((input) => ({
      input,
    })),
    DeleteObjectCommand: jest.fn().mockImplementation((input) => ({
      input,
    })),
    HeadObjectCommand: jest.fn().mockImplementation((input) => ({
      input,
    })),
    ListObjectsV2Command: jest.fn().mockImplementation((input) => ({
      input,
    })),
    S3ServiceException: class S3ServiceException extends Error {
      name: string;
      constructor(message: string) {
        super(message);
        this.name = 'NotFound';
      }
    },
  };
});

// Mock the s3-request-presigner
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

// Mock environment variables
const originalEnv = process.env;

describe('S3 Configuration', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      AWS_ACCESS_KEY_ID: 'test-access-key',
      AWS_SECRET_ACCESS_KEY: 'test-secret-key',
      AWS_REGION: 'test-region',
      BUCKET_NAME: 'test-bucket',
    };
    resetS3ClientInstance();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('should validate S3 configuration', () => {
    const validation = validateS3Config();
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('should report missing AWS_ACCESS_KEY_ID', () => {
    delete process.env.AWS_ACCESS_KEY_ID;
    const validation = validateS3Config();
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('AWS_ACCESS_KEY_ID is not defined');
  });

  test('should report missing AWS_SECRET_ACCESS_KEY', () => {
    delete process.env.AWS_SECRET_ACCESS_KEY;
    const validation = validateS3Config();
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('AWS_SECRET_ACCESS_KEY is not defined');
  });

  test('should report missing AWS_REGION', () => {
    delete process.env.AWS_REGION;
    const validation = validateS3Config();
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('AWS_REGION is not defined');
  });

  test('should report missing BUCKET_NAME', () => {
    delete process.env.BUCKET_NAME;
    const validation = validateS3Config();
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('BUCKET_NAME is not defined');
  });

  test('should create S3 client with correct configuration', () => {
    const client = getS3Client();
    // Skip the instanceof check since it's difficult to mock properly
    expect(S3Client).toHaveBeenCalledWith({
      region: 'test-region',
      credentials: {
        accessKeyId: 'test-access-key',
        secretAccessKey: 'test-secret-key',
      },
    });
  });

  test('should return singleton instance of S3 client', () => {
    const client1 = getS3ClientInstance();
    const client2 = getS3ClientInstance();
    expect(client1).toBe(client2);
    expect(S3Client).toHaveBeenCalledTimes(1);
  });

  test('should reset S3 client instance', () => {
    const client1 = getS3ClientInstance();
    resetS3ClientInstance();
    const client2 = getS3ClientInstance();
    expect(client1).not.toBe(client2);
    expect(S3Client).toHaveBeenCalledTimes(2);
  });

  test('should get bucket name', () => {
    expect(getBucketName()).toBe('test-bucket');
  });

  test('should get bucket URL', () => {
    expect(getBucketUrl()).toBe('https://test-bucket.s3.test-region.amazonaws.com');
  });
});

describe('S3 Operations', () => {
  const mockS3Send = jest.fn();
  
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      AWS_ACCESS_KEY_ID: 'test-access-key',
      AWS_SECRET_ACCESS_KEY: 'test-secret-key',
      AWS_REGION: 'test-region',
      BUCKET_NAME: 'test-bucket',
    };
    resetS3ClientInstance();
    jest.clearAllMocks();
    
    // Reset the mock implementation for S3Client
    (S3Client as jest.Mock).mockImplementation(() => ({
      send: mockS3Send,
      config: {
        region: 'test-region',
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
      },
    }));
    
    // Reset getSignedUrl mock
    (getSignedUrl as jest.Mock).mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  test('should generate S3 file path', () => {
    const path = generateS3FilePath('users', '123', 'document.pdf');
    expect(path).toBe('users/123/document.pdf');
  });

  test('should get upload URL', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue('https://test-bucket.s3.test-region.amazonaws.com/upload-url');
    
    const url = await getUploadUrl('users/123/document.pdf');
    
    expect(getSignedUrl).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      { expiresIn: 3600 }
    );
    
    const commandArg = (getSignedUrl as jest.Mock).mock.calls[0][1];
    expect(commandArg.input).toEqual({
      Bucket: 'test-bucket',
      Key: 'users/123/document.pdf',
    });
    
    expect(url).toBe('https://test-bucket.s3.test-region.amazonaws.com/upload-url');
  });

  test('should handle error when getting upload URL', async () => {
    (getSignedUrl as jest.Mock).mockRejectedValue(new Error('Failed to generate URL'));
    
    await expect(getUploadUrl('users/123/document.pdf')).rejects.toThrow('Failed to generate upload URL');
  });

  test('should get download URL', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue('https://test-bucket.s3.test-region.amazonaws.com/download-url');
    
    const url = await getDownloadUrl('users/123/document.pdf');
    
    expect(getSignedUrl).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      { expiresIn: 3600 }
    );
    
    const commandArg = (getSignedUrl as jest.Mock).mock.calls[0][1];
    expect(commandArg.input).toEqual({
      Bucket: 'test-bucket',
      Key: 'users/123/document.pdf',
    });
    
    expect(url).toBe('https://test-bucket.s3.test-region.amazonaws.com/download-url');
  });

  test('should handle error when getting download URL', async () => {
    (getSignedUrl as jest.Mock).mockRejectedValue(new Error('Failed to generate URL'));
    
    await expect(getDownloadUrl('users/123/document.pdf')).rejects.toThrow('Failed to generate download URL');
  });

  test('should check if file exists', async () => {
    mockS3Send.mockResolvedValue({});
    
    const exists = await fileExists('users/123/document.pdf');
    
    expect(mockS3Send).toHaveBeenCalledTimes(1);
    expect(HeadObjectCommand).toHaveBeenCalledWith({
      Bucket: 'test-bucket',
      Key: 'users/123/document.pdf',
    });
    
    expect(exists).toBe(true);
  });

  test('should return false when file does not exist', async () => {
    const notFoundError = new Error('NotFound');
    (notFoundError as any).name = 'NotFound';
    mockS3Send.mockRejectedValue(notFoundError);
    
    const exists = await fileExists('users/123/document.pdf');
    
    expect(exists).toBe(false);
  });

  test('should handle error when checking if file exists', async () => {
    mockS3Send.mockRejectedValue(new Error('Unknown error'));
    
    await expect(fileExists('users/123/document.pdf')).rejects.toThrow('Failed to check if file exists');
  });

  test('should delete file', async () => {
    mockS3Send.mockResolvedValue({});
    
    await deleteFile('users/123/document.pdf');
    
    expect(mockS3Send).toHaveBeenCalledTimes(1);
    expect(DeleteObjectCommand).toHaveBeenCalledWith({
      Bucket: 'test-bucket',
      Key: 'users/123/document.pdf',
    });
  });

  test('should handle error when deleting file', async () => {
    mockS3Send.mockRejectedValue(new Error('Failed to delete'));
    
    await expect(deleteFile('users/123/document.pdf')).rejects.toThrow('Failed to delete file');
  });

  test('should list files', async () => {
    mockS3Send.mockResolvedValue({
      Contents: [
        { Key: 'users/123/document1.pdf' },
        { Key: 'users/123/document2.pdf' },
      ],
    });
    
    const files = await listFiles('users/123');
    
    expect(mockS3Send).toHaveBeenCalledTimes(1);
    expect(ListObjectsV2Command).toHaveBeenCalledWith({
      Bucket: 'test-bucket',
      Prefix: 'users/123',
    });
    
    expect(files).toEqual(['users/123/document1.pdf', 'users/123/document2.pdf']);
  });

  test('should return empty array when no files found', async () => {
    mockS3Send.mockResolvedValue({});
    
    const files = await listFiles('users/123');
    
    expect(files).toEqual([]);
  });

  test('should handle error when listing files', async () => {
    mockS3Send.mockRejectedValue(new Error('Failed to list'));
    
    await expect(listFiles('users/123')).rejects.toThrow('Failed to list files');
  });

  test('should upload file', async () => {
    mockS3Send.mockResolvedValue({});
    
    await uploadFile('users/123/document.pdf', Buffer.from('test content'));
    
    expect(mockS3Send).toHaveBeenCalledTimes(1);
    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: 'test-bucket',
      Key: 'users/123/document.pdf',
      Body: Buffer.from('test content'),
    });
  });

  test('should handle error when uploading file', async () => {
    mockS3Send.mockRejectedValue(new Error('Failed to upload'));
    
    await expect(uploadFile('users/123/document.pdf', Buffer.from('test content'))).rejects.toThrow('Failed to upload file');
  });
}); 