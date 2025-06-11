# Complete Database Schema

## 🎯 Overview

This document defines the complete database schema for all phases of the Costabeach project. The schema evolution is designed to support the existing foundation while adding new tables for document management, community features, and WhatsApp integration.

## 🏗️ Current Schema Analysis (Phase 1) ✅

### Existing Tables (from prisma/schema.prisma)

```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String?
  role            UserRole @default(user)
  permissions     Permission[]
  language        Language @default(en)
  whatsapp_opt_in Boolean  @default(false)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  // Relations
  documents       Document[]
  audit_logs      AuditLog[]
  owner_registration OwnerRegistration?

  @@map("users")
}

model Document {
  id          String           @id @default(cuid())
  title       String
  description String?
  file_path   String
  file_size   Int
  mime_type   String
  category    DocumentCategory
  language    Language         @default(en)
  uploaded_by String
  is_public   Boolean          @default(false)
  created_at  DateTime         @default(now())
  updated_at  DateTime         @updatedAt

  // Relations
  uploader    User       @relation(fields: [uploaded_by], references: [id])
  audit_logs  AuditLog[]

  @@map("documents")
}

model AuditLog {
  id          String   @id @default(cuid())
  user_id     String
  action      String
  resource    String
  resource_id String?
  details     Json?
  ip_address  String?
  user_agent  String?
  created_at  DateTime @default(now())

  // Relations
  user        User      @relation(fields: [user_id], references: [id])
  document    Document? @relation(fields: [resource_id], references: [id])

  @@map("audit_log")
}

model OwnerRegistration {
  id         String                    @id @default(cuid())
  user_id    String                    @unique
  status     OwnerRegistrationStatus   @default(pending)
  created_at DateTime                  @default(now())
  updated_at DateTime                  @updatedAt

  // Relations
  user       User @relation(fields: [user_id], references: [id])

  @@map("owner_registrations")
}

// Enums
enum UserRole {
  user
  contentEditor
  admin
}

enum Language {
  en
  fr
  ar
}

enum Permission {
  manageDocuments
  manageUsers
  managePolls
  viewAuditLogs
  accessAdminUI
  manageWhatsApp
  manageTranslations
}

enum DocumentCategory {
  bylaw
  financial
  maintenance
  announcement
  legal
  meeting_minutes
  other
}

enum OwnerRegistrationStatus {
  pending
  approved
  rejected
}
```

## 🚀 Phase 2: Document Management Extensions

### New Tables for Document Features

```prisma
// Document translation management
model DocumentTranslation {
  id                String              @id @default(cuid())
  document_id       String
  source_language   Language
  target_language   Language
  status            TranslationStatus   @default(pending)
  translated_content String?
  confidence_score  Float?
  service_used      String?             // 'deepl', 'openai', etc.
  job_id            String?             // External service job ID
  requested_by      String
  started_at        DateTime?
  completed_at      DateTime?
  error_message     String?
  created_at        DateTime            @default(now())
  updated_at        DateTime            @updatedAt

  // Relations
  document          Document            @relation(fields: [document_id], references: [id], onDelete: Cascade)
  requester         User                @relation(fields: [requested_by], references: [id])

  @@unique([document_id, target_language])
  @@map("document_translations")
}

// AI-generated document summaries
model DocumentSummary {
  id              String    @id @default(cuid())
  document_id     String
  language        Language
  summary_text    String
  key_points      String[]  // JSON array of key points
  word_count      Int
  reading_time    Int       // in minutes
  confidence      Float?
  generated_by    String    // AI service used
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  // Relations
  document        Document  @relation(fields: [document_id], references: [id], onDelete: Cascade)

  @@unique([document_id, language])
  @@map("document_summaries")
}

// Document versioning
model DocumentVersion {
  id                String   @id @default(cuid())
  document_id       String
  version_number    Int
  file_path         String
  file_size         Int
  changes_summary   String?
  uploaded_by       String
  created_at        DateTime @default(now())

  // Relations
  document          Document @relation(fields: [document_id], references: [id], onDelete: Cascade)
  uploader          User     @relation(fields: [uploaded_by], references: [id])

  @@unique([document_id, version_number])
  @@map("document_versions")
}

// Full-text search optimization
model DocumentSearchIndex {
  id              String    @id @default(cuid())
  document_id     String    @unique
  searchable_text String    // Extracted text content
  language        Language
  last_indexed    DateTime  @default(now())

  // Relations
  document        Document  @relation(fields: [document_id], references: [id], onDelete: Cascade)

  @@map("document_search_index")
}

enum TranslationStatus {
  pending
  in_progress
  completed
  failed
  cancelled
}
```

