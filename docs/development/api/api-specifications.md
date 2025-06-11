# API Specifications

## 🎯 Overview

This document provides comprehensive API specifications for all Costabeach features across all phases. The API is built using tRPC for end-to-end type safety and follows RESTful principles where applicable.

## 🏗️ Current API Analysis (Phase 1) ✅

### Existing tRPC Routers

#### Documents Router (532 lines)
```typescript
// From src/lib/api/routers/documents.ts
export const documentsRouter = router({
  // Document CRUD operations
  getAll: procedure
    .input(z.object({
      category: z.enum(['bylaw', 'financial', 'maintenance', 'announcement', 'legal', 'meeting_minutes', 'other']).optional(),
      language: z.enum(['en', 'fr', 'ar']).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      // RLS-protected document listing with pagination
    }),

  getById: procedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      // Single document retrieval with permission check
    }),

  upload: procedure
    .input(z.object({
      title: z.string().min(1).max(200),
      description: z.string().optional(),
      category: z.enum(['bylaw', 'financial', 'maintenance', 'announcement', 'legal', 'meeting_minutes', 'other']),
      file: z.any(), // File upload handling
      language: z.enum(['en', 'fr', 'ar']).default('en'),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      // File upload to Supabase Storage + metadata creation
    }),

  // Additional CRUD operations...
});
```

#### Translations Router (154 lines)
```typescript
// From src/lib/api/routers/translations.ts
export const translationsRouter = router({
  requestTranslation: procedure
    .input(z.object({
      documentId: z.string(),
      targetLanguage: z.enum(['en', 'fr', 'ar']),
      priority: z.enum(['low', 'normal', 'high']).default('normal'),
    }))
    .mutation(async ({ input, ctx }) => {
      // Initiate background translation job
    }),

  getTranslationStatus: procedure
    .input(z.string()) // jobId
    .query(async ({ input, ctx }) => {
      // Check translation job status
    }),

  // Background job processing procedures...
});
```

## 🚀 Phase 2: Document Management API Extensions

### Enhanced Documents Router

```typescript
// Enhanced document operations
export const documentsRouterV2 = router({
  // Existing operations from Phase 1...

  // PDF Viewer Integration
  getDocumentContent: procedure
    .input(z.object({
      documentId: z.string(),
      page: z.number().optional(),
      format: z.enum(['url', 'blob', 'base64']).default('url'),
    }))
    .query(async ({ input, ctx }) => {
      const { documentId, page, format } = input;
      
      // Permission check
      await validateDocumentAccess(documentId, ctx.user.id);
      
      // Get document from Supabase Storage
      const { data: document } = await ctx.supabase
        .from('documents')
        .select('file_path, mime_type')
        .eq('id', documentId)
        .single();
      
      // Generate signed URL or return content based on format
      if (format === 'url') {
        const { data } = await ctx.supabase.storage
          .from('documents')
          .createSignedUrl(document.file_path, 3600); // 1 hour expiry
        
        return { url: data.signedUrl };
      }
      
      // Handle blob/base64 formats for direct viewing
      // Implementation for PDF.js integration
    }),

  // Full-text search
  searchDocuments: procedure
    .input(z.object({
      query: z.string().min(1),
      category: z.enum(['bylaw', 'financial', 'maintenance', 'announcement', 'legal', 'meeting_minutes', 'other']).optional(),
      language: z.enum(['en', 'fr', 'ar']).optional(),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { query, category, language, limit, offset } = input;
      
      // Use PostgreSQL full-text search
      let searchQuery = ctx.supabase
        .from('documents')
        .select(`
          id, title, description, category, language, created_at,
          ts_rank(search_vector, plainto_tsquery($1)) as rank
        `)
        .textSearch('search_vector', query)
        .order('rank', { ascending: false });
      
      if (category) {
        searchQuery = searchQuery.eq('category', category);
      }
      
      if (language) {
        searchQuery = searchQuery.eq('language', language);
      }
      
      const { data, error } = await searchQuery
        .range(offset, offset + limit - 1);
      
      if (error) throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Search failed',
      });
      
      return {
        documents: data,
        total: data.length,
        hasMore: data.length === limit,
      };
    }),

  // Document versions
  getVersionHistory: procedure
    .input(z.string()) // documentId
    .query(async ({ input, ctx }) => {
      await validateDocumentAccess(input, ctx.user.id);
      
      const { data } = await ctx.supabase
        .from('document_versions')
        .select(`
          id, version_number, file_size, changes_summary,
          created_at, uploader:uploaded_by(name)
        `)
        .eq('document_id', input)
        .order('version_number', { ascending: false });
      
      return data;
    }),

  createVersion: procedure
    .input(z.object({
      documentId: z.string(),
      file: z.any(),
      changesSummary: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Create new document version
      // Implementation for version management
    }),
});
```

