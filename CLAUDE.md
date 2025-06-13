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

**Database Design**:
- Uses snake_case in database, camelCase in TypeScript
- Row Level Security (RLS) enabled for sensitive tables
- User permissions stored as JSON array in user table

**CRITICAL RULE: Prisma Property Naming Consistency**:
When working with Prisma models and database operations, ALWAYS use camelCase property names in TypeScript/JavaScript code, even if the database uses snake_case. Prisma automatically handles the conversion between camelCase (TypeScript) and snake_case (database) via the @map() directive in the schema.

Examples:
- ✅ user.isAdmin (NOT user.is_admin)
- ✅ user.createdAt (NOT user.created_at)
- ✅ user.updatedAt (NOT user.updated_at)
- ✅ user.isVerifiedOwner (NOT user.is_verified_owner)
- ✅ user.preferredLanguage (NOT user.preferred_language)
- ✅ user.buildingNumber (NOT user.building_number)

Apply this rule to:
- Prisma queries (findMany, update, create, etc.)
- API route data objects
- TypeScript interfaces
- All database operations

When in doubt, check the Prisma schema file to see the correct camelCase property names.

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