## 🗳️ Phase 3: Community Management

### Polls and Voting System

```prisma
// Community polls
model Poll {
  id                String            @id @default(cuid())
  question          String
  description       String?
  poll_type         PollType          @default(single_choice)
  status            PollStatus        @default(draft)
  is_anonymous      Boolean           @default(true)
  allow_comments    Boolean           @default(false)
  start_date        DateTime?
  end_date          DateTime?
  created_by        String
  created_at        DateTime          @default(now())
  updated_at        DateTime          @updatedAt

  // Relations
  creator           User              @relation(fields: [created_by], references: [id])
  options           PollOption[]
  votes             Vote[]
  translations      PollTranslation[]

  @@map("polls")
}

// Poll options/choices
model PollOption {
  id          String  @id @default(cuid())
  poll_id     String
  option_text String
  order_index Int
  created_at  DateTime @default(now())

  // Relations
  poll        Poll    @relation(fields: [poll_id], references: [id], onDelete: Cascade)
  votes       Vote[]

  @@map("poll_options")
}

// User votes (anonymous but tracked for one-per-user)
model Vote {
  id          String   @id @default(cuid())
  poll_id     String
  option_id   String
  user_id     String
  comment     String?
  created_at  DateTime @default(now())

  // Relations
  poll        Poll       @relation(fields: [poll_id], references: [id], onDelete: Cascade)
  option      PollOption @relation(fields: [option_id], references: [id], onDelete: Cascade)
  voter       User       @relation(fields: [user_id], references: [id])

  @@unique([poll_id, user_id]) // One vote per user per poll
  @@map("votes")
}

// Poll translations for multilingual support
model PollTranslation {
  id          String   @id @default(cuid())
  poll_id     String
  language    Language
  question    String
  description String?
  created_at  DateTime @default(now())

  // Relations
  poll        Poll     @relation(fields: [poll_id], references: [id], onDelete: Cascade)

  @@unique([poll_id, language])
  @@map("poll_translations")
}

enum PollType {
  single_choice
  multiple_choice
  yes_no
  rating
}

enum PollStatus {
  draft
  published
  closed
  archived
}
```

### Notification System

```prisma
// Notification templates and preferences
model NotificationTemplate {
  id          String              @id @default(cuid())
  name        String              @unique
  subject     String
  body        String
  type        NotificationType
  language    Language
  is_active   Boolean             @default(true)
  created_at  DateTime            @default(now())
  updated_at  DateTime            @updatedAt

  // Relations
  notifications Notification[]

  @@map("notification_templates")
}

// Individual notifications sent
model Notification {
  id              String                @id @default(cuid())
  template_id     String?
  user_id         String
  type            NotificationType
  channel         NotificationChannel
  subject         String
  body            String
  status          NotificationStatus    @default(pending)
  sent_at         DateTime?
  read_at         DateTime?
  error_message   String?
  metadata        Json?                 // Additional data for the notification
  created_at      DateTime              @default(now())

  // Relations
  template        NotificationTemplate? @relation(fields: [template_id], references: [id])
  user            User                  @relation(fields: [user_id], references: [id])

  @@map("notifications")
}

// User notification preferences
model NotificationPreference {
  id          String              @id @default(cuid())
  user_id     String
  type        NotificationType
  email       Boolean             @default(true)
  whatsapp    Boolean             @default(false)
  frequency   NotificationFrequency @default(immediate)
  created_at  DateTime            @default(now())
  updated_at  DateTime            @updatedAt

  // Relations
  user        User                @relation(fields: [user_id], references: [id])

  @@unique([user_id, type])
  @@map("notification_preferences")
}

enum NotificationType {
  document_uploaded
  document_translated
  poll_created
  poll_reminder
  poll_results
  system_announcement
  whatsapp_digest
  admin_action
}

enum NotificationChannel {
  email
  whatsapp
  in_app
}

enum NotificationStatus {
  pending
  sent
  delivered
  failed
  cancelled
}

enum NotificationFrequency {
  immediate
  daily
  weekly
  monthly
  disabled
}
```

## 💬 Phase 4: WhatsApp Integration

### WhatsApp Contact Management

