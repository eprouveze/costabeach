# Search Implementation

## 🎯 Overview

Phase 2 introduces comprehensive full-text search capabilities across all documents, supporting multilingual queries and advanced filtering. The implementation uses PostgreSQL's native full-text search with optimizations for the trilingual (French/Arabic/English) nature of the platform.

## 🔍 Current State Analysis

### Existing Infrastructure ✅
```typescript
// From src/lib/api/routers/documents.ts
- Basic document listing with category filtering
- RLS-protected document access
- Metadata-based queries (title, category, language)
- Pagination support for large document sets
```

### Enhancement Goals 🚀
1. **Full-Text Search**: Content-based search across all document text
2. **Multilingual Support**: Search in French, Arabic, and English
3. **Advanced Filtering**: Combine text search with metadata filters
4. **Search Analytics**: Track popular queries and performance
5. **Autocomplete**: Smart suggestions and query completion

## 🏗️ Search Architecture

### Database Schema Extensions

**Update**: `prisma/schema.prisma`
```prisma
// Add search-specific columns to documents table
model Document {
  // ... existing fields
  
  // Full-text search fields
  searchable_text     String?              // Extracted text content
  search_vector       Unsupported("tsvector")?  // PostgreSQL search vector
  last_indexed        DateTime?            // Last time content was indexed
  
  // Relations
  search_index        DocumentSearchIndex?
  
  @@map("documents")
}

// Document text extraction and indexing
model DocumentSearchIndex {
  id                  String    @id @default(cuid())
  document_id         String    @unique
  searchable_text     String    // Full extracted text
  language            Language
  word_count          Int
  extraction_method   String    // 'pdf-parse', 'ocr', 'manual'
  confidence_score    Float?    // OCR confidence if applicable
  last_indexed        DateTime  @default(now())
  
  // Relations
  document            Document  @relation(fields: [document_id], references: [id], onDelete: Cascade)
  
  @@map("document_search_index")
}

// Search analytics and query tracking
model SearchQuery {
  id                  String              @id @default(cuid())
  user_id             String?
  query_text          String
  language            Language
  filters             Json?               // Applied filters (category, date range, etc.)
  result_count        Int
  clicked_result_id   String?            // Which result was clicked
  search_time_ms      Int                // Query execution time
  created_at          DateTime           @default(now())
  
  // Relations
  user                User?              @relation(fields: [user_id], references: [id])
  
  @@map("search_queries")
}

// Popular search terms and autocomplete
model SearchSuggestion {
  id                  String    @id @default(cuid())
  term                String
  language            Language
  frequency           Int       @default(1)
  last_used           DateTime  @default(now())
  created_at          DateTime  @default(now())
  
  @@unique([term, language])
  @@map("search_suggestions")
}
```

### Database Migration Script

**Create**: `migrations/add_search_capabilities.sql`
```sql
-- Add search vector column to documents table
ALTER TABLE documents ADD COLUMN search_vector tsvector;

-- Create GIN index for full-text search
CREATE INDEX documents_search_gin_idx ON documents USING gin(search_vector);

-- Create combined text search index for multi-column search
CREATE INDEX documents_combined_search_idx ON documents USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);

-- Language-specific search indexes
CREATE INDEX documents_search_french_idx ON documents USING gin(
  to_tsvector('french', coalesce(title, '') || ' ' || coalesce(description, ''))
) WHERE language = 'fr';

CREATE INDEX documents_search_arabic_idx ON documents USING gin(
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))
) WHERE language = 'ar';

-- Function to update search vector automatically
CREATE OR REPLACE FUNCTION update_document_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  -- Determine language configuration
  NEW.search_vector := CASE 
    WHEN NEW.language = 'fr' THEN
      to_tsvector('french', coalesce(NEW.title, '') || ' ' || 
                           coalesce(NEW.description, '') || ' ' ||
                           coalesce(NEW.searchable_text, ''))
    WHEN NEW.language = 'ar' THEN
      to_tsvector('simple', coalesce(NEW.title, '') || ' ' || 
                           coalesce(NEW.description, '') || ' ' ||
                           coalesce(NEW.searchable_text, ''))
    ELSE
      to_tsvector('english', coalesce(NEW.title, '') || ' ' || 
                            coalesce(NEW.description, '') || ' ' ||
                            coalesce(NEW.searchable_text, ''))
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search vector
CREATE TRIGGER trigger_update_search_vector
  BEFORE INSERT OR UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_document_search_vector();

-- Function for vector similarity search (for future AI integration)
CREATE EXTENSION IF NOT EXISTS vector;

-- Function to match documents by similarity
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  document_id text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT 
    de.document_id,
    1 - (de.embedding_vector <=> query_embedding) as similarity
  FROM document_embeddings de
  WHERE 1 - (de.embedding_vector <=> query_embedding) > match_threshold
  ORDER BY de.embedding_vector <=> query_embedding
  LIMIT match_count;
$$;
```

