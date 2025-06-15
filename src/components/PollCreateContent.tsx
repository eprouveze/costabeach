"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, X, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import { checkPermission } from "@/lib/utils/permissions";
import { Permission } from "@/lib/types";

interface PollOption {
  id: string;
  text: string;
}

export function PollCreateContent() {
  const { t, locale } = useI18n();
  const { data: session } = useSession();
  const router = useRouter();
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    question: "",
    type: "single_choice" as "single_choice" | "multiple_choice",
    options: [
      { id: "1", text: "" },
      { id: "2", text: "" }
    ] as PollOption[],
    isAnonymous: true,
    requireExplanation: false,
    deadline: "",
    maxChoices: ""
  });

  // Fetch user permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}/permissions`);
          if (response.ok) {
            const data = await response.json();
            setUserPermissions(data.permissions || []);
          }
        } catch (error) {
          console.error("Error fetching user permissions:", error);
        }
      }
    };

    fetchPermissions();
  }, [session]);

  // Check permissions
  const isAdmin = (session?.user as any)?.isAdmin === true;
  const canManageComite = checkPermission(userPermissions, Permission.MANAGE_COMITE_DOCUMENTS);
  const canCreatePolls = isAdmin || canManageComite;

  // Redirect if no permission
  useEffect(() => {
    if (session && !canCreatePolls) {
      toast.error(t("polls.noPermission") || "You don't have permission to create polls");
      router.push(`/${locale}/polls`);
    }
  }, [session, canCreatePolls, router, locale, t]);

  const addOption = () => {
    const newId = (formData.options.length + 1).toString();
    setFormData({
      ...formData,
      options: [...formData.options, { id: newId, text: "" }]
    });
  };

  const removeOption = (id: string) => {
    if (formData.options.length <= 2) {
      toast.error(t("polls.form.minTwoOptions") || "At least 2 options are required");
      return;
    }
    setFormData({
      ...formData,
      options: formData.options.filter(option => option.id !== id)
    });
  };

  const updateOption = (id: string, text: string) => {
    setFormData({
      ...formData,
      options: formData.options.map(option => 
        option.id === id ? { ...option, text } : option
      )
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.question.trim()) {
      toast.error(t("polls.form.questionRequired") || "Poll question is required");
      return;
    }

    const nonEmptyOptions = formData.options.filter(option => option.text.trim());
    if (nonEmptyOptions.length < 2) {
      toast.error(t("polls.form.minTwoOptions") || "At least 2 options are required");
      return;
    }

    // Check for duplicate options
    const optionTexts = nonEmptyOptions.map(option => option.text.trim().toLowerCase());
    if (new Set(optionTexts).size !== optionTexts.length) {
      toast.error(t("polls.form.duplicateOptions") || "Options must be unique");
      return;
    }

    setLoading(true);

    try {
      const pollData = {
        question: formData.question.trim(),
        pollType: formData.type,
        options: nonEmptyOptions.map((option, index) => ({
          optionText: option.text.trim(),
          orderIndex: index
        })),
        isAnonymous: formData.isAnonymous,
        requireExplanation: formData.requireExplanation,
        votingDeadline: formData.deadline || null,
        maxChoices: formData.type === "multiple_choice" && formData.maxChoices 
          ? parseInt(formData.maxChoices) 
          : null
      };

      const response = await fetch("/api/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pollData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create poll");
      }

      toast.success(t("polls.createSuccess") || "Poll created successfully!");
      router.push(`/${locale}/polls`);
    } catch (error) {
      console.error("Error creating poll:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!canCreatePolls) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">{t("common.accessDenied") || "Access Denied"}</p>
        <p>{t("polls.noPermission") || "You don't have permission to create polls"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href={`/${locale}/polls`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common.back") || "Back"}
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("polls.createNew") || "Create New Poll"}
        </h1>
        <p className="text-gray-600">
          {t("polls.createDescription") || "Create a poll to gather community feedback and make decisions together"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6">
        {/* Question */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("polls.form.question") || "Poll Question"} *
          </label>
          <textarea
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder={t("polls.form.questionPlaceholder") || "What would you like to ask the community?"}
            required
          />
        </div>

        {/* Poll Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("polls.form.type") || "Poll Type"}
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="single_choice"
                checked={formData.type === "single_choice"}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="mr-2"
              />
              <span>{t("polls.form.singleChoice") || "Single Choice"}</span>
              <span className="text-sm text-gray-500 ml-2">
                ({t("polls.form.singleChoiceDescription") || "Users can select one option"})
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="multiple_choice"
                checked={formData.type === "multiple_choice"}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="mr-2"
              />
              <span>{t("polls.form.multipleChoice") || "Multiple Choice"}</span>
              <span className="text-sm text-gray-500 ml-2">
                ({t("polls.form.multipleChoiceDescription") || "Users can select multiple options"})
              </span>
            </label>
          </div>
        </div>

        {/* Max Choices for Multiple Choice */}
        {formData.type === "multiple_choice" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("polls.form.maxChoices") || "Maximum Choices (optional)"}
            </label>
            <input
              type="number"
              value={formData.maxChoices}
              onChange={(e) => setFormData({ ...formData, maxChoices: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max={formData.options.length}
              placeholder={t("polls.form.maxChoicesPlaceholder") || "Leave empty for unlimited"}
            />
          </div>
        )}

        {/* Options */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("polls.form.options") || "Poll Options"} *
          </label>
          <div className="space-y-3">
            {formData.options.map((option, index) => (
              <div key={option.id} className="flex gap-2">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(option.id, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("polls.form.optionPlaceholder", { number: index + 1 }) || `Option ${index + 1}`}
                  required
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(option.id)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("polls.form.addOption") || "Add Option"}
          </button>
        </div>

        {/* Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t("polls.form.settings") || "Poll Settings"}
          </h3>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                className="mr-2"
              />
              <span>{t("polls.form.anonymousVoting") || "Anonymous voting (recommended)"}</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.requireExplanation}
                onChange={(e) => setFormData({ ...formData, requireExplanation: e.target.checked })}
                className="mr-2"
              />
              <span>{t("polls.form.requireExplanation") || "Require explanation for votes"}</span>
            </label>
          </div>
        </div>

        {/* Deadline */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("polls.form.votingDeadline") || "Voting Deadline (optional)"}
          </label>
          <input
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={new Date().toISOString().slice(0, 16)}
          />
          <p className="text-sm text-gray-500 mt-1">
            {t("polls.form.noDeadlineHint") || "Leave empty for no deadline"}
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                {t("polls.creating") || "Creating..."}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {t("polls.create") || "Create Poll"}
              </>
            )}
          </button>
          
          <Link
            href={`/${locale}/polls`}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            {t("common.cancel") || "Cancel"}
          </Link>
        </div>
      </form>
    </div>
  );
}