```prisma
// WhatsApp contact information
model WhatsAppContact {
  id                String              @id @default(cuid())
  user_id           String              @unique
  phone_number      String              @unique
  country_code      String
  is_verified       Boolean             @default(false)
  verification_code String?
  opt_in_date       DateTime?
  opt_out_date      DateTime?
  status            WhatsAppStatus      @default(pending)
  last_message_at   DateTime?
  created_at        DateTime            @default(now())
  updated_at        DateTime            @updatedAt

  // Relations
  user              User                @relation(fields: [user_id], references: [id])
  messages          WhatsAppMessage[]
  digest_logs       WhatsAppDigestLog[]

  @@map("whatsapp_contacts")
}

// WhatsApp message history
model WhatsAppMessage {
  id              String              @id @default(cuid())
  contact_id      String
  direction       MessageDirection
  message_type    MessageType         @default(text)
  content         String
  template_name   String?             // For template messages
  template_data   Json?               // Template variable data
  whatsapp_id     String?             // WhatsApp's message ID
  status          MessageStatus       @default(pending)
  error_message   String?
  sent_at         DateTime?
  delivered_at    DateTime?
  read_at         DateTime?
  created_at      DateTime            @default(now())

  // Relations
  contact         WhatsAppContact     @relation(fields: [contact_id], references: [id])

  @@map("whatsapp_messages")
}

// WhatsApp digest delivery logs
model WhatsAppDigestLog {
  id              String              @id @default(cuid())
  contact_id      String
  digest_type     DigestType
  period_start    DateTime
  period_end      DateTime
  content_summary Json                // Summary of what was included
  message_id      String?             // Reference to WhatsAppMessage
  status          DigestStatus        @default(generated)
  sent_at         DateTime?
  created_at      DateTime            @default(now())

  // Relations
  contact         WhatsAppContact     @relation(fields: [contact_id], references: [id])

  @@map("whatsapp_digest_logs")
}

enum WhatsAppStatus {
  pending
  verified
  opted_in
  opted_out
  blocked
}

enum MessageDirection {
  inbound
  outbound
}

enum MessageType {
  text
  template
  document
  image
  interactive
}

enum MessageStatus {
  pending
  sent
  delivered
  read
  failed
}

enum DigestType {
  daily
  weekly
  monthly
  on_demand
}

enum DigestStatus {
  generated
  sent
  failed
  skipped
}
```

### Q&A Assistant (Vector Search)

```prisma
// Vector embeddings for semantic search
model DocumentEmbedding {
  id                String    @id @default(cuid())
  document_id       String
  chunk_index       Int       // For large documents split into chunks
  content_excerpt   String    // First 200 chars of the chunk
  embedding_vector  Float[]   // Vector embedding (1536 dimensions for OpenAI)
  language          Language
  metadata          Json?     // Additional context (page number, section, etc.)
  created_at        DateTime  @default(now())

  // Relations
  document          Document  @relation(fields: [document_id], references: [id], onDelete: Cascade)

  @@unique([document_id, chunk_index])
  @@map("document_embeddings")
}

// Q&A conversation history
model QAConversation {
  id              String              @id @default(cuid())
  user_id         String?             // Null for anonymous WhatsApp users
  whatsapp_contact_id String?         // For WhatsApp conversations
  session_id      String              // To group related questions
  language        Language            @default(en)
  started_at      DateTime            @default(now())
  last_activity   DateTime            @default(now())

  // Relations
  user            User?               @relation(fields: [user_id], references: [id])
  whatsapp_contact WhatsAppContact?   @relation(fields: [whatsapp_contact_id], references: [id])
  interactions    QAInteraction[]

  @@map("qa_conversations")
}

// Individual Q&A interactions
model QAInteraction {
  id                String          @id @default(cuid())
  conversation_id   String
  question          String
  answer            String
  sources_used      String[]        // Document IDs that provided context
  confidence_score  Float?
  response_time_ms  Int?
  tokens_used       Int?
  cost_cents        Int?            // API cost in cents
  feedback_rating   Int?            // 1-5 user rating
  feedback_comment  String?
  created_at        DateTime        @default(now())

  // Relations
  conversation      QAConversation  @relation(fields: [conversation_id], references: [id], onDelete: Cascade)

  @@map("qa_interactions")
}
```

## ⚙️ Phase 5: Production & System Settings

### System Configuration

