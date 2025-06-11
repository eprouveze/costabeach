# Project Architecture

## 🎯 System Overview

Costabeach is a modern web platform built for a 300-owner condominium HOA in Morocco. The architecture follows Next.js App Router patterns with a focus on type safety, scalability, and maintainability.

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Next.js 15 App Router + TypeScript                        │
│  • Atomic Design System (Atoms → Organisms → Pages)        │
│  • Multilingual Support (FR/AR/EN) with RTL               │
│  • Responsive Design with Tailwind CSS                     │
│  • Client-side State Management (React Query)              │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                │
├─────────────────────────────────────────────────────────────┤
│  tRPC (Type-safe API)                                      │
│  • Documents Router (CRUD, permissions, audit)             │
│  • Translations Router (AI workflow, status tracking)      │
│  • Users Router (auth, profile, permissions)               │
│  • Future: Polls, WhatsApp, Q&A routers                   │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC                           │
├─────────────────────────────────────────────────────────────┤
│  Server Actions & Middleware                               │
│  • Authentication & Authorization                          │
│  • Role-based Permissions (RLS)                           │
│  • Document Processing Pipeline                            │
│  • AI Integration Orchestration                           │
│  • Background Job Coordination                            │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL + Auth + Storage)                   │
│  • User Management & Authentication                        │
│  • Document Storage & Metadata                            │
│  • Row Level Security (RLS) Policies                      │
│  • Real-time Subscriptions                                │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                        │
├─────────────────────────────────────────────────────────────┤
│  • OpenAI (GPT-4): Document analysis & Q&A                │
│  • DeepL: Professional document translation                │
│  • WhatsApp Business API: Owner notifications              │
│  • Inngest: Background job processing                      │
│  • Vercel: Hosting & CDN                                  │
└─────────────────────────────────────────────────────────────┘
```

## 🏛️ Component Architecture

### Frontend Architecture (Atomic Design)

```
├── atoms/
│   ├── Button           # Base interactive elements
│   ├── Input            # Form controls
│   ├── Icon             # SVG icons with i18n
│   └── Typography       # Text components (RTL-aware)
├── molecules/
│   ├── TextField        # Input + Label + Validation
│   ├── NavItem          # Navigation elements
│   ├── Card             # Content containers
│   └── LanguageSwitcher # Locale switching
├── organisms/
│   ├── Header           # Site navigation
│   ├── DocumentList     # Document grid/list views
│   ├── DocumentUpload   # File upload interface
│   ├── Hero             # Landing page hero
│   └── AboutSection     # Content sections
├── templates/
│   ├── PublicLanding    # Public site layout
│   └── OwnerDashboard   # Authenticated layout
└── pages/
    ├── HomePage         # Public landing
    ├── OwnerLogin       # Authentication
    ├── PropertyDetail   # Property showcase
    └── ContactPage      # Contact form
```

### Backend Architecture (tRPC Routers)

```
src/lib/api/routers/
├── documents.ts         # Document CRUD & permissions (532 lines)
├── translations.ts      # AI translation workflow (154 lines)
├── users.ts            # User management & auth
├── [future] polls.ts   # Polls & voting system
├── [future] whatsapp.ts # WhatsApp integration
└── [future] qa.ts      # AI Q&A assistant
```

## 🗄️ Database Architecture

### Current Schema (Phase 1)
```sql
-- Core entities
users               # Authentication & profiles
documents           # File metadata & permissions
audit_log           # Action tracking
owner_registrations # New owner onboarding

-- Enums
UserRole            # admin, contentEditor, user
Language            # en, fr, ar
Permission          # granular permissions array
DocumentCategory    # bylaw, financial, maintenance, etc.
```

### Extended Schema (All Phases)
```sql
-- Phase 2 additions
document_summaries  # AI-generated summaries per language
document_versions   # Version history
search_index        # Full-text search optimization

