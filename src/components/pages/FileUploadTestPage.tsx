"use client";

import React, { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { FileUploadDemo } from '@/components/ui/file-upload-demo';

export default function FileUploadTestPage() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    console.log('Files uploaded:', newFiles);
  };

  const clearFiles = () => {
    setFiles([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            FileUpload Component Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Test the drag-and-drop file upload functionality with beautiful animations
          </p>
        </div>

        <div className="space-y-12">
          {/* Basic Demo */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
              Basic FileUpload
            </h2>
            <FileUploadDemo />
          </section>

          {/* Interactive Demo */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
              Interactive Demo with State Management
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <FileUpload onChange={handleFileUpload} />
              
              {files.length > 0 && (
                <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-green-800 dark:text-green-300">
                      Uploaded Files ({files.length})
                    </h3>
                    <button
                      onClick={clearFiles}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="grid gap-3">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {file.type || 'Unknown type'}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Multiple Upload Areas */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
              Multiple Upload Areas
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold mb-4 text-purple-800 dark:text-purple-300">
                  Profile Picture Upload
                </h3>
                <FileUpload onChange={(files) => console.log('Profile pic:', files)} />
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold mb-4 text-green-800 dark:text-green-300">
                  Document Upload
                </h3>
                <FileUpload onChange={(files) => console.log('Document:', files)} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 