```prisma
// Global system settings
model SystemSetting {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String
  description String?
  category    String
  is_public   Boolean  @default(false)  // Whether setting is visible to non-admins
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  @@map("system_settings")
}

// Feature flags for gradual rollouts
model FeatureFlag {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  is_enabled  Boolean  @default(false)
  rollout_percentage Int @default(0)  // 0-100 percentage rollout
  user_groups String[] // Which user groups have access
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  @@map("feature_flags")
}

// Application performance metrics
model PerformanceMetric {
  id          String   @id @default(cuid())
  metric_name String
  value       Float
  unit        String   // 'ms', 'bytes', 'count', etc.
  tags        Json?    // Additional metadata
  recorded_at DateTime @default(now())

  @@index([metric_name, recorded_at])
  @@map("performance_metrics")
}
```

## 🔧 Database Migration Strategy

### Migration Sequence

```sql
-- Phase 0: Foundation (Week 1)
-- Create all tables with proper indexes and constraints

-- Phase 2: Document Extensions (Week 2-4)
ALTER TABLE documents ADD COLUMN search_vector tsvector;
CREATE INDEX documents_search_idx ON documents USING gin(search_vector);
CREATE INDEX document_translations_status_idx ON document_translations(status);
CREATE INDEX document_summaries_language_idx ON document_summaries(language);

-- Phase 3: Community Features (Week 5-7)
CREATE INDEX polls_status_idx ON polls(status);
CREATE INDEX votes_poll_user_idx ON votes(poll_id, user_id);
CREATE INDEX notifications_user_status_idx ON notifications(user_id, status);

-- Phase 4: WhatsApp Integration (Week 8-11)
CREATE INDEX whatsapp_contacts_phone_idx ON whatsapp_contacts(phone_number);
CREATE INDEX whatsapp_messages_contact_idx ON whatsapp_messages(contact_id);
CREATE INDEX document_embeddings_vector_idx ON document_embeddings 
  USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);

-- Phase 5: Production Optimization (Week 12)
CREATE INDEX audit_log_created_at_idx ON audit_log(created_at);
CREATE INDEX performance_metrics_name_time_idx ON performance_metrics(metric_name, recorded_at);
```

### RLS Policies Update

```sql
-- Enhanced RLS policies for new tables

-- Document translations: Users can view their own requests, contentEditors can manage all
CREATE POLICY "Users can view own translation requests" ON document_translations
  FOR SELECT USING (requested_by = auth.uid());

CREATE POLICY "ContentEditors can manage translations" ON document_translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'contentEditor' OR role = 'admin')
    )
  );

-- Polls: Based on user role and poll status
CREATE POLICY "Users can view published polls" ON polls
  FOR SELECT USING (status = 'published');

CREATE POLICY "ContentEditors can manage polls" ON polls
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'contentEditor' OR role = 'admin')
    )
  );

-- WhatsApp: Strict privacy controls
CREATE POLICY "Users can only access own WhatsApp data" ON whatsapp_contacts
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view WhatsApp metrics" ON whatsapp_digest_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
```

## 📊 Performance Optimization

### Indexing Strategy

```sql
-- Primary indexes for performance
CREATE INDEX CONCURRENTLY idx_documents_category_created ON documents(category, created_at DESC);
CREATE INDEX CONCURRENTLY idx_audit_log_user_action ON audit_log(user_id, action);
CREATE INDEX CONCURRENTLY idx_notifications_user_unread ON notifications(user_id) 
  WHERE read_at IS NULL;

-- Full-text search indexes
CREATE INDEX CONCURRENTLY idx_documents_fulltext ON documents 
  USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Vector similarity search (for Phase 4)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX CONCURRENTLY idx_embeddings_vector ON document_embeddings 
  USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
```

### Connection Pooling and Scaling

```javascript
// Supabase connection optimization
const supabaseConfig = {
  db: {
    pool: {
      max: 20,        // Maximum connections
      min: 5,         // Minimum connections
      idle: 10000,    // Close connections after 10s idle
      acquire: 60000, // Maximum time to get connection
    }
  }
};
```

## 🎯 Success Criteria

### Schema Validation Checklist ✅
- [ ] All existing data preserved during migrations
- [ ] RLS policies prevent unauthorized access
- [ ] Indexes support expected query patterns
- [ ] Foreign key constraints maintain data integrity
- [ ] Multilingual support for user-facing content
- [ ] Audit trail for all sensitive operations

### Performance Targets ✅
- [ ] Document queries: <100ms for standard operations
- [ ] Search queries: <200ms for full-text search
- [ ] User dashboard: <300ms for complete page load
- [ ] Vector similarity search: <500ms for Q&A queries
- [ ] Concurrent users: Support 300+ simultaneous connections

---

This complete schema provides the foundation for all Costabeach features while maintaining performance, security, and scalability for the target user base of 300+ property owners.