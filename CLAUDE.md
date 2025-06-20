# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server (usually on port 3000, but may use 3001 if 3000 is occupied)
- `npm run build` - Build production version with Prisma generation
- `npm run lint` - Run Next.js linter
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

### Database Operations
- `npx prisma migrate dev` - Create and apply new migrations (never use `npx prisma db push`)
- `npx prisma generate` - Generate Prisma client
- `npx prisma studio` - Open Prisma Studio database viewer

### Storybook
- `npm run storybook` - Start Storybook development server on port 6006
- `npm run build-storybook` - Build static Storybook

### WhatsApp Testing Scripts
Multiple WhatsApp testing scripts available:
- `npm run whatsapp:test` - Test WhatsApp groups functionality
- `npm run whatsapp:debug` - Debug WhatsApp integration
- `npm run whatsapp:demo` - Run WhatsApp demo
- `npm run whatsapp:test-assistant` - Test WhatsApp assistant functionality

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Prisma adapter
- **Styling**: Tailwind CSS v4 with Framer Motion
- **Type Safety**: TypeScript + tRPC for end-to-end type safety
- **Testing**: Jest with React Testing Library
- **File Storage**: AWS S3 integration
- **Notifications**: react-toastify + WhatsApp Business API

### Core Application Structure

**Multi-language Community Portal** with three supported locales:
- French (fr) - Default language
- Arabic (ar) - RTL support
- English (en)

**User Roles & Permissions System**:
- Admin users have full system access
- Permission-based access control with granular categories:
  - User Management (MANAGE_USERS, VIEW_USERS, APPROVE_REGISTRATIONS)
  - Document Management (category-specific permissions)
  - System Administration (MANAGE_SETTINGS, VIEW_AUDIT_LOGS)
  - WhatsApp Management (MANAGE_WHATSAPP, SEND_WHATSAPP_MESSAGES)

### Directory Structure

```
app/                          # Next.js App Router
├── [locale]/                 # Internationalized routes
├── admin/                    # Admin dashboard pages
├── api/                      # API routes
└── auth/                     # Authentication pages

src/
├── components/               # UI components (use "use client" when needed)
├── lib/
│   ├── api/routers/         # tRPC routers
│   ├── auth/                # NextAuth.js configuration
│   ├── i18n/                # Internationalization
│   ├── services/            # Business logic services
│   ├── utils/               # Shared utilities
│   └── types.ts             # Global TypeScript types
└── stories/                 # Storybook stories

prisma/
└── schema.prisma            # Database schema
```

### Key Components

**Authentication Flow**:
- NextAuth.js with email and Google providers
- Prisma adapter for user session management
- Role-based access control integrated with database

**Document Management System**:
- AWS S3 integration for file storage
- Category-based document organization (Comité de Suivi, Société de Gestion, Legal, Finance, General)
- Multi-language document support
- Audit logging for all document operations

**WhatsApp Integration**:
- Business API integration for community notifications
- Group management functionality
- Message templates and automated responses
- Assistant functionality for common queries

**Internationalization**:
- Route-based locale detection (`/fr/`, `/ar/`, `/en/`)
- RTL support for Arabic
- JSON translation files in `src/lib/i18n/locales/`

### Important Implementation Details

**Development Notes**:
- Use the safe version of i18n tools as per @docs/i18n-automation.md 

**Database Design**:
- Uses snake_case in database, camelCase in TypeScript
- Row Level Security (RLS) enabled for sensitive tables
- User permissions stored as JSON array in user table

**CRITICAL RULE: Prisma Property Naming Consistency** ✅ FIXED:

**ALL models now use consistent camelCase with @map() directives!**

✅ **UNIFIED NAMING PATTERN** - All Prisma models follow this pattern:
- **TypeScript/JavaScript**: Always use camelCase (e.g., `createdAt`, `isPublic`, `pollType`)  
- **Database**: Always uses snake_case via @map() directives (e.g., `created_at`, `is_public`, `poll_type`)
- **Clean separation**: Application code stays readable, database follows conventions

✅ **EXAMPLES**:
```typescript
// ✅ CORRECT - Always use camelCase in TypeScript
await prisma.documents.create({
  data: {
    title: "Document",
    filePath: "/path/to/file",
    createdBy: userId,
    isPublic: true
  }
})

// ✅ CORRECT - Relations use camelCase  
await prisma.polls.findMany({
  include: { 
    options: true,  // NOT poll_options
    votes: true     // NOT poll_votes
  }
})

// ❌ NEVER do this anymore
await prisma.documents.create({
  data: {
    file_path: "/path",  // WRONG - use filePath
    created_by: userId   // WRONG - use createdBy
  }
})
```