### Document Summaries Router

```typescript
export const summariesRouter = router({
  generateSummary: procedure
    .input(z.object({
      documentId: z.string(),
      language: z.enum(['en', 'fr', 'ar']).optional(),
      summaryType: z.enum(['brief', 'detailed', 'key_points']).default('brief'),
    }))
    .mutation(async ({ input, ctx }) => {
      const { documentId, language, summaryType } = input;
      
      // Permission check
      await validateDocumentAccess(documentId, ctx.user.id);
      
      // Check if summary already exists
      const existing = await ctx.supabase
        .from('document_summaries')
        .select('id')
        .eq('document_id', documentId)
        .eq('language', language || 'en')
        .single();
      
      if (existing.data) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Summary already exists for this document and language',
        });
      }
      
      // Queue background job for summary generation
      const job = await inngest.send({
        name: 'document.generate-summary',
        data: {
          documentId,
          language: language || 'en',
          summaryType,
          requestedBy: ctx.user.id,
        },
      });
      
      return {
        jobId: job.ids[0],
        status: 'pending',
        estimatedCompletion: new Date(Date.now() + 120000), // 2 minutes
      };
    }),

  getSummary: procedure
    .input(z.object({
      documentId: z.string(),
      language: z.enum(['en', 'fr', 'ar']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      await validateDocumentAccess(input.documentId, ctx.user.id);
      
      const { data } = await ctx.supabase
        .from('document_summaries')
        .select('*')
        .eq('document_id', input.documentId)
        .eq('language', input.language || 'en')
        .single();
      
      return data;
    }),

  getAllSummaries: procedure
    .input(z.string()) // documentId
    .query(async ({ input, ctx }) => {
      await validateDocumentAccess(input, ctx.user.id);
      
      const { data } = await ctx.supabase
        .from('document_summaries')
        .select('*')
        .eq('document_id', input)
        .order('created_at', { ascending: false });
      
      return data;
    }),
});
```

## 🗳️ Phase 3: Community Management API

### Polls Router

