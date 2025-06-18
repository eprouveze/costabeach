"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { api } from "@/lib/trpc/react";
import { InformationStatus, InformationPost } from "@/lib/types";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  Globe,
  FileText,
  Send
} from "lucide-react";
import { toast } from "react-toastify";
import { formatDistanceToNow } from "date-fns";
import { fr, ar, enUS } from "date-fns/locale";

export function AdminInformationPage() {
  const { t, locale } = useI18n();
  const [selectedStatus, setSelectedStatus] = useState<InformationStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<InformationPost | null>(null);

  // Fetch information posts
  const { 
    data: posts = [], 
    isLoading, 
    refetch 
  } = api.information.getAllPosts.useQuery({
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  });

  // Mutations
  const createPostMutation = api.information.createPost.useMutation({
    onSuccess: () => {
      toast.success(t("information.postCreated") || "Information post created successfully");
      refetch();
      setShowCreateModal(false);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const publishPostMutation = api.information.publishPost.useMutation({
    onSuccess: () => {
      toast.success(t("information.postPublished") || "Information post published successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const deletePostMutation = api.information.deletePost.useMutation({
    onSuccess: () => {
      toast.success(t("information.postDeleted") || "Information post deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Format date for display
  const formatDate = (date: Date) => {
    const dateLocale = locale === "fr" ? fr : locale === "ar" ? ar : enUS;
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true,
      locale: dateLocale
    });
  };

  const getStatusBadge = (status: InformationStatus, isPublished: boolean) => {
    if (isPublished) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          {t("information.published") || "Published"}
        </span>
      );
    }
    
    switch (status) {
      case InformationStatus.DRAFT:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {t("information.draft") || "Draft"}
          </span>
        );
      case InformationStatus.ARCHIVED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            {t("information.archived") || "Archived"}
          </span>
        );
      default:
        return null;
    }
  };

  const handlePublish = (postId: string) => {
    publishPostMutation.mutate({ id: postId });
  };

  const handleDelete = (postId: string) => {
    if (confirm(t("information.confirmDelete") || "Are you sure you want to delete this post?")) {
      deletePostMutation.mutate({ id: postId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("information.management") || "Information Management"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("information.managementDescription") || "Create and manage information posts and announcements"}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("information.createPost") || "Create Post"}
        </button>
      </div>

      {/* Status Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("information.filterByStatus") || "Filter by status:"}
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as InformationStatus | 'all')}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t("information.allStatuses") || "All Statuses"}</option>
            <option value={InformationStatus.DRAFT}>{t("information.draft") || "Draft"}</option>
            <option value={InformationStatus.PUBLISHED}>{t("information.published") || "Published"}</option>
            <option value={InformationStatus.ARCHIVED}>{t("information.archived") || "Archived"}</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t("information.noPosts") || "No information posts"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t("information.noPostsDescription") || "Get started by creating your first information post."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("information.title") || "Title"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("information.status") || "Status"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("information.author") || "Author"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("information.created") || "Created"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("information.translations") || "Translations"}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("common.actions") || "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {post.title}
                        </div>
                        {post.excerpt && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {post.excerpt}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(post.status as InformationStatus, post.isPublished)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {(post as any).creator?.name || t("common.unknown") || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {(post as any).translations?.length || 0} {t("information.languages") || "languages"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {!post.isPublished && post.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(post.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title={t("information.publish") || "Publish"}
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setEditingPost(post as any)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title={t("common.edit") || "Edit"}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title={t("common.delete") || "Delete"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingPost) && (
        <InformationPostModal
          isOpen={showCreateModal || !!editingPost}
          onClose={() => {
            setShowCreateModal(false);
            setEditingPost(null);
          }}
          post={editingPost}
          onSuccess={() => {
            refetch();
            setShowCreateModal(false);
            setEditingPost(null);
          }}
        />
      )}
    </div>
  );
}

// Modal component for creating/editing information posts
interface InformationPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: InformationPost | null;
  onSuccess: () => void;
}

function InformationPostModal({ isOpen, onClose, post, onSuccess }: InformationPostModalProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [publishNow, setPublishNow] = useState(false);

  const createPostMutation = api.information.createPost.useMutation({
    onSuccess: () => {
      toast.success(t("information.postCreated") || "Information post created successfully");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const updatePostMutation = api.information.updatePost.useMutation({
    onSuccess: () => {
      toast.success(t("information.postUpdated") || "Information post updated successfully");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error(t("information.fillRequiredFields") || "Please fill in all required fields");
      return;
    }

    if (post) {
      // Update existing post
      updatePostMutation.mutate({
        id: post.id,
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
      });
    } else {
      // Create new post
      createPostMutation.mutate({
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
        publishNow,
        status: publishNow ? InformationStatus.PUBLISHED : InformationStatus.DRAFT,
      });
    }
  };

  const isLoading = createPostMutation.isPending || updatePostMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {post ? 
              (t("information.editPost") || "Edit Information Post") : 
              (t("information.createPost") || "Create Information Post")
            }
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <span className="sr-only">Close</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("information.title") || "Title"} *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={t("information.titlePlaceholder") || "Enter the post title"}
              required
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("information.excerpt") || "Excerpt"}
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={t("information.excerptPlaceholder") || "Brief summary for previews (optional)"}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("information.content") || "Content"} *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={t("information.contentPlaceholder") || "Write the full content of your information post..."}
              required
            />
          </div>

          {!post && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="publishNow"
                checked={publishNow}
                onChange={(e) => setPublishNow(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="publishNow" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {t("information.publishImmediately") || "Publish immediately"}
              </label>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t("common.cancel") || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {t("common.saving") || "Saving..."}
                </div>
              ) : (
                post ? 
                  (t("common.update") || "Update") : 
                  (publishNow ? (t("information.publishPost") || "Publish Post") : (t("information.saveDraft") || "Save Draft"))
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}