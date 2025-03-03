"use client";

import React, { useEffect, useState } from "react";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";
import { useI18n } from "@/lib/i18n/client";
import { useSearchParams } from "next/navigation";
import { Clock, FileText, Info, Search, CreditCard, Book, GavelIcon, BookOpen } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";

// Document types
interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: Date;
  viewCount: number;
  fileType: string;
  filePath?: string;
}

interface Information {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
  viewCount: number;
}

// Mock information - we'll keep this for now while we implement real documents
const mockInformation: Information[] = [
  // Various information entries...
  // General Information
  {
    id: "1",
    title: "Important Notice: Holiday Schedule",
    content: "The management office will be closed from December 24th to January 2nd. For emergencies, please call the security desk at +212 522 123 456. Regular office hours will resume on January 3rd, 2024.",
    category: "GENERAL",
    createdAt: new Date(2023, 11, 18),
    viewCount: 87
  },
  {
    id: "5",
    title: "New Security System Installation",
    content: "A new security system is being installed at all entrance points starting next week. All residents will receive new access cards by mail. The installation will take approximately 3 days and should not cause any disruption to normal access.",
    category: "GENERAL",
    createdAt: new Date(2024, 2, 25),
    viewCount: 64
  },
  {
    id: "9",
    title: "Community Website Update",
    content: "The community website has been updated with new features including an improved document search and a community forum. Please visit the website to explore the new features and update your profile information.",
    category: "GENERAL",
    createdAt: new Date(2024, 3, 5),
    viewCount: 42
  },
  
  // Management Company Information
  {
    id: "2",
    title: "Pool Maintenance Update",
    content: "The pool will be closed for maintenance from January 10-12, 2024. We apologize for any inconvenience. During this time, the pool pump system will be upgraded and the tiles will be deep cleaned. The pool deck will also be resealed.",
    category: "SOCIETE_DE_GESTION",
    createdAt: new Date(2023, 12, 28),
    viewCount: 52
  },
  {
    id: "6",
    title: "Elevator Maintenance Schedule",
    content: "The elevators in Building A will undergo routine maintenance on April 15th from 9:00 AM to 12:00 PM. During this time, please use the service elevator or stairwells. Technicians will ensure minimal disruption to residents.",
    category: "SOCIETE_DE_GESTION",
    createdAt: new Date(2024, 3, 10),
    viewCount: 38
  },
  {
    id: "10",
    title: "Garden Landscaping Project",
    content: "Starting May 5th, we will begin a landscaping improvement project in the main garden area. The project will include new plantings, improved irrigation, and the addition of more seating areas. The work will last approximately two weeks.",
    category: "SOCIETE_DE_GESTION",
    createdAt: new Date(2024, 4, 1),
    viewCount: 29
  },
  
  // Committee Information
  {
    id: "3",
    title: "New Year's Community Event",
    content: "Join us for a New Year's celebration in the community hall on January 5th, 2024, from 7 PM to 10 PM. Refreshments will be provided. Please RSVP by January 3rd. There will be music, games, and a special toast at 9 PM to celebrate the community's achievements in 2023.",
    category: "COMITE_DE_SUIVI",
    createdAt: new Date(2023, 12, 15),
    viewCount: 76
  },
  {
    id: "7",
    title: "Community Survey Results",
    content: "The results of our annual community survey are now available. Overall satisfaction rate has increased to 92%. The main areas of improvement identified were the gym facilities and guest parking. The committee is preparing action plans to address these areas.",
    category: "COMITE_DE_SUIVI",
    createdAt: new Date(2024, 2, 20),
    viewCount: 55
  },
  {
    id: "11",
    title: "Call for Volunteers: Community Garden",
    content: "The committee is looking for volunteers to help maintain the new community garden area. If you have experience with gardening or would simply like to contribute, please contact the committee secretary. A planning meeting will be held on May 15th.",
    category: "COMITE_DE_SUIVI",
    createdAt: new Date(2024, 4, 5),
    viewCount: 31
  },
  
  // Financial Information
  {
    id: "4",
    title: "Quarterly Fee Update",
    content: "Please note that quarterly maintenance fees will be adjusted by 3% starting January 2024 to account for inflation and increased service costs. The new fee schedule will be distributed next week. All payment methods remain the same, including bank transfer and direct debit options.",
    category: "FINANCE",
    createdAt: new Date(2023, 12, 22),
    viewCount: 92
  },
  {
    id: "8",
    title: "Annual Audit Completion",
    content: "The annual financial audit has been completed and the association's finances are in good standing. The full audit report is available in the Financial Documents section. A summary presentation will be given at the next general meeting on April 25th.",
    category: "FINANCE",
    createdAt: new Date(2024, 3, 15),
    viewCount: 63
  },
  {
    id: "12",
    title: "Special Assessment for Roof Repairs",
    content: "Following the inspection report, the board has approved a special assessment for necessary roof repairs on Buildings B and C. The assessment will be $500 per unit, payable in two installments in June and September. A detailed breakdown of costs is available upon request.",
    category: "FINANCE",
    createdAt: new Date(2024, 4, 10),
    viewCount: 78
  },
  
  // Legal Information
  {
    id: "13",
    title: "Updated Parking Regulations",
    content: "The board has approved updated parking regulations effective June 1st. Changes include a new visitor parking permit system and designated spots for electric vehicles. All residents must register their vehicles with the management office by May 15th.",
    category: "LEGAL",
    createdAt: new Date(2024, 4, 8),
    viewCount: 45
  },
  {
    id: "14",
    title: "Short-term Rental Policy Reminder",
    content: "We would like to remind all owners that according to the community bylaws, short-term rentals (less than 30 days) are not permitted. The board will be increasing enforcement of this policy starting in July, with fines for violations as outlined in the bylaws.",
    category: "LEGAL",
    createdAt: new Date(2024, 5, 1),
    viewCount: 67
  }
];

