# AWS S3 Integration Architecture

This document outlines the architecture and usage patterns for the AWS S3 integration in the Costa Beach HOA Portal.

## Overview

The S3 integration provides secure file storage and retrieval capabilities for the HOA portal, allowing users to upload, download, and manage documents. The implementation follows best practices for security, performance, and error handling.

## Configuration

The S3 integration is configured using environment variables:

- `AWS_REGION`: The AWS region where the S3 bucket is located (default: `us-west-2`)
- `AWS_ACCESS_KEY_ID`: The AWS access key ID for authentication
- `AWS_SECRET_ACCESS_KEY`: The AWS secret access key for authentication
- `BUCKET_NAME`: The name of the S3 bucket (default: `costa-beach-documents`)

These values should be set in the `.env` file for local development and in the appropriate environment configuration for production deployments.

## Architecture

The S3 integration consists of the following components:

### 1. Configuration (`config.ts`)

- Provides a centralized configuration for S3 services
- Implements validation to ensure required environment variables are set
- Creates and manages the S3 client instance
- Provides utility functions for accessing configuration values

### 2. Operations (`operations.ts`)

- Implements file operations (upload, download, delete, list)
- Provides secure URL generation for client-side uploads and downloads
- Handles error cases gracefully with appropriate error messages
- Implements file path generation and sanitization

### 3. Tests (`__tests__/s3.test.ts`)

- Provides comprehensive test coverage for configuration and operations
- Mocks AWS SDK to enable testing without actual AWS credentials
- Tests error handling and edge cases

## Security Considerations

The S3 integration implements several security measures:

1. **Signed URLs**: All file access is done through signed URLs that expire after a configurable time period (default: 1 hour)
2. **Path Sanitization**: File paths are sanitized to prevent path traversal attacks
3. **Content Type Validation**: File uploads include content type validation
4. **Error Handling**: All operations include proper error handling to prevent information leakage

## Usage Patterns

### Uploading Files

The file upload process follows a two-step approach:

1. The client requests a signed URL for uploading a specific file
2. The client uploads the file directly to S3 using the signed URL

This approach minimizes server load and allows for large file uploads without hitting API limits.

```typescript
// Server-side: Generate upload URL
const { uploadUrl, filePath } = await getUploadUrl(
  userId,
  fileName,
  fileType,
  category,
  language
);

// Client-side: Upload file using the signed URL
await fetch(uploadUrl, {
  method: 'PUT',
  body: fileData,
  headers: {
    'Content-Type': fileType
  }
});

// Server-side: Create document record in database
await createDocument(
  title,
  description,
  filePath,
  fileSize,
  fileType,
  category,
  language,
  authorId
);
```

### Downloading Files

File downloads also use signed URLs:

```typescript
// Server-side: Generate download URL
const downloadUrl = await getDownloadUrl(document.filePath);

// Client-side: Download file using the signed URL
window.location.href = downloadUrl;
```

### File Management

The S3 integration provides functions for file management:

```typescript
// Check if a file exists
const exists = await fileExists(filePath);

// Delete a file
await deleteFile(filePath);

// List files in a directory
const files = await listFiles('documents/legal/');
```

## Error Handling

All S3 operations include comprehensive error handling:

1. Configuration errors are logged with clear messages
2. Operation errors are caught and transformed into user-friendly messages
3. Network errors are handled gracefully with appropriate retry mechanisms

## Testing

The S3 integration includes comprehensive tests:

```bash
# Run S3 tests
npm test -- --testPathPattern=s3
```

## CORS Configuration

The S3 bucket should be configured with appropriate CORS settings to allow direct uploads from the client. Here's an example CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## Bucket Policy

The S3 bucket should have a policy that restricts access to authorized users only. Here's an example bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/YOUR_IAM_USER"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME",
        "arn:aws:s3:::YOUR_BUCKET_NAME/*"
      ]
    }
  ]
}
```

## Conclusion

The S3 integration provides a secure, efficient, and reliable way to store and retrieve files for the Costa Beach HOA Portal. By following the patterns and practices outlined in this document, developers can ensure that file operations are performed securely and efficiently. 