**COMPREHENSIVE ENFORCEMENT RULES**:

1. **FIELD NAMING** - Always use camelCase in TypeScript:
   - ✅ `createdAt`, `updatedAt`, `createdBy`
   - ✅ `filePath`, `fileType`, `fileSize`  
   - ✅ `isPublic`, `isAnonymous`, `isVerifiedOwner`
   - ✅ `pollType`, `pollId`, `optionText`, `orderIndex`
   - ❌ NEVER: `created_at`, `file_path`, `is_public`, `poll_type`

2. **MODEL RELATIONS** - Use camelCase relation names:
   - ✅ `prisma.polls.findMany({ include: { options: true, votes: true } })`
   - ✅ `prisma.documents.findMany({ include: { user: true } })`
   - ❌ NEVER: `poll_options`, `poll_votes`, `created_by_user`

3. **WHERE CLAUSES** - All field references use camelCase:
   - ✅ `where: { createdBy: userId, isPublic: true }`
   - ✅ `where: { pollType: 'single_choice', endDate: { gte: new Date() } }`
   - ❌ NEVER: `where: { created_by: userId, is_public: true }`

4. **UNIQUE CONSTRAINTS** - Check schema for exact constraint names:
   - ✅ `poll_id_language: { poll_id: "123", language: "fr" }`
   - ✅ Schema defines the constraint name, NOT the TypeScript field name

5. **VALIDATION CHECKLIST** - Before any Prisma operation:
   - [ ] Check schema for correct camelCase field names
   - [ ] Verify relation names are camelCase
   - [ ] Confirm unique constraint names match schema exactly
   - [ ] Test with `npm run build` to catch errors early

6. **ERROR RECOVERY** - If you encounter snake_case errors:
   - Step 1: Check `prisma/schema.prisma` for the correct camelCase name
   - Step 2: Update TypeScript code to use camelCase
   - Step 3: Re-run `npm run build` to verify fix
   - Step 4: NEVER add @map() directives - they're already consistent

**ZERO TOLERANCE POLICY** - Any snake_case in TypeScript Prisma operations is an error that must be fixed immediately!

**tRPC Integration**:
- API routers in `src/lib/api/routers/`
- Client-side usage via `@/lib/trpc/react`
- Zod validation for all inputs
- `publicProcedure` vs `protectedProcedure` patterns

**Permission System**:
- Granular permissions defined in `src/lib/types.ts` Permission enum
- `checkPermission` utility in `src/lib/utils/permissions.ts`
- Admin users automatically have all permissions
- Audit logging for all permission changes

**Security Considerations**:
- Server-side permission validation in all API endpoints
- Prevention of privilege escalation (non-admins cannot grant admin privileges)
- Self-modification protection (users cannot change their own admin status)
- Comprehensive audit trails for sensitive operations

### Development Guidelines

**Component Development**:
- Use functional components with TypeScript interfaces
- Apply `"use client"` directive only when needed
- Use Tailwind CSS for styling (never Radix or shadcn)
- Prefer lucide-react for icons

**Database Operations**:
- Always use Prisma migrations (`npx prisma migrate dev`)
- Never use raw SQL queries
- Follow snake_case → camelCase conversion pattern

**Testing**:
- Place tests in `__tests__/` directories next to source files
- Use Jest with React Testing Library
- Security tests in `__tests__/security/`

**State Management**:
- React Query (TanStack Query) via tRPC for server state
- Local state with React hooks
- Toast notifications with react-toastify

**File Organization**:
- Shared utilities in `src/lib/utils/shared.ts` (client) or `src/lib/utils/server.ts` (server)
- Business logic in `src/lib/services/`
- Type definitions in `src/lib/types.ts`

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database connection for migrations
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `NEXTAUTH_URL` - Application URL
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `RESEND_API_KEY` - Email service
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` - S3 storage
- WhatsApp Business API credentials for messaging functionality

### Debugging & Troubleshooting
- Use `npm run build` to check for TypeScript compilation errors
- Check database connection with `npx prisma studio`
- WhatsApp functionality can be tested with dedicated npm scripts
- Storybook available for component development and testing