export default function OwnerDashboardPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  
  const categoryFilter = searchParams.get("category");
  const typeFilter = searchParams.get("type");
  const searchQuery = searchParams.get("search")?.toLowerCase();

  // Add state for documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch documents from the database
  useEffect(() => {
    async function fetchDocuments() {
      try {
        // Fetch documents from the database
        const response = await fetch('/api/documents');
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error('Error fetching documents:', error);
        // If there's an error, use the mock documents as fallback
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, []);

  // Filter documents based on params
  const filteredDocuments = documents.filter(doc => {
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
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'FINANCE':
        return <CreditCard className="h-5 w-5 text-green-600 mr-2" />;
      case 'LEGAL':
        return <GavelIcon className="h-5 w-5 text-purple-600 mr-2" />;
      case 'COMITE_DE_SUIVI':
        return <Book className="h-5 w-5 text-blue-600 mr-2" />;
      case 'SOCIETE_DE_GESTION':
        return <BookOpen className="h-5 w-5 text-amber-600 mr-2" />;
      default:
        return <FileText className="h-5 w-5 text-blue-600 mr-2" />;
    }
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    return t(`documents.categories.${category.toLowerCase()}`) || category;
  };

  // Determine what to display in the header
  let headerTitle = t("dashboard.welcome");
  let headerDescription = "";

  if (categoryFilter === "ALL") {
    headerTitle = t("documents.categories.all") || "All Documents";
    headerDescription = t("dashboard.allDocumentsDescription") || "View all documents and information across all categories";
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
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">{headerTitle}</h1>
        {headerDescription && (
          <p className="text-sm text-gray-500 mt-1">{headerDescription}</p>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h3 className="text-lg font-medium text-gray-900 mt-4">
            {t("common.loading") || "Loading..."}
          </h3>
        </div>
      )}

      {/* No results message */}
      {!loading && allItems.length === 0 && (
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
      {!loading && allItems.length > 0 && (
        <div className="grid gap-5">
          {allItems.map((item) => (
            <div 
              key={`${item.type}-${item.id}`} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    {item.type === 'document' 
                      ? getCategoryIcon(item.category)
                      : <Info className="h-5 w-5 text-green-600 mr-2" />
                    }
                    <h3 className="font-medium text-lg text-gray-900">{item.title}</h3>
                  </div>
                  
                  {item.type === 'document' && (
                    <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                  )}
                  
                  {item.type === 'information' && (
                    <p className="text-sm text-gray-600 mb-4">{item.content}</p>
                  )}
                  
                  <div className="flex items-center flex-wrap text-xs text-gray-500">
                    <div className="flex items-center mr-4 mb-1">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center mr-4 mb-1">
                      <span>{item.viewCount} {t("documents.viewCount") || "views"}</span>
                    </div>
                    
                    {/* Show category badge */}
                    <div className="flex items-center mb-1">
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-xs">
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>
                    
                    {item.type === 'document' && (
                      <div className="flex items-center ml-4 mb-1">
                        <span className="uppercase">{item.fileType}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {item.type === 'document' && (
                  <Link
                    href={`/api/documents/${item.id}/download`}
                    target="_blank"
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
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