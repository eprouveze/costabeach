"use client";

import React from "react";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";
import { useI18n } from "@/lib/i18n/client";
import { useSearchParams } from "next/navigation";
import { Clock, FileText, Info, Search, CreditCard } from "lucide-react";
import Link from "next/link";

// Mock data types
interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: Date;
  viewCount: number;
  fileType: string;
}

interface Information {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
  viewCount: number;
}

// Mock documents
const mockDocuments: Document[] = [
  {
    id: "1",
    title: "Annual Financial Report 2023",
    description: "Detailed financial report for the year 2023",
    category: "FINANCE",
    createdAt: new Date(2023, 11, 15),
    viewCount: 34,
    fileType: "pdf"
  },
  {
    id: "2",
    title: "Building Maintenance Schedule",
    description: "Schedule of planned maintenance for Q1 2024",
    category: "SOCIETE_DE_GESTION",
    createdAt: new Date(2023, 12, 5),
    viewCount: 27,
    fileType: "xlsx"
  },
  {
    id: "3",
    title: "Residential Rules and Regulations",
    description: "Official rules and regulations for Costa Beach 3 residents",
    category: "LEGAL",
    createdAt: new Date(2023, 10, 22),
    viewCount: 65,
    fileType: "pdf"
  },
  {
    id: "4",
    title: "Meeting Minutes - December 2023",
    description: "Minutes from the homeowners association meeting in December",
    category: "COMITE_DE_SUIVI",
    createdAt: new Date(2023, 12, 20),
    viewCount: 41,
    fileType: "docx"
  },
  {
    id: "5",
    title: "Budget Projection 2024",
    description: "Financial projections and budget allocation for 2024",
    category: "FINANCE",
    createdAt: new Date(2023, 12, 18),
    viewCount: 53,
    fileType: "pdf"
  }
];

// Mock information
const mockInformation: Information[] = [
  {
    id: "1",
    title: "Important Notice: Holiday Schedule",
    content: "The management office will be closed from December 24th to January 2nd. For emergencies, please call the security desk at +212 522 123 456.",
    category: "GENERAL",
    createdAt: new Date(2023, 11, 18),
    viewCount: 87
  },
  {
    id: "2",
    title: "Pool Maintenance Update",
    content: "The pool will be closed for maintenance from January 10-12, 2024. We apologize for any inconvenience.",
    category: "SOCIETE_DE_GESTION",
    createdAt: new Date(2023, 12, 28),
    viewCount: 52
  },
  {
    id: "3",
    title: "New Year's Community Event",
    content: "Join us for a New Year's celebration in the community hall on January 5th, 2024, from 7 PM to 10 PM. Refreshments will be provided. Please RSVP by January 3rd.",
    category: "COMITE_DE_SUIVI",
    createdAt: new Date(2023, 12, 15),
    viewCount: 76
  },
  {
    id: "4",
    title: "Quarterly Fee Update",
    content: "Please note that quarterly maintenance fees will be adjusted by 3% starting January 2024 to account for inflation and increased service costs. The new fee schedule will be distributed next week.",
    category: "FINANCE",
    createdAt: new Date(2023, 12, 22),
    viewCount: 92
  }
];