```typescript
export const pollsRouter = router({
  // Poll creation and management
  create: procedure
    .input(z.object({
      question: z.string().min(10).max(500),
      description: z.string().optional(),
      options: z.array(z.string().min(1).max(200)).min(2).max(10),
      pollType: z.enum(['single_choice', 'multiple_choice', 'yes_no', 'rating']).default('single_choice'),
      isAnonymous: z.boolean().default(true),
      allowComments: z.boolean().default(false),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      translations: z.record(z.enum(['fr', 'ar']), z.object({
        question: z.string(),
        description: z.string().optional(),
        options: z.array(z.string()),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Permission check: only contentEditor and admin can create polls
      if (!['contentEditor', 'admin'].includes(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only content editors and admins can create polls',
        });
      }
      
      const { question, description, options, translations, ...pollData } = input;
      
      // Create poll in transaction
      const { data: poll } = await ctx.supabase
        .from('polls')
        .insert({
          question,
          description,
          created_by: ctx.user.id,
          ...pollData,
        })
        .select()
        .single();
      
      // Create poll options
      const pollOptions = options.map((option, index) => ({
        poll_id: poll.id,
        option_text: option,
        order_index: index,
      }));
      
      await ctx.supabase
        .from('poll_options')
        .insert(pollOptions);
      
      // Create translations if provided
      if (translations) {
        const translationEntries = Object.entries(translations).map(([lang, content]) => ({
          poll_id: poll.id,
          language: lang,
          question: content.question,
          description: content.description,
        }));
        
        await ctx.supabase
          .from('poll_translations')
          .insert(translationEntries);
      }
      
      // Log audit trail
      await logAuditAction(ctx.user.id, 'create', 'poll', poll.id, { question });
      
      return poll;
    }),

  // Get polls with user vote status
  getAll: procedure
    .input(z.object({
      status: z.enum(['draft', 'published', 'closed', 'archived']).optional(),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { status, limit, offset } = input;
      
      let query = ctx.supabase
        .from('polls')
        .select(`
          id, question, description, poll_type, status, is_anonymous,
          start_date, end_date, created_at, creator:created_by(name),
          options:poll_options(id, option_text, order_index),
          user_vote:votes!inner(option_id)
        `)
        .eq('votes.user_id', ctx.user.id);
      
      if (status) {
        query = query.eq('status', status);
      } else {
        // Default: show published polls for regular users
        if (ctx.user.role === 'user') {
          query = query.eq('status', 'published');
        }
      }
      
      const { data } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      return data;
    }),

  // Vote on a poll
  vote: procedure
    .input(z.object({
      pollId: z.string(),
      optionIds: z.array(z.string()).min(1),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { pollId, optionIds, comment } = input;
      
      // Check if poll exists and is active
      const { data: poll } = await ctx.supabase
        .from('polls')
        .select('id, status, poll_type, end_date')
        .eq('id', pollId)
        .single();
      
      if (!poll || poll.status !== 'published') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Poll is not available for voting',
        });
      }
      
      if (poll.end_date && new Date(poll.end_date) < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Poll has ended',
        });
      }
      
      // Check if user already voted
      const { data: existingVote } = await ctx.supabase
        .from('votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', ctx.user.id)
        .single();
      
      if (existingVote) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You have already voted on this poll',
        });
      }
      
      // Validate option count based on poll type
      if (poll.poll_type === 'single_choice' && optionIds.length > 1) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Single choice polls allow only one option',
        });
      }
      
      // Create vote entries
      const votes = optionIds.map(optionId => ({
        poll_id: pollId,
        option_id: optionId,
        user_id: ctx.user.id,
        comment: comment || null,
      }));
      
      const { data } = await ctx.supabase
        .from('votes')
        .insert(votes)
        .select();
      
      return { success: true, voteCount: votes.length };
    }),

  // Get poll results
  getResults: procedure
    .input(z.string()) // pollId
    .query(async ({ input, ctx }) => {
      // Check if user can view results
      const { data: poll } = await ctx.supabase
        .from('polls')
        .select('id, status, creator:created_by')
        .eq('id', input)
        .single();
      
      if (!poll) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Poll not found',
        });
      }
      
      // Only allow viewing results for published/closed polls or if user is creator/admin
      const canViewResults = 
        ['published', 'closed'].includes(poll.status) ||
        poll.creator === ctx.user.id ||
        ['contentEditor', 'admin'].includes(ctx.user.role);
      
      if (!canViewResults) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot view results for this poll',
        });
      }
      
      // Get vote counts per option
      const { data: results } = await ctx.supabase
        .from('poll_options')
        .select(`
          id, option_text, order_index,
          vote_count:votes(count)
        `)
        .eq('poll_id', input)
        .order('order_index');
      
      // Get total votes
      const { count: totalVotes } = await ctx.supabase
        .from('votes')
        .select('*', { count: 'exact' })
        .eq('poll_id', input);
      
      return {
        options: results,
        totalVotes,
        isAnonymous: poll.is_anonymous,
      };
    }),
});
```

### Admin Router

