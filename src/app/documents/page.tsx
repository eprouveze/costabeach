"use client";

import { useState } from "react";
import { DocumentCategory, Language } from "@/lib/types";
import { DocumentList } from "@/components/DocumentList";
import { DocumentUpload } from "@/components/DocumentUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>(DocumentCategory.GENERAL);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | undefined>(undefined);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category as DocumentCategory);
  };
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedLanguage(value ? (value as Language) : undefined);
  };
  
  const handleUploadSuccess = () => {
    setShowUploadForm(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          Documents
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedLanguage || ""}
            onChange={handleLanguageChange}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Languages</option>
            {Object.values(Language).map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {showUploadForm ? "Cancel Upload" : "Upload Document"}
          </button>
        </div>
      </div>
      
      {showUploadForm && (
        <div className="mb-8">
          <DocumentUpload
            onSuccess={handleUploadSuccess}
            defaultCategory={selectedCategory}
            defaultLanguage={selectedLanguage || Language.ENGLISH}
          />
        </div>
      )}
      
      <Tabs
        defaultValue={DocumentCategory.GENERAL}
        value={selectedCategory}
        onValueChange={handleCategoryChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
          <TabsTrigger value={DocumentCategory.GENERAL}>General</TabsTrigger>
          <TabsTrigger value={DocumentCategory.COMITE_DE_SUIVI}>Comité de Suivi</TabsTrigger>
          <TabsTrigger value={DocumentCategory.SOCIETE_DE_GESTION}>Société de Gestion</TabsTrigger>
          <TabsTrigger value={DocumentCategory.LEGAL}>Legal</TabsTrigger>
          <TabsTrigger value={DocumentCategory.FINANCIAL}>Financial</TabsTrigger>
        </TabsList>
        
        <TabsContent value={DocumentCategory.GENERAL}>
          <DocumentList
            category={DocumentCategory.GENERAL}
            language={selectedLanguage}
            limit={10}
          />
        </TabsContent>
        
        <TabsContent value={DocumentCategory.COMITE_DE_SUIVI}>
          <DocumentList
            category={DocumentCategory.COMITE_DE_SUIVI}
            language={selectedLanguage}
            limit={10}
          />
        </TabsContent>
        
        <TabsContent value={DocumentCategory.SOCIETE_DE_GESTION}>
          <DocumentList
            category={DocumentCategory.SOCIETE_DE_GESTION}
            language={selectedLanguage}
            limit={10}
          />
        </TabsContent>
        
        <TabsContent value={DocumentCategory.LEGAL}>
          <DocumentList
            category={DocumentCategory.LEGAL}
            language={selectedLanguage}
            limit={10}
          />
        </TabsContent>
        
        <TabsContent value={DocumentCategory.FINANCIAL}>
          <DocumentList
            category={DocumentCategory.FINANCIAL}
            language={selectedLanguage}
            limit={10}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 