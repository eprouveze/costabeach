# Developer Brief: Costabeach Dev Agent

## Purpose
Provide a clear, actionable set of tasks for the development agent to implement remaining features of the Costabeach Owner Portal, following the PRD.

## Key Responsibilities
1. **Document Viewer & Search**
   - Integrate PDF.js for in-app document viewing.
   - Extract text on upload; index using MeiliSearch or Postgres full-text search.
   - Implement search UI on Owner Dashboard.

2. **AI Translation & Summaries**
   - Finalize tRPC `translations.requestDocumentTranslation` & background worker.
   - Build summary-generation service via `aiClient` using GPT-4.
   - Store results in `document_summaries` table; update UI.

3. **Polls & Voting Module**
   - Create Prisma migrations for `polls`, `poll_options`, `votes`.
   - Develop Poll Admin UI (create/close polls) and Owner voting UI.
   - Integrate Chart.js for results display; enforce one vote per user.

4. **Admin/Comité de Suivi UI**
   - Build `Manage Owners` page: approve/reject registrations, edit roles.
   - Implement role-based component rendering based on `permissions` array.
   - Send email invites via Resend API on approval.

5. **WhatsApp Integration**
   - Set up Twilio or WhatsApp Cloud API client.
   - Write scheduled job for digest messages (weekly/urgent).
   - Add webhook handler for incoming Q&A; route through AI pipeline.

6. **Testing & Documentation**
   - Expand Storybook with new components (Polls, Viewer, Admin forms).
   - Write unit and integration tests for critical workflows.
   - Update README with setup steps (including env vars for WhatsApp API).

## Timeline & Milestones
- **Sprint 1 (2 weeks):** Document viewer, basic search.
- **Sprint 2 (2 weeks):** AI translation & summaries.
- **Sprint 3 (2 weeks):** Polls module and charts.
- **Sprint 4 (2 weeks):** Admin UI & registration flow.
- **Sprint 5 (3 weeks):** WhatsApp digest & Q&A integration.
- **Sprint 6 (2 weeks):** Testing, polishing, deployment.

## Environment & Tools
- **Tech Stack:** Next.js 14, TypeScript, Prisma, Supabase, Tailwind CSS
- **AI Services:** OpenAI GPT-4 (via `aiClient`), Embeddings storage
- **WhatsApp API:** Twilio WhatsApp API or Meta Cloud API
- **Search:** MeiliSearch or Supabase full-text search
- **CI/CD:** GitHub Actions for tests & deployments

## Acceptance Criteria
- All functionality matches PRD requirements.
- 100% test coverage on new modules.
- Multilingual support tested in FR & AR.
- Successful end-to-end demonstration: login → view & search docs → vote in poll → receive WhatsApp digest → ask question via WhatsApp bot.