```typescript
export const adminRouter = router({
  // User management
  users: {
    getAll: procedure
      .input(z.object({
        role: z.enum(['user', 'contentEditor', 'admin']).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input, ctx }) => {
        requireAdminAccess(ctx.user);
        
        let query = ctx.supabase
          .from('users')
          .select(`
            id, name, email, role, language, whatsapp_opt_in,
            created_at, last_login:audit_log(created_at)
          `)
          .order('created_at', { ascending: false });
        
        if (input.role) {
          query = query.eq('role', input.role);
        }
        
        if (input.search) {
          query = query.or(`name.ilike.%${input.search}%,email.ilike.%${input.search}%`);
        }
        
        const { data } = await query.range(input.offset, input.offset + input.limit - 1);
        return data;
      }),

    updateRole: procedure
      .input(z.object({
        userId: z.string(),
        newRole: z.enum(['user', 'contentEditor', 'admin']),
      }))
      .mutation(async ({ input, ctx }) => {
        requireAdminAccess(ctx.user);
        
        const { userId, newRole } = input;
        
        // Prevent removing the last admin
        if (newRole !== 'admin') {
          const { count: adminCount } = await ctx.supabase
            .from('users')
            .select('*', { count: 'exact' })
            .eq('role', 'admin');
          
          if (adminCount <= 1) {
            const { data: currentUser } = await ctx.supabase
              .from('users')
              .select('role')
              .eq('id', userId)
              .single();
            
            if (currentUser?.role === 'admin') {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Cannot remove the last admin user',
              });
            }
          }
        }
        
        const { data } = await ctx.supabase
          .from('users')
          .update({ role: newRole, updated_at: new Date() })
          .eq('id', userId)
          .select()
          .single();
        
        // Log audit trail
        await logAuditAction(ctx.user.id, 'update_role', 'user', userId, { 
          newRole, 
          previousRole: data.role 
        });
        
        return data;
      }),
  },

  // System metrics
  metrics: {
    getDashboard: procedure
      .query(async ({ ctx }) => {
        requireAdminAccess(ctx.user);
        
        // Get key metrics in parallel
        const [
          { count: totalUsers },
          { count: totalDocuments },
          { count: activePolls },
          { count: pendingTranslations },
        ] = await Promise.all([
          ctx.supabase.from('users').select('*', { count: 'exact' }),
          ctx.supabase.from('documents').select('*', { count: 'exact' }),
          ctx.supabase.from('polls').select('*', { count: 'exact' }).eq('status', 'published'),
          ctx.supabase.from('document_translations').select('*', { count: 'exact' }).eq('status', 'pending'),
        ]);
        
        // Get recent activity
        const { data: recentActivity } = await ctx.supabase
          .from('audit_log')
          .select('action, resource, created_at, user:user_id(name)')
          .order('created_at', { ascending: false })
          .limit(10);
        
        return {
          metrics: {
            totalUsers,
            totalDocuments,
            activePolls,
            pendingTranslations,
          },
          recentActivity,
        };
      }),
  },
});
```

## 💬 Phase 4: WhatsApp Integration API

### WhatsApp Router

