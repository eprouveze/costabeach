/**
 * File validation utilities for document uploads
 */

// Default allowed file types
const DEFAULT_ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/gif',
];

// Default maximum file size in MB
const DEFAULT_MAX_SIZE_MB = 10;

/**
 * Get the file extension from a filename
 */
export const getFileExtension = (filename: string): string => {
  if (!filename || typeof filename !== 'string') return '';
  
  const parts = filename.split('.');
  if (parts.length === 1) return '';
  
  return parts[parts.length - 1].toLowerCase();
};

/**
 * Map common file extensions to MIME types
 */
export const getFileTypeFromExtension = (extension: string): string | null => {
  const extensionMap: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
  };
  
  return extensionMap[extension.toLowerCase()] || null;
};

/**
 * Validate if a file type is allowed
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[] = DEFAULT_ALLOWED_FILE_TYPES
): boolean => {
  // Check if the file type is directly in the allowed list
  if (file.type && allowedTypes.includes(file.type)) {
    return true;
  }
  
  // If no file type is provided, try to determine it from the extension
  if (!file.type) {
    const extension = getFileExtension(file.name);
    const mimeType = getFileTypeFromExtension(extension);
    
    if (mimeType && allowedTypes.includes(mimeType)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Validate if a file size is within the allowed limit
 */
export const validateFileSize = (
  file: File,
  maxSizeMB: number = DEFAULT_MAX_SIZE_MB
): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Get a human-readable file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get a list of allowed file extensions for display
 */
export const getAllowedFileExtensions = (
  allowedTypes: string[] = DEFAULT_ALLOWED_FILE_TYPES
): string[] => {
  const extensionMap: Record<string, string[]> = {
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/vnd.ms-excel': ['xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
    'application/vnd.ms-powerpoint': ['ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
    'text/plain': ['txt'],
    'text/csv': ['csv'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
  };
  
  return allowedTypes.flatMap(type => extensionMap[type] || []);
}; 