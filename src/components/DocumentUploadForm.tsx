"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { api } from "@/lib/trpc/react";
import { DocumentCategory, Language } from "@/lib/types";
import { FileUpload } from "./ui/file-upload";
import { toast } from "react-toastify";
import { X, Upload, Loader2 } from "lucide-react";

interface DocumentUploadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export function DocumentUploadForm({ isOpen, onClose, onUploadSuccess }: DocumentUploadFormProps) {
  const { t, locale } = useI18n();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<DocumentCategory>(DocumentCategory.GENERAL);
  const [language, setLanguage] = useState<Language>(
    locale === "fr" ? Language.FRENCH :
    locale === "ar" ? Language.ARABIC :
    Language.ENGLISH
  );
  const [isUploading, setIsUploading] = useState(false);

  const getUploadUrl = api.documents.getUploadUrl.useMutation();
  const createDocument = api.documents.createDocument.useMutation();

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
    if (files.length > 0 && !title) {
      // Auto-fill title from filename
      const fileName = files[0].name;
      const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      setTitle(nameWithoutExtension);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      toast.error(t("documents.noFileSelected") || "Please select a file");
      return;
    }

    if (!title.trim()) {
      toast.error(t("documents.titleRequired") || "Please enter a title");
      return;
    }

    const file = selectedFiles[0];
    setIsUploading(true);

    try {
      // Step 1: Get upload URL
      const { uploadUrl, filePath } = await getUploadUrl.mutateAsync({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        category,
        language,
      });

      // Step 2: Upload file to S3
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      // Step 3: Create document record
      await createDocument.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        filePath,
        fileSize: file.size,
        fileType: file.type,
        category,
        language,
        isPublished: true,
      });

      toast.success(t("documents.uploadSuccess") || "Document uploaded successfully!");
      
      // Reset form
      setSelectedFiles([]);
      setTitle("");
      setDescription("");
      setCategory(DocumentCategory.GENERAL);
      
      onUploadSuccess();
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : t("documents.uploadError") || "Failed to upload document"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const getCategoryLabel = (cat: DocumentCategory) => {
    switch (cat) {
      case DocumentCategory.COMITE_DE_SUIVI:
        return t("documents.categories.comiteDeSuivi");
      case DocumentCategory.SOCIETE_DE_GESTION:
        return t("documents.categories.societeDeGestion");
      case DocumentCategory.LEGAL:
        return t("documents.categories.legal");
      case DocumentCategory.FINANCE:
        return t("documents.categories.finance");
      case DocumentCategory.GENERAL:
        return t("documents.categories.general");
      default:
        return cat;
    }
  };

  const getLanguageLabel = (lang: Language) => {
    switch (lang) {
      case Language.FRENCH:
        return t("languages.french");
      case Language.ARABIC:
        return t("languages.arabic");
      case Language.ENGLISH:
        return t("languages.english");
      default:
        return lang;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t("documents.uploadDocument")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isUploading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("documents.selectFile") || "Select File"}
            </label>
            <FileUpload onChange={handleFilesChange} />
            {selectedFiles.length > 0 && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t("documents.selectedFile") || "Selected"}: {selectedFiles[0].name}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("documents.title")} *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={t("documents.titlePlaceholder") || "Enter document title..."}
              required
              disabled={isUploading}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("documents.description")}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={t("documents.descriptionPlaceholder") || "Enter description..."}
              disabled={isUploading}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("documents.category")} *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
              disabled={isUploading}
            >
              {Object.values(DocumentCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("documents.language")} *
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
              disabled={isUploading}
            >
              {Object.values(Language).map((lang) => (
                <option key={lang} value={lang}>
                  {getLanguageLabel(lang)}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md"
              disabled={isUploading}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isUploading || selectedFiles.length === 0 || !title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md flex items-center"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("documents.uploading") || "Uploading..."}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {t("documents.upload")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}