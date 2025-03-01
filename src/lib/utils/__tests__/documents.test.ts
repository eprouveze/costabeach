import { generateS3FilePath, canManageDocumentCategory, getDownloadUrl } from '../documents';
import { DocumentCategory, Language, Permission } from '@/lib/types';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  GetObjectCommand: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://example.com/signed-url'),
}));

describe('Document Utilities', () => {
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
  
  describe('canManageDocumentCategory', () => {
    it('should return true if user has general document management permission', () => {
      const userPermissions = [Permission.MANAGE_DOCUMENTS];
      
      expect(canManageDocumentCategory(userPermissions, DocumentCategory.COMITE_DE_SUIVI)).toBe(true);
      expect(canManageDocumentCategory(userPermissions, DocumentCategory.SOCIETE_DE_GESTION)).toBe(true);
      expect(canManageDocumentCategory(userPermissions, DocumentCategory.LEGAL)).toBe(true);
    });
    
    it('should return true if user has specific category permission', () => {
      const userPermissions = [Permission.MANAGE_COMITE_DOCUMENTS];
      
      expect(canManageDocumentCategory(userPermissions, DocumentCategory.COMITE_DE_SUIVI)).toBe(true);
      expect(canManageDocumentCategory(userPermissions, DocumentCategory.SOCIETE_DE_GESTION)).toBe(false);
      expect(canManageDocumentCategory(userPermissions, DocumentCategory.LEGAL)).toBe(false);
    });
    
    it('should return false if user has no relevant permissions', () => {
      const userPermissions = [Permission.APPROVE_REGISTRATIONS];
      
      expect(canManageDocumentCategory(userPermissions, DocumentCategory.COMITE_DE_SUIVI)).toBe(false);
      expect(canManageDocumentCategory(userPermissions, DocumentCategory.SOCIETE_DE_GESTION)).toBe(false);
      expect(canManageDocumentCategory(userPermissions, DocumentCategory.LEGAL)).toBe(false);
    });
    
    it('should return false for empty permissions array', () => {
      const userPermissions: string[] = [];
      
      expect(canManageDocumentCategory(userPermissions, DocumentCategory.COMITE_DE_SUIVI)).toBe(false);
    });
  });
  
  describe('getDownloadUrl', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      process.env.BUCKET_NAME = 'costa-beach-documents';
      process.env.AWS_REGION = 'us-west-2';
    });
    
    it('should generate a signed URL for a document', async () => {
      const filePath = 'documents/legal/english/user123/test-document.pdf';
      
      const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
      const { GetObjectCommand } = require('@aws-sdk/client-s3');
      
      // Mock the GetObjectCommand implementation to use the correct bucket name
      GetObjectCommand.mockImplementation((params: { Bucket: string; Key: string }) => {
        return { ...params, Bucket: 'costa-beach-documents' };
      });
      
      const url = await getDownloadUrl(filePath);
      
      expect(url).toBe('https://example.com/signed-url');
      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'your-bucket-name',
        Key: filePath,
      });
      expect(getSignedUrl).toHaveBeenCalled();
    });
    
    it('should use the default bucket name if not defined in env', async () => {
      process.env.BUCKET_NAME = '';
      
      const filePath = 'documents/legal/english/user123/test-document.pdf';
      
      // Mock the GetObjectCommand implementation to use the correct bucket name
      const { GetObjectCommand } = require('@aws-sdk/client-s3');
      GetObjectCommand.mockImplementation((params: { Bucket: string; Key: string }) => {
        return { ...params, Bucket: 'costa-beach-documents' };
      });
      
      await getDownloadUrl(filePath);
      
      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'your-bucket-name', // Default value from the implementation
        Key: filePath,
      });
    });
    
    it('should use the default AWS region if not defined in env', async () => {
      process.env.AWS_REGION = '';
      
      const filePath = 'documents/legal/english/user123/test-document.pdf';
      
      await getDownloadUrl(filePath);
      // Test passes if no error is thrown
    });
  });
}); 