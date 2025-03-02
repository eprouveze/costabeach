import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { toast } from 'react-toastify';

// Define the props interface for the DocumentUpload component
interface DocumentUploadProps {
  onUploadComplete: (fileData: { 
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    category: string;
    language: string;
  }) => void;
  maxSizeMB?: number;
  allowedFileTypes?: string[];
  category?: string;
  language?: string;
}

// Mock component to demonstrate document upload functionality
const DocumentUpload = ({
  onUploadComplete,
  maxSizeMB = 10,
  allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  category = 'legal',
  language = 'fr',
}: DocumentUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = (file: File) => {
    // Validate file type
    if (!allowedFileTypes.includes(file.type)) {
      toast.error(`File type not allowed. Allowed types: ${allowedFileTypes.join(', ')}`);
      return;
    }
    
    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large. Maximum size: ${maxSizeMB}MB`);
      return;
    }
    
    setFile(file);
  };
  
  const uploadFile = async () => {
    if (!file) return;
    
    try {
      setUploading(true);
      
      // In a real implementation, this would call the API to get a signed URL
      // const response = await fetch('/api/documents/upload-url', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     fileName: file.name,
      //     fileType: file.type,
      //     category,
      //     language
      //   })
      // });
      
      // const { uploadUrl, filePath } = await response.json();
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would upload the file to S3
      // await fetch(uploadUrl, {
      //   method: 'PUT',
      //   body: file,
      //   headers: { 'Content-Type': file.type }
      // });
      
      setProgress(100);
      
      // Simulate creating document record in database
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('File uploaded successfully!');
      
      if (onUploadComplete) {
        onUploadComplete({
          id: Math.random().toString(36).substring(2, 15),
          title: file.name,
          description: `Uploaded file: ${file.name}`,
          fileUrl: `https://example.com/documents/${category}/${file.name}`,
          fileSize: file.size,
          fileType: file.type,
          category,
          language
        });
      }
      
      // Reset state
      setFile(null);
      setProgress(0);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="mb-4">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            stroke="currentColor" 
            fill="none" 
            viewBox="0 0 48 48" 
            aria-hidden="true"
          >
            <path 
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
              strokeWidth={2} 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          <p className="mt-1 text-sm text-gray-600">
            Drag and drop a file here, or{' '}
            <label className="relative cursor-pointer text-blue-600 hover:text-blue-500">
              <span>browse</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                onChange={handleChange}
                accept={allowedFileTypes.join(',')}
              />
            </label>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {allowedFileTypes.map(type => type.split('/')[1]).join(', ')} up to {maxSizeMB}MB
          </p>
        </div>
      </div>
      
      {file && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium truncate">{file.name}</span>
            <span className="text-xs text-gray-500">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>
          
          {uploading ? (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          ) : (
            <button
              type="button"
              onClick={uploadFile}
              className="w-full mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Upload
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Mock component to demonstrate document upload in a form context
const DocumentUploadForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('legal');
  const [language, setLanguage] = useState('fr');
  const [uploadedFile, setUploadedFile] = useState<{
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    category: string;
    language: string;
  } | null>(null);
  
  const handleUploadComplete = (fileData: {
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    category: string;
    language: string;
  }) => {
    setUploadedFile(fileData);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedFile) {
      toast.error('Please upload a file first');
      return;
    }
    
    // In a real implementation, this would call the API to create a document
    toast.success('Document created successfully!');
    
    // Reset form
    setTitle('');
    setDescription('');
    setCategory('legal');
    setLanguage('fr');
    setUploadedFile(null);
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6">Upload Document</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="legal">Legal</option>
              <option value="financial">Financial</option>
              <option value="meeting">Meeting Minutes</option>
              <option value="announcement">Announcements</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="fr">French</option>
              <option value="ar">Arabic</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document File
          </label>
          <DocumentUpload
            onUploadComplete={handleUploadComplete}
            maxSizeMB={20}
            category={category}
            language={language}
          />
        </div>
        
        {uploadedFile && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              File uploaded: {uploadedFile.title} ({(uploadedFile.fileSize / (1024 * 1024)).toFixed(2)} MB)
            </p>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={!uploadedFile}
          >
            Create Document
          </button>
        </div>
      </form>
    </div>
  );
};

const meta: Meta<typeof DocumentUpload> = {
  title: 'Components/DocumentUpload',
  component: DocumentUpload,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof DocumentUpload>;

export const Basic: Story = {
  args: {
    maxSizeMB: 10,
    allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    category: 'legal',
    language: 'fr',
  },
};

export const WithForm: Story = {
  render: () => <DocumentUploadForm />,
};

export const S3UploadWorkflow = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">S3 Upload Workflow</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          The document upload process uses AWS S3 for secure file storage. The workflow follows a two-step approach:
        </p>
        <ol className="list-decimal pl-6 mb-4">
          <li className="mb-2">The client requests a signed URL from the server</li>
          <li className="mb-2">The client uploads the file directly to S3 using the signed URL</li>
          <li className="mb-2">The server creates a document record in the database</li>
        </ol>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Implementation</h2>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">1. Server-side: Generate Upload URL</h3>
          <div className="bg-gray-100 p-4 rounded-md mb-4 overflow-x-auto">
            <pre className="text-sm">
{`// API route handler
import { getUploadUrl } from '@/lib/s3';

export async function POST(req: Request) {
  const { fileName, fileType, category, language } = await req.json();
  
  // Get the user ID from the session
  const userId = await getUserIdFromSession();
  
  try {
    // Generate a signed URL for uploading
    const { uploadUrl, filePath } = await getUploadUrl(
      userId,
      fileName,
      fileType,
      category,
      language
    );
    
    return Response.json({ uploadUrl, filePath });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return Response.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}`}
            </pre>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">2. Client-side: Upload File to S3</h3>
          <div className="bg-gray-100 p-4 rounded-md mb-4 overflow-x-auto">
            <pre className="text-sm">
{`// Client component
const uploadFile = async (file: File) => {
  // Request a signed URL from the server
  const response = await fetch('/api/documents/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      category,
      language
    })
  });
  
  const { uploadUrl, filePath } = await response.json();
  
  // Upload the file directly to S3
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type }
  });
  
  return { filePath };
}`}
            </pre>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">File Validation</h2>
        <p className="mb-4">
          The document upload component includes comprehensive file validation:
        </p>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">File Type Validation</h3>
          <p className="mb-2">
            Only specific file types are allowed for upload:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>PDF documents (.pdf)</li>
            <li>Microsoft Office documents (.doc, .docx, .xls, .xlsx, .ppt, .pptx)</li>
            <li>Text files (.txt, .csv)</li>
            <li>Images (.jpg, .jpeg, .png)</li>
          </ul>
          <div className="bg-gray-100 p-4 rounded-md mb-4 overflow-x-auto">
            <pre className="text-sm">
{`// File type validation
import { validateFileType } from '@/lib/utils/fileValidation';

const handleFile = (file: File) => {
  // Validate file type
  if (!validateFileType(file)) {
    toast.error('File type not allowed');
    return;
  }
  
  // Continue with upload...
};`}
            </pre>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">File Size Validation</h3>
          <p className="mb-2">
            Files are limited to a maximum size (default: 10MB):
          </p>
          <div className="bg-gray-100 p-4 rounded-md mb-4 overflow-x-auto">
            <pre className="text-sm">
{`// File size validation
import { validateFileSize } from '@/lib/utils/fileValidation';

const handleFile = (file: File) => {
  // Validate file size
  if (!validateFileSize(file, 10)) { // 10MB limit
    toast.error('File too large. Maximum size: 10MB');
    return;
  }
  
  // Continue with upload...
};`}
            </pre>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Error Handling</h2>
        <p className="mb-4">
          The upload process includes comprehensive error handling:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="text-md font-medium mb-2">Client-side Errors</h3>
            <ul className="list-disc pl-6">
              <li>Invalid file type</li>
              <li>File size exceeds limit</li>
              <li>Network errors during upload</li>
              <li>Upload cancellation</li>
              <li>Server response errors</li>
            </ul>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="text-md font-medium mb-2">Server-side Errors</h3>
            <ul className="list-disc pl-6">
              <li>S3 connection issues</li>
              <li>Permission errors</li>
              <li>Invalid file path</li>
              <li>Database errors</li>
              <li>Authentication failures</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Progress Tracking</h2>
        <p className="mb-4">
          The upload component provides real-time progress tracking:
        </p>
        
        <div className="bg-gray-100 p-4 rounded-md mb-4 overflow-x-auto">
          <pre className="text-sm">
{`// Progress tracking with XMLHttpRequest
const uploadFile = async (file: File, uploadUrl: string) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    });
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve();
      } else {
        reject(new Error(\`Upload failed with status \${xhr.status}\`));
      }
    };
    
    xhr.onerror = () => {
      reject(new Error('Upload failed'));
    };
    
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
};`}
          </pre>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Security Considerations</h2>
        <p className="mb-4">
          The S3 upload implementation includes several security measures:
        </p>
        
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">
            <span className="font-medium">Signed URLs:</span> Time-limited, single-use URLs prevent unauthorized uploads
          </li>
          <li className="mb-2">
            <span className="font-medium">Content Type Validation:</span> File types are validated both client-side and server-side
          </li>
          <li className="mb-2">
            <span className="font-medium">File Size Limits:</span> Prevents denial of service through large file uploads
          </li>
          <li className="mb-2">
            <span className="font-medium">Permission Checks:</span> Users can only upload to categories they have permission for
          </li>
          <li className="mb-2">
            <span className="font-medium">CORS Configuration:</span> S3 bucket is configured to only accept uploads from authorized domains
          </li>
        </ul>
      </div>
    </div>
  );
}; 