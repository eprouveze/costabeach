"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { api } from "@/lib/trpc/react";
import { Document, DocumentCategory, Language } from "@/lib/types";
import { toast } from "react-toastify";
import { X, Save } from "lucide-react";

interface DocumentEditProps {
  document: Document;
  onClose: () => void;
  onSave: () => void;
}

export const DocumentEdit = ({ document, onClose, onSave }: DocumentEditProps) => {
  const { t } = useI18n();
  const [title, setTitle] = useState(document.title);
  const [description, setDescription] = useState(document.description || "");
  const [category, setCategory] = useState<DocumentCategory>(document.category);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateDocumentMutation = api.documents.updateDocument.useMutation({
    onSuccess: () => {
      toast.success(t("documents.updateSuccess"));
      onSave();
    },
    onError: (error) => {
      toast.error(t("documents.updateError"));
      console.error("Error updating document:", error);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    updateDocumentMutation.mutate({
      id: document.id,
      title: title.trim(),
      description: description.trim(),
      category,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("documents.editDocument")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("documents.title")} *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={t("documents.titlePlaceholder")}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("documents.description")}
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                placeholder={t("documents.descriptionPlaceholder")}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("documents.category")} *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {Object.values(DocumentCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`documents.categories.${cat}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2">{t("common.saving")}</span>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t("common.save")}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}; 