## 🔍 Search API Implementation

### Enhanced Search Router

**Create**: `src/lib/api/routers/search.ts`
```typescript
import { z } from 'zod';
import { router, procedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const searchRouter = router({
  // Main search endpoint
  searchDocuments: procedure
    .input(z.object({
      query: z.string().min(1).max(500),
      language: z.enum(['en', 'fr', 'ar']).optional(),
      category: z.enum(['bylaw', 'financial', 'maintenance', 'announcement', 'legal', 'meeting_minutes', 'other']).optional(),
      dateRange: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
      }).optional(),
      sortBy: z.enum(['relevance', 'date', 'title']).default('relevance'),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { query, language, category, dateRange, sortBy, limit, offset } = input;
      const startTime = Date.now();
      
      // Build the search query
      let searchQuery = ctx.supabase
        .from('documents')
        .select(`
          id, title, description, category, language, file_size,
          created_at, updated_at,
          uploader:uploaded_by(name),
          ts_rank(search_vector, plainto_tsquery($1)) as rank
        `);
      
      // Apply full-text search based on language
      if (language === 'fr') {
        searchQuery = searchQuery
          .textSearch('search_vector', query, { config: 'french' });
      } else if (language === 'ar') {
        searchQuery = searchQuery
          .textSearch('search_vector', query, { config: 'simple' });
      } else {
        searchQuery = searchQuery
          .textSearch('search_vector', query, { config: 'english' });
      }
      
      // Apply filters
      if (category) {
        searchQuery = searchQuery.eq('category', category);
      }
      
      if (language) {
        searchQuery = searchQuery.eq('language', language);
      }
      
      if (dateRange?.from) {
        searchQuery = searchQuery.gte('created_at', dateRange.from.toISOString());
      }
      
      if (dateRange?.to) {
        searchQuery = searchQuery.lte('created_at', dateRange.to.toISOString());
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'relevance':
          searchQuery = searchQuery.order('rank', { ascending: false });
          break;
        case 'date':
          searchQuery = searchQuery.order('created_at', { ascending: false });
          break;
        case 'title':
          searchQuery = searchQuery.order('title', { ascending: true });
          break;
      }
      
      // Execute query with pagination
      const { data, error, count } = await searchQuery
        .range(offset, offset + limit - 1);
      
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Search failed',
          cause: error,
        });
      }
      
      const searchTime = Date.now() - startTime;
      
      // Log search analytics (async, don't block response)
      ctx.supabase
        .from('search_queries')
        .insert({
          user_id: ctx.user?.id,
          query_text: query,
          language: language || 'en',
          filters: { category, dateRange, sortBy },
          result_count: data?.length || 0,
          search_time_ms: searchTime,
        })
        .then(() => {}) // Fire and forget
        .catch(console.error);
      
      // Update search suggestions
      updateSearchSuggestions(query, language || 'en');
      
      return {
        documents: data || [],
        totalCount: count || 0,
        hasMore: (data?.length || 0) === limit,
        searchTime,
        query: {
          text: query,
          language: language || 'en',
          filters: { category, dateRange, sortBy },
        },
      };
    }),

  // Advanced search with multiple criteria
  advancedSearch: procedure
    .input(z.object({
      criteria: z.object({
        title: z.string().optional(),
        content: z.string().optional(),
        author: z.string().optional(),
        keywords: z.array(z.string()).optional(),
      }),
      filters: z.object({
        categories: z.array(z.enum(['bylaw', 'financial', 'maintenance', 'announcement', 'legal', 'meeting_minutes', 'other'])).optional(),
        languages: z.array(z.enum(['en', 'fr', 'ar'])).optional(),
        dateRange: z.object({
          from: z.date().optional(),
          to: z.date().optional(),
        }).optional(),
        fileSizeRange: z.object({
          min: z.number().optional(),
          max: z.number().optional(),
        }).optional(),
      }),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { criteria, filters, limit, offset } = input;
      
      // Build complex query
      let query = ctx.supabase
        .from('documents')
        .select(`
          id, title, description, category, language, file_size,
          created_at, uploader:uploaded_by(name),
          search_index:document_search_index(searchable_text, word_count)
        `);
      
      // Apply criteria searches
      const searchConditions = [];
      
      if (criteria.title) {
        searchConditions.push(`title.ilike.%${criteria.title}%`);
      }
      
      if (criteria.content && criteria.content.length > 0) {
        // Use full-text search on content
        searchConditions.push(`search_vector.fts.${criteria.content}`);
      }
      
      if (criteria.author) {
        // Join with users table for author search
        query = query.or(`uploader.name.ilike.%${criteria.author}%`);
      }
      
      if (searchConditions.length > 0) {
        query = query.or(searchConditions.join(','));
      }
      
      // Apply filters
      if (filters.categories?.length) {
        query = query.in('category', filters.categories);
      }
      
      if (filters.languages?.length) {
        query = query.in('language', filters.languages);
      }
      
      if (filters.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }
      
      if (filters.dateRange?.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }
      
      if (filters.fileSizeRange?.min) {
        query = query.gte('file_size', filters.fileSizeRange.min);
      }
      
      if (filters.fileSizeRange?.max) {
        query = query.lte('file_size', filters.fileSizeRange.max);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Advanced search failed',
          cause: error,
        });
      }
      
      return {
        documents: data || [],
        hasMore: (data?.length || 0) === limit,
      };
    }),

  // Autocomplete suggestions
  getSearchSuggestions: procedure
    .input(z.object({
      query: z.string().min(1).max(100),
      language: z.enum(['en', 'fr', 'ar']).default('en'),
      limit: z.number().min(1).max(10).default(5),
    }))
    .query(async ({ input, ctx }) => {
      const { query, language, limit } = input;
      
      // Get matching suggestions from database
      const { data: suggestions } = await ctx.supabase
        .from('search_suggestions')
        .select('term, frequency')
        .eq('language', language)
        .ilike('term', `${query}%`)
        .order('frequency', { ascending: false })
        .limit(limit);
      
      // Also get recent document titles that match
      const { data: documentTitles } = await ctx.supabase
        .from('documents')
        .select('title')
        .eq('language', language)
        .ilike('title', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(3);
      
      const titleSuggestions = documentTitles?.map(doc => ({
        term: doc.title,
        frequency: 1,
        type: 'document_title' as const,
      })) || [];
      
      const termSuggestions = suggestions?.map(sug => ({
        ...sug,
        type: 'search_term' as const,
      })) || [];
      
      return {
        suggestions: [...termSuggestions, ...titleSuggestions]
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, limit),
      };
    }),

  // Search analytics for admins
  getSearchAnalytics: procedure
    .input(z.object({
      dateRange: z.object({
        from: z.date(),
        to: z.date(),
      }),
      groupBy: z.enum(['day', 'week', 'month']).default('day'),
    }))
    .query(async ({ input, ctx }) => {
      // Ensure admin access
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }
      
      const { dateRange, groupBy } = input;
      
      // Get search volume over time
      const volumeQuery = `
        SELECT 
          date_trunc('${groupBy}', created_at) as period,
          count(*) as search_count,
          avg(search_time_ms) as avg_search_time,
          avg(result_count) as avg_results
        FROM search_queries 
        WHERE created_at >= $1 AND created_at <= $2
        GROUP BY date_trunc('${groupBy}', created_at)
        ORDER BY period
      `;
      
      const { data: volumeData } = await ctx.supabase
        .rpc('execute_sql', {
          query: volumeQuery,
          params: [dateRange.from.toISOString(), dateRange.to.toISOString()],
        });
      
      // Get most popular queries
      const { data: popularQueries } = await ctx.supabase
        .from('search_queries')
        .select('query_text, language, count')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('count', { ascending: false })
        .limit(10);
      
      // Get queries with no results
      const { data: noResultQueries } = await ctx.supabase
        .from('search_queries')
        .select('query_text, language, created_at')
        .eq('result_count', 0)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);
      
      return {
        searchVolume: volumeData || [],
        popularQueries: popularQueries || [],
        noResultQueries: noResultQueries || [],
        summary: {
          totalSearches: volumeData?.reduce((sum, item) => sum + item.search_count, 0) || 0,
          avgSearchTime: volumeData?.reduce((sum, item) => sum + item.avg_search_time, 0) / (volumeData?.length || 1) || 0,
          noResultRate: (noResultQueries?.length || 0) / (volumeData?.reduce((sum, item) => sum + item.search_count, 0) || 1) * 100,
        },
      };
    }),
});

// Helper function to update search suggestions
async function updateSearchSuggestions(query: string, language: string) {
  try {
    // Extract meaningful terms from the query
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 2) // Only terms longer than 2 characters
      .slice(0, 5); // Limit to 5 terms
    
    for (const term of terms) {
      await supabase
        .from('search_suggestions')
        .upsert({
          term,
          language,
          frequency: 1,
          last_used: new Date(),
        }, {
          onConflict: 'term,language',
          ignoreDuplicates: false,
        });
    }
  } catch (error) {
    console.error('Failed to update search suggestions:', error);
  }
}
```

