import { generateS3FilePath, canManageDocumentCategory } from '../documents';
import { DocumentCategory, Language, Permission } from '@/lib/types';

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
}); 