```typescript
export const whatsappRouter = router({
  // Contact management
  contacts: {
    link: procedure
      .input(z.object({
        phoneNumber: z.string().regex(/^\+\d{10,15}$/),
        countryCode: z.string().length(2),
      }))
      .mutation(async ({ input, ctx }) => {
        const { phoneNumber, countryCode } = input;
        
        // Check if phone number already exists
        const { data: existing } = await ctx.supabase
          .from('whatsapp_contacts')
          .select('id')
          .eq('phone_number', phoneNumber)
          .single();
        
        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Phone number already linked to an account',
          });
        }
        
        // Generate verification code
        const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Create WhatsApp contact record
        const { data: contact } = await ctx.supabase
          .from('whatsapp_contacts')
          .insert({
            user_id: ctx.user.id,
            phone_number: phoneNumber,
            country_code: countryCode,
            verification_code: verificationCode,
            status: 'pending',
          })
          .select()
          .single();
        
        // Send verification message via WhatsApp
        await sendWhatsAppMessage({
          to: phoneNumber,
          template: 'verification_code',
          data: { code: verificationCode },
        });
        
        return {
          contactId: contact.id,
          message: 'Verification code sent via WhatsApp',
        };
      }),

    verify: procedure
      .input(z.object({
        contactId: z.string(),
        verificationCode: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { contactId, verificationCode } = input;
        
        const { data: contact } = await ctx.supabase
          .from('whatsapp_contacts')
          .select('*')
          .eq('id', contactId)
          .eq('user_id', ctx.user.id)
          .single();
        
        if (!contact) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Contact not found',
          });
        }
        
        if (contact.verification_code !== verificationCode) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid verification code',
          });
        }
        
        // Update contact status
        const { data } = await ctx.supabase
          .from('whatsapp_contacts')
          .update({
            is_verified: true,
            status: 'verified',
            verification_code: null,
            opt_in_date: new Date(),
          })
          .eq('id', contactId)
          .select()
          .single();
        
        return data;
      }),

    optOut: procedure
      .mutation(async ({ ctx }) => {
        const { data } = await ctx.supabase
          .from('whatsapp_contacts')
          .update({
            status: 'opted_out',
            opt_out_date: new Date(),
          })
          .eq('user_id', ctx.user.id)
          .select()
          .single();
        
        return data;
      }),
  },

  // Message management
  messages: {
    send: procedure
      .input(z.object({
        recipients: z.array(z.string()).optional(), // User IDs, if empty send to all
        template: z.string(),
        data: z.record(z.string(), z.any()).optional(),
        type: z.enum(['announcement', 'digest', 'alert']).default('announcement'),
      }))
      .mutation(async ({ input, ctx }) => {
        requireContentEditorAccess(ctx.user);
        
        const { recipients, template, data, type } = input;
        
        // Get target contacts
        let contactsQuery = ctx.supabase
          .from('whatsapp_contacts')
          .select('id, phone_number, user_id')
          .eq('status', 'opted_in');
        
        if (recipients?.length) {
          contactsQuery = contactsQuery.in('user_id', recipients);
        }
        
        const { data: contacts } = await contactsQuery;
        
        // Send messages
        const messagePromises = contacts.map(async (contact) => {
          const messageId = await sendWhatsAppMessage({
            to: contact.phone_number,
            template,
            data,
          });
          
          // Log message
          return ctx.supabase
            .from('whatsapp_messages')
            .insert({
              contact_id: contact.id,
              direction: 'outbound',
              message_type: 'template',
              template_name: template,
              template_data: data,
              whatsapp_id: messageId,
              status: 'sent',
              sent_at: new Date(),
            });
        });
        
        await Promise.all(messagePromises);
        
        return {
          success: true,
          recipientCount: contacts.length,
        };
      }),

    getHistory: procedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input, ctx }) => {
        const { data } = await ctx.supabase
          .from('whatsapp_messages')
          .select(`
            id, direction, message_type, content, template_name,
            status, sent_at, delivered_at, read_at,
            contact:contact_id(phone_number)
          `)
          .eq('whatsapp_contacts.user_id', ctx.user.id)
          .order('sent_at', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1);
        
        return data;
      }),
  },

  // Digest system
  digests: {
    schedule: procedure
      .input(z.object({
        type: z.enum(['daily', 'weekly', 'monthly']),
        recipients: z.array(z.string()).optional(),
        includeDocuments: z.boolean().default(true),
        includePolls: z.boolean().default(true),
        includeAnnouncements: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        requireContentEditorAccess(ctx.user);
        
        // Schedule digest generation job
        const job = await inngest.send({
          name: 'whatsapp.generate-digest',
          data: {
            type: input.type,
            recipients: input.recipients,
            content: {
              includeDocuments: input.includeDocuments,
              includePolls: input.includePolls,
              includeAnnouncements: input.includeAnnouncements,
            },
            scheduledBy: ctx.user.id,
          },
        });
        
        return {
          jobId: job.ids[0],
          status: 'scheduled',
        };
      }),

    getDigestHistory: procedure
      .input(z.object({
        type: z.enum(['daily', 'weekly', 'monthly']).optional(),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ input, ctx }) => {
        let query = ctx.supabase
          .from('whatsapp_digest_logs')
          .select(`
            id, digest_type, period_start, period_end,
            content_summary, status, sent_at, created_at,
            contact:contact_id(user:user_id(name))
          `)
          .order('created_at', { ascending: false });
        
        if (input.type) {
          query = query.eq('digest_type', input.type);
        }
        
        const { data } = await query.limit(input.limit);
        return data;
      }),
  },
});
```

