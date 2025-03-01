import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const S3IntegrationDocs = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AWS S3 Integration Architecture</h1>
      
      <p className="mb-4">
        This document outlines the architecture and usage patterns for the AWS S3 integration in the Costa Beach HOA Portal.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Overview</h2>
      <p className="mb-4">
        The S3 integration provides secure file storage and retrieval capabilities for the HOA portal, 
        allowing users to upload, download, and manage documents. The implementation follows best practices 
        for security, performance, and error handling.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Configuration</h2>
      <p className="mb-4">
        The S3 integration is configured using environment variables:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li className="mb-2"><code className="bg-gray-100 px-1 py-0.5 rounded">AWS_REGION</code>: The AWS region where the S3 bucket is located (default: <code className="bg-gray-100 px-1 py-0.5 rounded">us-west-2</code>)</li>
        <li className="mb-2"><code className="bg-gray-100 px-1 py-0.5 rounded">AWS_ACCESS_KEY_ID</code>: The AWS access key ID for authentication</li>
        <li className="mb-2"><code className="bg-gray-100 px-1 py-0.5 rounded">AWS_SECRET_ACCESS_KEY</code>: The AWS secret access key for authentication</li>
        <li className="mb-2"><code className="bg-gray-100 px-1 py-0.5 rounded">BUCKET_NAME</code>: The name of the S3 bucket (default: <code className="bg-gray-100 px-1 py-0.5 rounded">costa-beach-documents</code>)</li>
      </ul>
      <p className="mb-4">
        These values should be set in the <code className="bg-gray-100 px-1 py-0.5 rounded">.env</code> file for local development 
        and in the appropriate environment configuration for production deployments.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Architecture</h2>
      <p className="mb-4">
        The S3 integration consists of the following components:
      </p>
      
      <h3 className="text-xl font-bold mt-6 mb-3">1. Configuration (<code className="bg-gray-100 px-1 py-0.5 rounded">config.ts</code>)</h3>
      <ul className="list-disc pl-6 mb-4">
        <li className="mb-2">Provides a centralized configuration for S3 services</li>
        <li className="mb-2">Implements validation to ensure required environment variables are set</li>
        <li className="mb-2">Creates and manages the S3 client instance</li>
        <li className="mb-2">Provides utility functions for accessing configuration values</li>
      </ul>
      
      <h3 className="text-xl font-bold mt-6 mb-3">2. Operations (<code className="bg-gray-100 px-1 py-0.5 rounded">operations.ts</code>)</h3>
      <ul className="list-disc pl-6 mb-4">
        <li className="mb-2">Implements file operations (upload, download, delete, list)</li>
        <li className="mb-2">Provides secure URL generation for client-side uploads and downloads</li>
        <li className="mb-2">Handles error cases gracefully with appropriate error messages</li>
        <li className="mb-2">Implements file path generation and sanitization</li>
      </ul>
      
      <h3 className="text-xl font-bold mt-6 mb-3">3. Tests (<code className="bg-gray-100 px-1 py-0.5 rounded">__tests__/s3.test.ts</code>)</h3>
      <ul className="list-disc pl-6 mb-4">
        <li className="mb-2">Provides comprehensive test coverage for configuration and operations</li>
        <li className="mb-2">Mocks AWS SDK to enable testing without actual AWS credentials</li>
        <li className="mb-2">Tests error handling and edge cases</li>
      </ul>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Security Considerations</h2>
      <p className="mb-4">
        The S3 integration implements several security measures:
      </p>
      <ol className="list-decimal pl-6 mb-4">
        <li className="mb-2"><strong>Signed URLs</strong>: All file access is done through signed URLs that expire after a configurable time period (default: 1 hour)</li>
        <li className="mb-2"><strong>Path Sanitization</strong>: File paths are sanitized to prevent path traversal attacks</li>
        <li className="mb-2"><strong>Content Type Validation</strong>: File uploads include content type validation</li>
        <li className="mb-2"><strong>Error Handling</strong>: All operations include proper error handling to prevent information leakage</li>
      </ol>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Usage Patterns</h2>
      
      <h3 className="text-xl font-bold mt-6 mb-3">Uploading Files</h3>
      <p className="mb-4">
        The file upload process follows a two-step approach:
      </p>
      <ol className="list-decimal pl-6 mb-4">
        <li className="mb-2">The client requests a signed URL for uploading a specific file</li>
        <li className="mb-2">The client uploads the file directly to S3 using the signed URL</li>
      </ol>
      <p className="mb-4">
        This approach minimizes server load and allows for large file uploads without hitting API limits.
      </p>
      
      <div className="bg-gray-100 p-4 rounded-md mb-6 overflow-x-auto">
        <pre className="text-sm">
{`// Server-side: Generate upload URL
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
);`}
        </pre>
      </div>
      
      <h3 className="text-xl font-bold mt-6 mb-3">Downloading Files</h3>
      <p className="mb-4">
        File downloads also use signed URLs:
      </p>
      
      <div className="bg-gray-100 p-4 rounded-md mb-6 overflow-x-auto">
        <pre className="text-sm">
{`// Server-side: Generate download URL
const downloadUrl = await getDownloadUrl(document.filePath);

// Client-side: Download file using the signed URL
window.location.href = downloadUrl;`}
        </pre>
      </div>
      
      <h3 className="text-xl font-bold mt-6 mb-3">File Management</h3>
      <p className="mb-4">
        The S3 integration provides functions for file management:
      </p>
      
      <div className="bg-gray-100 p-4 rounded-md mb-6 overflow-x-auto">
        <pre className="text-sm">
{`// Check if a file exists
const exists = await fileExists(filePath);

// Delete a file
await deleteFile(filePath);

// List files in a directory
const files = await listFiles('documents/legal/');`}
        </pre>
      </div>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Error Handling</h2>
      <p className="mb-4">
        All S3 operations include comprehensive error handling:
      </p>
      <ol className="list-decimal pl-6 mb-4">
        <li className="mb-2">Configuration errors are logged with clear messages</li>
        <li className="mb-2">Operation errors are caught and transformed into user-friendly messages</li>
        <li className="mb-2">Network errors are handled gracefully with appropriate retry mechanisms</li>
      </ol>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Testing</h2>
      <p className="mb-4">
        The S3 integration includes comprehensive tests:
      </p>
      
      <div className="bg-gray-100 p-4 rounded-md mb-6 overflow-x-auto">
        <pre className="text-sm">
{`# Run S3 tests
npm test -- --testPathPattern=s3`}
        </pre>
      </div>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">CORS Configuration</h2>
      <p className="mb-4">
        The S3 bucket should be configured with appropriate CORS settings to allow direct uploads from the client. 
        Here's an example CORS configuration:
      </p>
      
      <div className="bg-gray-100 p-4 rounded-md mb-6 overflow-x-auto">
        <pre className="text-sm">
{`[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]`}
        </pre>
      </div>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Bucket Policy</h2>
      <p className="mb-4">
        The S3 bucket should have a policy that restricts access to authorized users only. 
        Here's an example bucket policy:
      </p>
      
      <div className="bg-gray-100 p-4 rounded-md mb-6 overflow-x-auto">
        <pre className="text-sm">
{`{
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
}`}
        </pre>
      </div>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Conclusion</h2>
      <p className="mb-4">
        The S3 integration provides a secure, efficient, and reliable way to store and retrieve files 
        for the Costa Beach HOA Portal. By following the patterns and practices outlined in this document, 
        developers can ensure that file operations are performed securely and efficiently.
      </p>
    </div>
  );
};

const meta: Meta<typeof S3IntegrationDocs> = {
  title: 'Documentation/S3 Integration',
  component: S3IntegrationDocs,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof S3IntegrationDocs>;

export const Documentation: Story = {}; 