-- Phase 3 additions
polls               # Community polls
poll_options        # Poll choices (multilingual)
votes               # Anonymous voting records
notifications       # Email/push notifications
user_preferences    # Notification settings

-- Phase 4 additions
whatsapp_contacts   # Phone number management
whatsapp_messages   # Message history & templates
qa_embeddings       # Vector embeddings for search
qa_conversations    # Q&A history & context
```

## 🔄 Data Flow Patterns

### Document Upload Flow
```
1. Client: File selection + metadata input
2. tRPC: Validation + permission check
3. Supabase: File upload to storage bucket
4. Database: Metadata insert with RLS
5. Background: AI processing (translation/summary)
6. Real-time: UI updates via subscriptions
```

### Translation Workflow
```
1. User: Request document translation
2. tRPC: Create translation job record
3. Inngest: Background worker picks up job
4. DeepL API: Professional translation
5. Database: Store translated content
6. UI: Real-time status updates
```

### Authentication Flow
```
1. Clerk: Frontend auth UI components
2. Supabase: Backend session management
3. RLS: Row-level security enforcement
4. tRPC: Permission validation per request
5. Audit: Action logging for compliance
```

## 🧪 Testing Architecture

### Test Structure (Leveraging Existing Infrastructure)
```
__tests__/
├── integration/         # Feature-level tests
│   ├── document-management.test.ts
│   ├── auth-flows.test.ts
│   └── admin-functionality.test.ts
├── security/           # RLS & permission tests
│   ├── document-rls.test.js
│   └── owner-registration-rls.test.js
└── [future] e2e/      # Playwright end-to-end tests
```

### Storybook Integration
```
src/stories/
├── atoms/              # Component documentation
├── molecules/          # Composition examples
├── organisms/          # Complex component demos
├── pages/              # Full page examples
└── utils/              # Testing utilities & providers
```

## 🔐 Security Architecture

### Authentication & Authorization
- **Frontend**: Clerk components for auth UI
- **Backend**: Supabase Auth for session management
- **Database**: Row Level Security (RLS) policies
- **API**: tRPC middleware for permission validation

### Permission Model
```typescript
type UserRole = 'admin' | 'contentEditor' | 'user'
type Permission = 
  | 'manageDocuments'
  | 'manageUsers' 
  | 'managePolls'
  | 'viewAuditLogs'
  | 'accessAdminUI'
```

### Data Protection
- **Encryption**: TLS in transit, AES-256 at rest
- **Access Control**: Role-based with granular permissions
- **Audit Trail**: All actions logged with user context
- **Privacy**: GDPR-compliant data handling

## 🚀 Deployment Architecture

### Development Environment
- **Local**: Next.js dev server + Supabase local
- **Staging**: Vercel preview + Supabase staging
- **Production**: Vercel + Supabase production

### CI/CD Pipeline
```yaml
1. Code Push → GitHub
2. Automated Tests → Jest + Playwright
3. Build Verification → Next.js build
4. Security Scan → Static analysis
5. Deploy Preview → Vercel staging
6. Manual Approval → Production deploy
```

## 📊 Performance Considerations

### Frontend Optimization
- **Code Splitting**: Automatic with App Router
- **Image Optimization**: Next.js Image component
- **Caching**: Static generation where possible
- **Bundle Analysis**: Regular size monitoring

### Backend Optimization
- **Database**: Indexed queries + connection pooling
- **API**: tRPC batching + caching
- **Storage**: CDN delivery for documents
- **Background Jobs**: Async processing for heavy tasks

## 🔮 Future Architecture Considerations

### Scalability Plans
- **Database**: Read replicas for scaling
- **Storage**: Multi-region CDN distribution
- **API**: Edge functions for global performance
- **Monitoring**: Comprehensive observability

### Technology Evolution
- **React**: Server Components adoption
- **Database**: Vector search for AI features
- **AI**: Local LLM deployment considerations
- **Mobile**: React Native app potential

---

This architecture provides a solid foundation for the current 300-user scale while positioning for future growth and feature expansion.