### Q&A Assistant Router

```typescript
export const qaRouter = router({
  // Ask a question
  ask: procedure
    .input(z.object({
      question: z.string().min(1).max(1000),
      language: z.enum(['en', 'fr', 'ar']).default('en'),
      conversationId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { question, language, conversationId } = input;
      
      // Get or create conversation
      let conversation;
      if (conversationId) {
        const { data } = await ctx.supabase
          .from('qa_conversations')
          .select('*')
          .eq('id', conversationId)
          .eq('user_id', ctx.user?.id)
          .single();
        conversation = data;
      }
      
      if (!conversation) {
        const { data } = await ctx.supabase
          .from('qa_conversations')
          .insert({
            user_id: ctx.user?.id,
            session_id: `session_${Date.now()}`,
            language,
          })
          .select()
          .single();
        conversation = data;
      }
      
      // Process question with AI
      const startTime = Date.now();
      
      // 1. Generate embedding for the question
      const questionEmbedding = await generateEmbedding(question);
      
      // 2. Find relevant document chunks using vector similarity
      const { data: relevantChunks } = await ctx.supabase.rpc(
        'match_documents',
        {
          query_embedding: questionEmbedding,
          match_threshold: 0.7,
          match_count: 5,
        }
      );
      
      // 3. Filter by user permissions
      const accessibleDocuments = await filterDocumentsByPermissions(
        relevantChunks.map(chunk => chunk.document_id),
        ctx.user?.id
      );
      
      const contextChunks = relevantChunks.filter(chunk =>
        accessibleDocuments.includes(chunk.document_id)
      );
      
      // 4. Generate answer using OpenAI
      const answer = await generateAnswer({
        question,
        context: contextChunks,
        language,
        conversationHistory: conversation.interactions?.slice(-3),
      });
      
      const responseTime = Date.now() - startTime;
      
      // 5. Save interaction
      const { data: interaction } = await ctx.supabase
        .from('qa_interactions')
        .insert({
          conversation_id: conversation.id,
          question,
          answer: answer.response,
          sources_used: answer.sources,
          confidence_score: answer.confidence,
          response_time_ms: responseTime,
          tokens_used: answer.tokensUsed,
          cost_cents: answer.costCents,
        })
        .select()
        .single();
      
      return {
        answer: answer.response,
        sources: answer.sources,
        confidence: answer.confidence,
        conversationId: conversation.id,
        interactionId: interaction.id,
      };
    }),

  // Get conversation history
  getConversation: procedure
    .input(z.string()) // conversationId
    .query(async ({ input, ctx }) => {
      const { data } = await ctx.supabase
        .from('qa_conversations')
        .select(`
          id, session_id, language, started_at,
          interactions:qa_interactions(
            id, question, answer, sources_used,
            confidence_score, created_at
          )
        `)
        .eq('id', input)
        .eq('user_id', ctx.user?.id)
        .single();
      
      return data;
    }),

  // Provide feedback on an answer
  provideFeedback: procedure
    .input(z.object({
      interactionId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { interactionId, rating, comment } = input;
      
      const { data } = await ctx.supabase
        .from('qa_interactions')
        .update({
          feedback_rating: rating,
          feedback_comment: comment,
        })
        .eq('id', interactionId)
        .select()
        .single();
      
      return data;
    }),

  // Admin: Get Q&A analytics
  getAnalytics: procedure
    .input(z.object({
      dateFrom: z.date(),
      dateTo: z.date(),
    }))
    .query(async ({ input, ctx }) => {
      requireAdminAccess(ctx.user);
      
      const { dateFrom, dateTo } = input;
      
      // Get question volume and response times
      const { data: interactions } = await ctx.supabase
        .from('qa_interactions')
        .select('response_time_ms, confidence_score, feedback_rating, created_at')
        .gte('created_at', dateFrom.toISOString())
        .lte('created_at', dateTo.toISOString());
      
      // Calculate metrics
      const totalQuestions = interactions.length;
      const avgResponseTime = interactions.reduce((sum, i) => sum + i.response_time_ms, 0) / totalQuestions;
      const avgConfidence = interactions.reduce((sum, i) => sum + (i.confidence_score || 0), 0) / totalQuestions;
      const ratingsProvided = interactions.filter(i => i.feedback_rating).length;
      const avgRating = interactions
        .filter(i => i.feedback_rating)
        .reduce((sum, i) => sum + i.feedback_rating, 0) / ratingsProvided;
      
      return {
        totalQuestions,
        avgResponseTime: Math.round(avgResponseTime),
        avgConfidence: Math.round(avgConfidence * 100) / 100,
        feedbackRate: Math.round((ratingsProvided / totalQuestions) * 100),
        avgRating: Math.round(avgRating * 100) / 100,
      };
    }),
});
```

