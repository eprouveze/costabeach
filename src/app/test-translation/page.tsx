"use client";

import { useState } from "react";
import { EnhancedDocumentCard } from "@/components/EnhancedDocumentCard";
import { DocumentCategory, Language, TranslationQuality, TranslationStatus } from "@/lib/types";

// Mock data for testing
const mockDocument = {
  id: "test-doc-1",
  title: "Rapport Financier 2024",
  description: "Rapport financier annuel de la copropriété Costa Beach 3",
  filePath: "/documents/rapport-financier-2024.pdf",
  fileSize: 2048576, // 2MB
  fileType: "application/pdf",
  category: DocumentCategory.FINANCE,
  language: Language.FRENCH,
  sourceLanguage: Language.FRENCH,
  translationQuality: TranslationQuality.ORIGINAL,
  translationStatus: TranslationStatus.COMPLETED,
  contentExtractable: true,
  originalDocumentId: null,
  isTranslation: false,
  isTranslated: true,
  isPublished: true,
  viewCount: 42,
  downloadCount: 18,
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-15"),
  authorId: "user-1",
  author: { id: "user-1", name: "Admin User" }
};

const mockTranslations = [
  {
    ...mockDocument,
    id: "test-doc-1-en",
    title: "Financial Report 2024",
    description: "Annual financial report of the Costa Beach 3 condominium",
    language: Language.ENGLISH,
    sourceLanguage: Language.FRENCH,
    translationQuality: TranslationQuality.MACHINE,
    translationStatus: TranslationStatus.COMPLETED,
    originalDocumentId: "test-doc-1",
    isTranslation: true,
    viewCount: 15,
    downloadCount: 8,
  },
  {
    ...mockDocument,
    id: "test-doc-1-ar",
    title: "التقرير المالي 2024",
    description: "التقرير المالي السنوي لمجمع كوستا بيتش 3",
    language: Language.ARABIC,
    sourceLanguage: Language.FRENCH,
    translationQuality: TranslationQuality.MACHINE,
    translationStatus: TranslationStatus.PROCESSING,
    originalDocumentId: "test-doc-1",
    isTranslation: true,
    viewCount: 5,
    downloadCount: 2,
  }
];

export default function TestTranslationPage() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Enhanced Document Card Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Original Document with Translations */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Document with Translations
            </h2>
            <EnhancedDocumentCard
              document={mockDocument}
              translations={mockTranslations}
              showActions={true}
              onView={(doc) => console.log("View:", doc)}
              onDownload={(doc) => console.log("Download:", doc)}
            />
          </div>

          {/* Original Document Only */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Original Document Only
            </h2>
            <EnhancedDocumentCard
              document={{
                ...mockDocument,
                id: "test-doc-2",
                title: "Contrat de Syndic",
                description: "Contrat de syndication pour la gestion de l'immeuble",
                isTranslated: false,
              }}
              translations={[]}
              showActions={true}
            />
          </div>

          {/* Document with Pending Translations */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              With Pending Translations
            </h2>
            <EnhancedDocumentCard
              document={{
                ...mockDocument,
                id: "test-doc-3",
                title: "Règlement de Copropriété",
                description: "Règlement intérieur de la copropriété Costa Beach 3",
                category: DocumentCategory.LEGAL,
              }}
              translations={[
                {
                  ...mockTranslations[0],
                  id: "test-doc-3-en",
                  title: "Condominium Regulations",
                  translationStatus: TranslationStatus.PENDING,
                },
                {
                  ...mockTranslations[1], 
                  id: "test-doc-3-ar",
                  title: "لوائح الملكية المشتركة",
                  translationStatus: TranslationStatus.FAILED,
                }
              ]}
              showActions={true}
            />
          </div>
        </div>

        {/* Status Legend */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Translation Status Legend
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-spin"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Failed</span>
            </div>
          </div>
        </div>

        {/* Quality Legend */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Translation Quality Legend
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="text-blue-600">🛡️</div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Original Document</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-yellow-600">⚡</div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Machine Translation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-green-600">✅</div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Human Translation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-purple-600">🌐</div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Hybrid Translation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}