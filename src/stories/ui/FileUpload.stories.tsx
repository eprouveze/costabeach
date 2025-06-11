"use client";

import type { Meta, StoryObj } from '@storybook/react';
import { FileUpload } from '@/components/ui/file-upload';
import { FileUploadDemo } from '@/components/ui/file-upload-demo';
import React, { useState } from 'react';

const meta: Meta<typeof FileUpload> = {
  title: 'UI/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A modern file upload component with drag-and-drop functionality, smooth animations, and beautiful visual feedback.

## Features
- **Drag & Drop**: Intuitive file dropping with visual feedback
- **Click to Upload**: Traditional file picker when clicking the upload area
- **Animated Interactions**: Smooth Framer Motion animations on hover and file selection
- **File Preview**: Shows uploaded file details including name, size, type, and modification date
- **Dark Mode Support**: Fully compatible with dark/light themes
- **TypeScript**: Complete type safety with proper interfaces

## Usage
Perfect for document uploads, image uploads, or any file management interface where you need a modern, user-friendly upload experience.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: {
      action: 'files-changed',
      description: 'Callback function called when files are selected or dropped',
    },
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onChange: (files: File[]) => {
      console.log('Files uploaded:', files);
    },
  },
};

export const WithContainer: Story = {
  render: () => <FileUploadDemo />,
  parameters: {
    docs: {
      description: {
        story: 'FileUpload component wrapped in a styled container with border and background.',
      },
    },
  },
};

export const CustomStyling: Story = {
  render: () => (
    <div className="w-full max-w-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 p-8 rounded-2xl border border-blue-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">
        Upload Your Documents
      </h3>
      <FileUpload onChange={(files) => console.log('Custom upload:', files)} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'FileUpload component with custom container styling and branding.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    
    const handleFileUpload = (files: File[]) => {
      setUploadedFiles(prev => [...prev, ...files]);
      console.log('Files uploaded:', files);
    };

    const clearFiles = () => {
      setUploadedFiles([]);
    };

    return (
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Interactive File Upload Demo</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try dragging files or clicking to upload. Watch the animations and file previews.
          </p>
        </div>
        
        <FileUpload onChange={handleFileUpload} />
        
        {uploadedFiles.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-green-800 dark:text-green-300">
                Uploaded Files ({uploadedFiles.length})
              </h4>
              <button
                onClick={clearFiles}
                className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded border">
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {file.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Interactive demo showing file upload with state management and file tracking.',
      },
    },
  },
};

export const CompactVersion: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <div className="space-y-4">
        <h4 className="font-semibold text-center">Compact Upload</h4>
        <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <FileUpload onChange={(files) => console.log('Compact upload:', files)} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Compact version of the FileUpload component suitable for smaller spaces.',
      },
    },
  },
};

export const MultipleUploads: Story = {
  render: () => (
    <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="font-semibold text-center">Profile Picture</h4>
        <div className="border border-dashed border-purple-300 dark:border-purple-600 rounded-lg bg-purple-50/50 dark:bg-purple-900/10">
          <FileUpload onChange={(files) => console.log('Profile pic:', files)} />
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-semibold text-center">Document Upload</h4>
        <div className="border border-dashed border-green-300 dark:border-green-600 rounded-lg bg-green-50/50 dark:bg-green-900/10">
          <FileUpload onChange={(files) => console.log('Document:', files)} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Multiple FileUpload components for different purposes with distinct styling.',
      },
    },
  },
}; 