## 🔧 Utility Functions and Middleware

### Authentication Middleware

```typescript
// Enhanced authentication with granular permissions
export const createTRPCContext = async ({ req, res }: CreateNextContextOptions) => {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return { user: null, supabase: createSupabaseClient() };
  }
  
  // Get user with permissions
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  return {
    user,
    supabase: createSupabaseClient(session.accessToken),
  };
};

// Permission checking utilities
export const requireAuthentication = (user: User | null): User => {
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  return user;
};

export const requireAdminAccess = (user: User | null): User => {
  const authenticatedUser = requireAuthentication(user);
  if (authenticatedUser.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  return authenticatedUser;
};

export const requireContentEditorAccess = (user: User | null): User => {
  const authenticatedUser = requireAuthentication(user);
  if (!['contentEditor', 'admin'].includes(authenticatedUser.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Content editor access required',
    });
  }
  return authenticatedUser;
};
```

### API Rate Limiting

```typescript
// Rate limiting for AI-powered endpoints
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different limits for different operations
export const rateLimits = {
  qa: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 questions per minute
  }),
  translation: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 translations per hour
  }),
  summary: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 summaries per hour
  }),
};

export const withRateLimit = (
  limitType: keyof typeof rateLimits,
  identifier: string
) => {
  return async () => {
    const { success, limit, reset, remaining } = await rateLimits[limitType].limit(identifier);
    
    if (!success) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Try again in ${Math.round((reset - Date.now()) / 1000)} seconds.`,
      });
    }
    
    return { limit, reset, remaining };
  };
};
```

## 🎯 Success Criteria

### API Quality Standards ✅
- [ ] All endpoints have comprehensive input validation
- [ ] End-to-end type safety with tRPC
- [ ] Proper error handling with meaningful messages
- [ ] Rate limiting on expensive operations
- [ ] Comprehensive audit logging
- [ ] Performance monitoring for all endpoints

### Security Standards ✅
- [ ] All endpoints require proper authentication
- [ ] Role-based access control enforced
- [ ] Input sanitization and validation
- [ ] SQL injection prevention
- [ ] Rate limiting against abuse
- [ ] Audit trail for sensitive operations

### Performance Standards ✅
- [ ] Document operations: <200ms response time
- [ ] Search operations: <500ms response time
- [ ] Q&A operations: <10s response time
- [ ] Bulk operations: Proper pagination
- [ ] Concurrent requests: 100+ supported
- [ ] Database queries: Optimized with indexes

---

This comprehensive API specification provides type-safe, secure, and performant endpoints for all Costabeach features while maintaining excellent developer experience through tRPC.