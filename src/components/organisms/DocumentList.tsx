"use client";

import { Card } from "@/components/molecules/Card";
import { FileText, Download, Eye } from "lucide-react";

interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  dateUploaded: string;
  fileSize: string;
}

interface DocumentListProps {
  documents: Document[];
  onView?: (documentId: string) => void;
  onDownload?: (documentId: string) => void;
}

export function DocumentList({ documents, onView, onDownload }: DocumentListProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <Card key={doc.id} className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{doc.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{doc.description}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <p>Type: {doc.type}</p>
            <p>Uploaded: {doc.dateUploaded}</p>
            <p>Size: {doc.fileSize}</p>
          </div>
          
          <div className="mt-4 flex space-x-2">
            {onView && (
              <button
                onClick={() => onView(doc.id)}
                className="flex items-center space-x-1 text-blue-500 hover:text-blue-600"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
            )}
            {onDownload && (
              <button
                onClick={() => onDownload(doc.id)}
                className="flex items-center space-x-1 text-blue-500 hover:text-blue-600"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
} 