# Costabeach Owner Coordination Platform – Product Requirements Document

## Overview
Costabeach is a web-based platform for a condominium Homeowners Association (HOA) in Morocco, designed to facilitate communication and coordination among property owners. The platform provides a **private owner portal** for registered condo owners (about 300 users) to access HOA documents, announcements, and interactive features, alongside a **public-facing site** showcasing the property for visitors or prospective buyers.

## Goals
1. Centralize HOA Information
2. Facilitate Owner Engagement
3. Multilingual Accessibility (French & Arabic)
4. Empower “Comité de Suivi” volunteers
5. Seamless Communication & Alerts (WhatsApp)
6. Use of Proven Technologies

## Features
### 1. Document Management
- Secure upload/download via Supabase Storage
- In-browser preview (PDF.js)
- Metadata: title, category, language, author, timestamps
- Versioning & audit logs
- RLS for private access

### 2. Multilingual Support
- Next.js i18n routing (`/fr`, `/ar`)
- UI translation via `next-intl`
- Content linked across languages
- RTL layout support

### 3. Document Translation & Summaries
- AI-powered translation (tRPC mutation + background worker)
- Auto-generated summaries (GPT-4 via `aiClient`)
- Stored per-language summaries
- UI indicators for in-progress and ready states

### 4. Polls & Voting
- Create/manage polls (question + options in multiple languages)
- Anonymous voting, one vote per owner
- Visual results (Chart.js)
- Permission checks (committee vs owner)

### 5. WhatsApp Integration
- Phone linking & opt-in
- Weekly/daily digests via WhatsApp Business API
- Deep links to portal content
- Logging & opt-out support

### 6. WhatsApp Q&A Assistant
- Embedding-based search over documents
- LLM-driven answers in preferred language
- Incoming webhook handling & response via WhatsApp API
- Permission-enforced content access

## Existing Implementation
- **Next.js 14 + TypeScript**, Atomic Design system
- **Supabase** (Postgres, Auth, RLS) + **Prisma** migrations
- **Clerk** for front-end auth UI; Supabase Auth for sessions
- Document upload/download UI & hooks (tRPC)
- i18n framework and middleware in place
- Roles (`user`, `contentEditor`, `admin`) and permission arrays
- Basic audit_logs, owner_registrations, allowlist tables

## Gaps & Tasks
- **Document viewer & full-text search** integration
- **Complete AI translation** workflow & UI
- **Implement summaries** storage & display
- **Build polls module** (schema + UI + charts)
- **Admin UI** for user/committee management
- **WhatsApp notifications** (digest scripts + templates)
- **WhatsApp Q&A** (vector store + webhook + AI pipeline)

## Data Schema Updates
- Add `document_summaries` table (document_id, language, summary_text)
- Create `polls`, `poll_options`, `votes` tables with i18n
- Refine `information` translations link (UUID FK)
- Add `whatsapp_opt_in` boolean in `users`
- Define permission strings: `manageDocuments`, `manageUsers`, `managePolls`, etc.

## Roles & Permissions
- **Owner**: view/download, vote, request translations, Q&A
- **Comité de Suivi** (`contentEditor`): manage docs/posts, approve registrations, create polls
- **Admin**: all permissions + role management

## Roadmap
| Phase | Focus & Deliverables | ETA |
|-------|----------------------|-----|
| Phase 1 (✅) | Stack & MVP: auth, atomic UI, doc upload/download, i18n. | Completed |
| Phase 2 (🔄) | Document viewer, translation, summaries, announcements. | Aug 2025 |
| Phase 3 (🚧) | Polls/voting, admin UI, email/WhatsApp alerts, mobile PWA. | Oct 2025 |
| Phase 4 (🚧) | WhatsApp digests, Q&A bot, AI in-portal Q&A, testing & scaling. | Dec 2025 |