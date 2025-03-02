import { validateFileType, validateFileSize, getFileExtension } from '@/lib/utils/fileValidation';

describe('File Validation Utilities', () => {
  describe('validateFileType', () => {
    it('should return true for allowed file types', () => {
      // Create mock files with allowed types
      const pdfFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const jpgFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const docxFile = new File(['test content'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      
      // Test with default allowed types
      expect(validateFileType(pdfFile)).toBe(true);
      expect(validateFileType(jpgFile)).toBe(true);
      expect(validateFileType(docxFile)).toBe(true);
      
      // Test with custom allowed types
      expect(validateFileType(pdfFile, ['application/pdf'])).toBe(true);
      expect(validateFileType(jpgFile, ['image/jpeg'])).toBe(true);
      expect(validateFileType(docxFile, ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'])).toBe(true);
    });
    
    it('should return false for disallowed file types', () => {
      // Create mock files with disallowed types
      const exeFile = new File(['test content'], 'test.exe', { type: 'application/x-msdownload' });
      const htmlFile = new File(['test content'], 'test.html', { type: 'text/html' });
      
      // Test with default allowed types
      expect(validateFileType(exeFile)).toBe(false);
      
      // Test with custom allowed types
      expect(validateFileType(htmlFile, ['application/pdf'])).toBe(false);
    });
    
    it('should handle files with no type', () => {
      // Create a mock file with no type
      const noTypeFile = new File(['test content'], 'test.unknown', { type: '' });
      
      // Should use file extension as fallback
      expect(validateFileType(noTypeFile)).toBe(false);
      expect(validateFileType(noTypeFile, ['application/octet-stream'])).toBe(false);
    });
  });
  
  describe('validateFileSize', () => {
    it('should return true for files within size limit', () => {
      // Create mock files of different sizes
      const smallFile = new File(['test'], 'small.txt', { type: 'text/plain' });
      const mediumFile = new File(new Array(1024 * 1024).fill('a').join(''), 'medium.txt', { type: 'text/plain' });
      
      // Test with default max size (10MB)
      expect(validateFileSize(smallFile)).toBe(true);
      expect(validateFileSize(mediumFile)).toBe(true);
      
      // Test with custom max size
      expect(validateFileSize(smallFile, 0.001)).toBe(true); // 1KB
      expect(validateFileSize(mediumFile, 2)).toBe(true); // 2MB
    });
    
    it('should return false for files exceeding size limit', () => {
      // Create a mock file that's larger than the limit
      // Note: We're not actually creating a large file, just mocking the size property
      const largeFile = new File(['test'], 'large.txt', { type: 'text/plain' });
      Object.defineProperty(largeFile, 'size', { value: 15 * 1024 * 1024 }); // 15MB
      
      // Test with default max size (10MB)
      expect(validateFileSize(largeFile)).toBe(false);
      
      // Test with custom max size
      expect(validateFileSize(largeFile, 5)).toBe(false); // 5MB
    });
  });
  
  describe('getFileExtension', () => {
    it('should return the correct file extension', () => {
      expect(getFileExtension('test.pdf')).toBe('pdf');
      expect(getFileExtension('test.file.jpg')).toBe('jpg');
      expect(getFileExtension('noextension')).toBe('');
      expect(getFileExtension('.htaccess')).toBe('htaccess');
    });
    
    it('should handle file paths', () => {
      expect(getFileExtension('/path/to/file.txt')).toBe('txt');
      expect(getFileExtension('C:\\Windows\\file.exe')).toBe('exe');
    });
    
    it('should handle empty strings', () => {
      expect(getFileExtension('')).toBe('');
    });
  });
}); 