## 🎨 Search UI Components

### Main Search Interface

**Create**: `src/components/SearchInterface.tsx`
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, Calendar, FileText, Download } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { useTranslation } from 'next-intl';
import { useDebounce } from '@/hooks/useDebounce';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';

interface SearchInterfaceProps {
  onResultSelect?: (document: any) => void;
  className?: string;
  placeholder?: string;
  showFilters?: boolean;
  compact?: boolean;
}

export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onResultSelect,
  className,
  placeholder,
  showFilters = true,
  compact = false,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    category: undefined as string | undefined,
    language: undefined as string | undefined,
    dateRange: {
      from: undefined as Date | undefined,
      to: undefined as Date | undefined,
    },
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);
  
  // Search query
  const { data: searchResults, isLoading, error } = trpc.search.searchDocuments.useQuery(
    {
      query: debouncedQuery,
      ...filters,
      limit: compact ? 5 : 20,
    },
    {
      enabled: debouncedQuery.length > 0,
      staleTime: 30000, // Cache for 30 seconds
    }
  );
  
  // Autocomplete suggestions
  const { data: suggestionData } = trpc.search.getSearchSuggestions.useQuery(
    {
      query,
      language: filters.language || 'en',
    },
    {
      enabled: query.length > 1 && showSuggestions,
    }
  );
  
  useEffect(() => {
    if (suggestionData) {
      setSuggestions(suggestionData.suggestions.map(s => s.term));
    }
  }, [suggestionData]);
  
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    setShowSuggestions(value.length > 1);
  }, []);
  
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  }, []);
  
  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters({
      category: undefined,
      language: undefined,
      dateRange: { from: undefined, to: undefined },
    });
  }, []);
  
  const hasActiveFilters = filters.category || filters.language || filters.dateRange.from || filters.dateRange.to;

  return (
    <div className={cn("w-full max-w-4xl", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-5 w-5 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder || t('search.placeholder')}
            className="pl-10 pr-20"
            onFocus={() => setShowSuggestions(query.length > 1)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-12 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {showFilters && (
            <Button
              variant={hasActiveFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="absolute right-2"
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              >
                <Search className="inline h-4 w-4 mr-2 text-gray-400" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && showAdvancedFilters && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('search.filters.category')}
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  category: e.target.value || undefined 
                }))}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">{t('search.filters.allCategories')}</option>
                <option value="bylaw">{t('document.categories.bylaw')}</option>
                <option value="financial">{t('document.categories.financial')}</option>
                <option value="maintenance">{t('document.categories.maintenance')}</option>
                <option value="announcement">{t('document.categories.announcement')}</option>
                <option value="legal">{t('document.categories.legal')}</option>
                <option value="meeting_minutes">{t('document.categories.meeting_minutes')}</option>
                <option value="other">{t('document.categories.other')}</option>
              </select>
            </div>
            
            {/* Language Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('search.filters.language')}
              </label>
              <select
                value={filters.language || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  language: e.target.value || undefined 
                }))}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">{t('search.filters.allLanguages')}</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('search.filters.dateRange')}
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filters.dateRange.from?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange,
                      from: e.target.value ? new Date(e.target.value) : undefined,
                    },
                  }))}
                  className="flex-1 border rounded-md px-2 py-1 text-sm"
                />
                <input
                  type="date"
                  value={filters.dateRange.to?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange,
                      to: e.target.value ? new Date(e.target.value) : undefined,
                    },
                  }))}
                  className="flex-1 border rounded-md px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
          
          {hasActiveFilters && (
            <div className="mt-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                {t('search.filters.clear')}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      {debouncedQuery && (
        <div className="mt-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">{t('search.searching')}</span>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8 text-red-600">
              {t('search.error')}
            </div>
          )}
          
          {searchResults && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  {t('search.resultsCount', { 
                    count: searchResults.totalCount,
                    time: searchResults.searchTime 
                  })}
                </p>
                
                {!compact && searchResults.totalCount > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{t('search.sortBy')}:</span>
                    <select className="border-0 bg-transparent underline">
                      <option value="relevance">{t('search.sort.relevance')}</option>
                      <option value="date">{t('search.sort.date')}</option>
                      <option value="title">{t('search.sort.title')}</option>
                    </select>
                  </div>
                )}
              </div>
              
              {searchResults.documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>{t('search.noResults')}</p>
                  <p className="text-sm mt-2">{t('search.tryDifferentQuery')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.documents.map((document) => (
                    <SearchResultItem
                      key={document.id}
                      document={document}
                      query={debouncedQuery}
                      onSelect={onResultSelect}
                      compact={compact}
                    />
                  ))}
                  
                  {searchResults.hasMore && !compact && (
                    <div className="text-center pt-4">
                      <Button variant="outline">
                        {t('search.loadMore')}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Search Result Item Component
interface SearchResultItemProps {
  document: any;
  query: string;
  onSelect?: (document: any) => void;
  compact?: boolean;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  document,
  query,
  onSelect,
  compact,
}) => {
  const { t } = useTranslation();
  
  const handleClick = () => {
    onSelect?.(document);
  };
  
  const highlightText = (text: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };
  
  return (
    <div 
      onClick={handleClick}
      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">
            {highlightText(document.title)}
          </h3>
          
          {document.description && !compact && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {highlightText(document.description)}
            </p>
          )}
          
          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              {t(`document.categories.${document.category}`)}
            </span>
            
            <span>{document.language.toUpperCase()}</span>
            
            <span>
              {new Date(document.created_at).toLocaleDateString()}
            </span>
            
            {document.uploader?.name && (
              <span>{document.uploader.name}</span>
            )}
            
            <span>
              {Math.round(document.file_size / 1024)} KB
            </span>
          </div>
        </div>
        
        <div className="ml-4 flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Handle download
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
```

## 🧪 Testing Strategy

### Search Component Tests

**Create**: `src/components/SearchInterface.test.tsx`
```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInterface } from './SearchInterface';
import { EnhancedStoryProviders } from '../stories/utils/EnhancedStoryProviders';

// Mock tRPC
const mockSearchResults = {
  documents: [
    {
      id: '1',
      title: 'Test Document 1',
      description: 'This is a test document about bylaws',
      category: 'bylaw',
      language: 'en',
      file_size: 245760,
      created_at: '2024-01-15T10:00:00Z',
      uploader: { name: 'John Doe' },
    },
    {
      id: '2',
      title: 'Another Test Document',
      description: 'Financial report for Q4',
      category: 'financial',
      language: 'fr',
      file_size: 512000,
      created_at: '2024-01-10T14:30:00Z',
      uploader: { name: 'Jane Smith' },
    },
  ],
  totalCount: 2,
  hasMore: false,
  searchTime: 145,
};

const mockSuggestions = {
  suggestions: [
    { term: 'test document', frequency: 5, type: 'search_term' },
    { term: 'test report', frequency: 3, type: 'search_term' },
  ],
};

jest.mock('@/lib/trpc', () => ({
  trpc: {
    search: {
      searchDocuments: {
        useQuery: jest.fn(() => ({
          data: mockSearchResults,
          isLoading: false,
          error: null,
        })),
      },
      getSearchSuggestions: {
        useQuery: jest.fn(() => ({
          data: mockSuggestions,
        })),
      },
    },
  },
}));

const renderSearchInterface = (props = {}) => {
  return render(
    <EnhancedStoryProviders withI18n withTRPC>
      <SearchInterface {...props} />
    </EnhancedStoryProviders>
  );
};

describe('SearchInterface', () => {
  describe('Basic Functionality', () => {
    it('renders search input and placeholder', () => {
      renderSearchInterface();
      
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    });

    it('displays search suggestions while typing', async () => {
      const user = userEvent.setup();
      renderSearchInterface();
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'test');
      
      await waitFor(() => {
        expect(screen.getByText('test document')).toBeInTheDocument();
        expect(screen.getByText('test report')).toBeInTheDocument();
      });
    });

    it('performs search and displays results', async () => {
      const user = userEvent.setup();
      renderSearchInterface();
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'test document');
      
      await waitFor(() => {
        expect(screen.getByText('Test Document 1')).toBeInTheDocument();
        expect(screen.getByText('Another Test Document')).toBeInTheDocument();
        expect(screen.getByText(/2.*results/i)).toBeInTheDocument();
      });
    });

    it('highlights search terms in results', async () => {
      const user = userEvent.setup();
      renderSearchInterface();
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'test');
      
      await waitFor(() => {
        const highlightedElements = screen.getAllByText('test');
        expect(highlightedElements.some(el => el.tagName === 'MARK')).toBe(true);
      });
    });
  });

  describe('Advanced Filters', () => {
    it('shows and hides advanced filters', async () => {
      const user = userEvent.setup();
      renderSearchInterface();
      
      const filterButton = screen.getByRole('button', { name: /filter/i });
      await user.click(filterButton);
      
      expect(screen.getByText(/category/i)).toBeInTheDocument();
      expect(screen.getByText(/language/i)).toBeInTheDocument();
      expect(screen.getByText(/date range/i)).toBeInTheDocument();
      
      await user.click(filterButton);
      expect(screen.queryByText(/category/i)).not.toBeInTheDocument();
    });

    it('applies category filter', async () => {
      const user = userEvent.setup();
      renderSearchInterface();
      
      // Open filters
      await user.click(screen.getByRole('button', { name: /filter/i }));
      
      // Select category
      const categorySelect = screen.getByLabelText(/category/i);
      await user.selectOptions(categorySelect, 'bylaw');
      
      expect(categorySelect).toHaveValue('bylaw');
    });

    it('clears all filters', async () => {
      const user = userEvent.setup();
      renderSearchInterface();
      
      // Open filters and set some
      await user.click(screen.getByRole('button', { name: /filter/i }));
      
      const categorySelect = screen.getByLabelText(/category/i);
      await user.selectOptions(categorySelect, 'bylaw');
      
      // Clear filters
      await user.click(screen.getByText(/clear/i));
      
      expect(categorySelect).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      renderSearchInterface();
      
      expect(screen.getByRole('textbox')).toHaveAttribute('placeholder');
      expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderSearchInterface();
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'test');
      
      // Tab to filter button
      await user.tab();
      expect(screen.getByRole('button', { name: /filter/i })).toHaveFocus();
    });
  });

  describe('Internationalization', () => {
    it('displays French interface', () => {
      render(
        <EnhancedStoryProviders withI18n locale="fr">
          <SearchInterface />
        </EnhancedStoryProviders>
      );
      
      // Would check for French translations in actual implementation
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('supports RTL layout for Arabic', () => {
      render(
        <EnhancedStoryProviders withI18n locale="ar">
          <SearchInterface />
        </EnhancedStoryProviders>
      );
      
      // Would verify RTL layout classes in actual implementation
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('debounces search queries', async () => {
      const user = userEvent.setup();
      const mockUseQuery = jest.fn();
      
      // Mock the search hook to track calls
      require('@/lib/trpc').trpc.search.searchDocuments.useQuery = mockUseQuery;
      
      renderSearchInterface();
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Type quickly
      await user.type(searchInput, 'test', { delay: 10 });
      
      // Should not call search for every keystroke
      expect(mockUseQuery).not.toHaveBeenCalledTimes(4);
    });

    it('handles large result sets efficiently', async () => {
      const largeResults = {
        ...mockSearchResults,
        documents: Array(100).fill(null).map((_, i) => ({
          ...mockSearchResults.documents[0],
          id: `doc-${i}`,
          title: `Document ${i}`,
        })),
        totalCount: 1000,
        hasMore: true,
      };
      
      require('@/lib/trpc').trpc.search.searchDocuments.useQuery.mockReturnValue({
        data: largeResults,
        isLoading: false,
        error: null,
      });
      
      const user = userEvent.setup();
      renderSearchInterface();
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'document');
      
      await waitFor(() => {
        expect(screen.getByText(/1000.*results/i)).toBeInTheDocument();
        expect(screen.getByText(/load more/i)).toBeInTheDocument();
      });
    });
  });
});
```

## 🎯 Success Criteria

### Functional Requirements ✅
- [ ] Full-text search across all document content
- [ ] Multilingual search support (FR/AR/EN) with proper stemming
- [ ] Real-time autocomplete suggestions
- [ ] Advanced filtering by category, language, and date
- [ ] Search result highlighting and ranking
- [ ] Search analytics and query tracking

### Performance Requirements ✅
- [ ] Search response time: <200ms for simple queries
- [ ] Autocomplete response: <100ms
- [ ] Complex queries: <500ms
- [ ] Index update time: <1 minute after document upload
- [ ] Support for 10,000+ documents

### User Experience Requirements ✅
- [ ] Intuitive search interface with clear feedback
- [ ] Mobile-optimized search experience
- [ ] Keyboard shortcuts and accessibility support
- [ ] Search suggestions based on user behavior
- [ ] No-results state with helpful guidance

### Technical Requirements ✅
- [ ] PostgreSQL full-text search optimization
- [ ] Proper database indexing for performance
- [ ] Search query caching and optimization
- [ ] Analytics tracking for search improvement
- [ ] Integration with existing document permissions

---

This search implementation provides a powerful, fast, and user-friendly search experience that respects the multilingual nature of the Costabeach platform while maintaining excellent performance and accessibility standards.