export default function OwnerDashboardPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  
  const categoryFilter = searchParams.get("category");
  const typeFilter = searchParams.get("type");
  const searchQuery = searchParams.get("search")?.toLowerCase();

  // Filter documents based on params
  const filteredDocuments = mockDocuments.filter(doc => {
    // Apply category filter (skip for ALL category)
    if (categoryFilter && categoryFilter !== "ALL" && doc.category !== categoryFilter) {
      return false;
    }
    
    // Don't show documents if looking at information only
    if (typeFilter === "information") {
      return false;
    }

    // Apply search filter
    if (searchQuery) {
      return (
        doc.title.toLowerCase().includes(searchQuery) ||
        (doc.description && doc.description.toLowerCase().includes(searchQuery))
      );
    }
    
    return true;
  });

  // Filter information based on params
  const filteredInformation = mockInformation.filter(info => {
    // Apply category filter (skip for ALL category)
    if (categoryFilter && categoryFilter !== "ALL" && info.category !== categoryFilter) {
      return false;
    }
    
    // Don't show information if not explicitly looking for it and there's another filter
    if (typeFilter !== "information" && (categoryFilter || searchQuery)) {
      return false;
    }

    // Apply search filter
    if (searchQuery) {
      return (
        info.title.toLowerCase().includes(searchQuery) ||
        info.content.toLowerCase().includes(searchQuery)
      );
    }
    
    return true;
  });

  // Sort everything by date, most recent first
  const allItems = [
    ...filteredDocuments.map(doc => ({ ...doc, type: 'document' as const })),
    ...filteredInformation.map(info => ({ ...info, type: 'information' as const }))
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'FINANCE':
        return <CreditCard className="h-4 w-4 text-green-600 mr-1" />;
      default:
        return null;
    }
  };

  // Determine what to display in the header
  let headerTitle = t("dashboard.welcome");
  let headerDescription = "";

  if (categoryFilter === "ALL") {
    headerTitle = t("documents.categories.all") || "All Documents";
    headerDescription = t("dashboard.allDocumentsDescription") || "View all documents and information";
  } else if (categoryFilter) {
    const categoryName = t(`documents.categories.${categoryFilter.toLowerCase()}`) || categoryFilter;
    headerTitle = categoryName;
    headerDescription = t(`documents.categoryDescriptions.${categoryFilter.toLowerCase()}`) || "";
  } else if (typeFilter === "information") {
    headerTitle = t("common.information") || "Informations";
    headerDescription = t("dashboard.informationDescription") || "Latest updates and announcements for owners";
  } else if (searchQuery) {
    headerTitle = `${t("common.search") || "Search"}: "${searchQuery}"`;
    headerDescription = `${allItems.length} ${t("common.resultsFound") || "results found"}`;
  }

  return (
    <OwnerDashboardTemplate>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">{headerTitle}</h1>
        {headerDescription && (
          <p className="text-sm text-gray-500 mt-1">{headerDescription}</p>
        )}
      </div>

      {/* No results message */}
      {allItems.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery 
              ? t("documents.noSearchResults")?.replace('{{query}}', searchQuery) || `No results found for "${searchQuery}"`
              : typeFilter === "information"
                ? t("dashboard.noInformation") || "No information available"
                : categoryFilter
                  ? t("documents.noDocumentsInCategory") || "No documents in this category"
                  : t("dashboard.noContent") || "No content available"}
          </h3>
          <p className="text-gray-500">
            {searchQuery 
              ? t("documents.tryDifferentSearch") || "Try a different search term or clear the search"
              : t("dashboard.checkBackLater") || "Please check back later for updates"}
          </p>
          {searchQuery && (
            <Link href="/owner-dashboard" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              {t("common.clearSearch") || "Clear search"}
            </Link>
          )}
        </div>
      )}

      {/* Items list */}
      {allItems.length > 0 && (
        <div className="grid gap-4 md:grid-cols-1">
          {allItems.map((item) => (
            <div 
              key={`${item.type}-${item.id}`} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {item.type === 'document' ? (
                      item.category === 'FINANCE' ? (
                        <CreditCard className="h-5 w-5 text-green-600 mr-2" />
                      ) : (
                        <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      )
                    ) : (
                      <Info className="h-5 w-5 text-green-600 mr-2" />
                    )}
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                  </div>
                  
                  {item.type === 'document' && (
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  )}
                  
                  {item.type === 'information' && (
                    <p className="text-sm text-gray-600 mb-3">{item.content}</p>
                  )}
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatDate(item.createdAt)}</span>
                    
                    <span className="mx-2">•</span>
                    
                    <span>{item.viewCount} {t("documents.viewCount") || "views"}</span>
                    
                    {item.type === 'document' && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="uppercase">{item.fileType}</span>
                      </>
                    )}
                  </div>
                </div>
                
                {item.type === 'document' && (
                  <Link
                    href={`/owner-dashboard/documents/${item.id}`}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200"
                  >
                    {t("documents.view") || "View"}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </OwnerDashboardTemplate>
  );
} 