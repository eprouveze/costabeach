# Costa Beach HOA Portal Development Plan

## Overview

This development plan outlines the transformation of the Costa Beach application from a property rental marketplace to an HOA information portal. The plan follows Test-Driven Development (TDD) methodology with comprehensive testing for each phase.

## 🎯 Development Tracking

| Phase | Status | Tests | Progress | Key Features |
|-------|--------|-------|----------|-------------|
| **Phase 0** | ✅ Complete | 100% | ✅ | Foundation infrastructure, database schema, AI testing |
| **Phase 1** | ✅ Complete | 100% | ✅ | Next.js i18n, AWS S3, file management, owner registration |
| **Phase 2** | ✅ Complete | 28/28 | ✅ | AI translation workflow, DeepL integration |
| **Phase 3** | ✅ Complete | 43/43 | ✅ | Community polls + multilingual translation system |
| **Phase 4** | 🔄 Next | Ready | 0% | WhatsApp Business API integration |
| **Phase 5** | ⏳ Planned | - | 0% | Q&A system & vector search |

**Overall Progress**: 4/5 phases complete (80%) | **Total Tests**: 71/71 passing (100%)

**Latest Achievement**: ✅ **Poll Translation System with RTL Support**
- Complete multilingual interface (French ↔ Arabic)
- RTL layout support for Arabic content
- Automatic AI translation workflow
- Production-ready implementation

**Recent UI Improvements** (2025-01-06):
- Fixed dark mode background colors in document components
- Changed `dark:bg-gray-800` to `dark:bg-gray-700` for lighter backgrounds
- Updated `dark:bg-blue-900` to `dark:bg-blue-600` for better visibility
- Improved contrast and readability in dark mode across DocumentCard, DocumentPreview, DocumentUpload, DocumentEdit, and Card components

## 🔧 Development Process Rules

### **Test-Driven Development (TDD)**
1. **Red-Green-Refactor**: Write failing tests first, implement code to pass, then refactor
2. **100% Test Coverage**: All service layers must have complete test coverage
3. **Integration Testing**: API endpoints tested with authentication and validation
4. **Component Testing**: UI components tested for logic and user interactions

### **Quality Standards**
- Follow established patterns in the codebase
- Include proper error handling and validation
- Ensure accessibility compliance (ARIA labels, keyboard navigation)
- Implement proper internationalization (French/Arabic with RTL support)
- Document all features in Storybook with interactive examples

### **Git Workflow**
- Use semantic commit messages with clear descriptions
- Run `npm test` and `npm run build` before committing
- Update documentation and mark sections complete only after tests pass
- Create commits for each completed major section

## 📋 **Current Status Summary**

### ✅ **Completed Phases (100% Tested)**

**Phase 0: Foundation Infrastructure**
- Enhanced testing infrastructure with comprehensive mocking
- Complete database schema for all phases
- AI testing framework for reliable TDD

**Phase 1: Core Infrastructure**  
- Next.js i18n setup with Arabic RTL support
- AWS S3 integration for file management
- Owner registration and approval workflow
- Translation infrastructure foundation

**Phase 2: AI Translation Workflow**
- Complete translation service with DeepL/OpenAI integration
- RESTful API endpoints with authentication
- Translation request UI components
- Background job processing with Inngest

**Phase 3: Community Polls & Translation System**
- Full polls system (creation, voting, statistics)
- Multilingual poll interface with RTL support
- Automatic AI translation workflow
- Permission-based translation management

### 🔄 **Next: Phase 4 WhatsApp Integration**
- WhatsApp Business API setup
- Message templates & automation
- Weekly digest delivery system
- AI-powered Q&A assistant via WhatsApp
- Contact management with opt-in/opt-out

---

## 📚 **Detailed Implementation Reference**

> **Note**: The sections below contain detailed implementation notes for reference. Active development follows the phase-based approach above.

## 1. Completed Core Infrastructure

### 1.1 Document Schema ✅
- [x] Create `Document` table with fields for title, description, file path, category, language, etc.
- [x] Create `DocumentCategory` enum or table
- [x] Add language reference fields
- [x] Add timestamps and author information

**Implementation Details:**
- The Document model should include fields for tracking view and download counts
- Each document should be linked to its author (User model)
- Documents should support translations with a self-referential relationship
- File metadata should include size, type, and path to S3 storage

**Tests:**
- [x] Unit tests for model validation
- [x] Prisma query tests for document retrieval
- [x] Test multi-language document storage

**Testing Instructions:**
- Run `npm test -- --testPathPattern=Document` to verify model tests
- Verify that document relationships work correctly
- Ensure view and download counts increment properly

**Storybook:**
- [x] Create Storybook documentation for database schema

### 1.2 User Permissions Schema ✅
- [x] Update `User` model with permission fields
- [x] Create `Role` enum or table (Admin, ContentEditor, Owner)
- [x] Add category-specific permission fields

**Implementation Details:**
- Permissions should be implemented as an enum array in the User model
- Specific permissions should include: manageUsers, manageDocuments, manageComiteDocuments, manageSocieteDocuments, manageLegalDocuments, approveRegistrations
- User roles should be: user, admin, contentEditor
- Each role should have default permissions assigned

**Tests:**
- [x] Unit tests for permission validation
- [x] Integration tests for permission enforcement
- [x] Test role assignment functionality

**Testing Instructions:**
- Run `npm test -- --testPathPattern=permissions` to verify permission tests
- Create test users with different roles and verify correct access control
- Test permission changes and role assignments

**Storybook:**
- [x] Create Storybook documentation for permission system

### 1.3 Next.js i18n Setup ✅
- [x] Configure Next.js internationalization
- [x] Set up language detection and routing
- [x] Create language switcher component

**Implementation Details:**
- Configure i18n in next.config.ts with supported locales (fr, ar)
- Implement middleware for language detection from cookies, headers, and user preferences
- Create a reusable LanguageSwitcher component with dropdown and button variants
- Ensure RTL support for Arabic language
- Implement click outside functionality for dropdown menu
- Add proper handling for RTL positioning of dropdown menu
- Enhance LanguageSwitcher component with proper RTL support for dropdown positioning
- Implement click outside functionality for dropdown menus to improve user experience

**Tests:**
- [x] Test language detection
- [x] Test route generation with language prefixes
- [x] Test language persistence
- [x] Test LanguageSwitcher dropdown and buttons variants
- [x] Test click outside functionality for dropdown menu
- [x] Test RTL support for dropdown positioning

**Testing Instructions:**
- Run `npm test -- --testPathPattern=i18n` to verify i18n functionality
- Test manual language switching in the browser
- Verify RTL layout for Arabic language
- Test cookie persistence across sessions

**Storybook:**
- [x] Create Storybook stories for language switcher component
- [x] Document i18n usage patterns

### 1.4 Translation Infrastructure ✅
- [x] Create translation files (JSON/YAML)
- [x] Implement translation hooks and components
- [x] Configure fallback language handling

**Implementation Details:**
- Create separate JSON files for each language (fr.json, ar.json, en.json)
- Organize translations by feature area (common, auth, documents, admin)
- Implement useI18n hook for accessing translations in client components
- Add fallback to default locale when translations are missing
- Improved I18nProvider with static imports for more reliable translation loading
- Added extensive logging and debugging to help diagnose translation issues
- Enhanced error handling for missing translation keys

**Tests:**
- [x] Test translation loading
- [x] Test component rendering with translations
- [x] Test fallback behavior

**Testing Instructions:**
- Run `npm test -- --testPathPattern=translations` to verify translation functionality
- Verify fallback behavior with missing translations
- Test translation hook in both client and server components

**Storybook:**
- [x] Create Storybook stories for translated components
- [x] Document translation hook usage

### 1.5 DeepL Translation Service ✅
- [x] Create translation API endpoint
- [x] Implement DeepL integration for text translation
- [x] Add caching mechanism for translations

**Implementation Details:**
- Created a comprehensive translation service with DeepL integration
- Implemented in-memory caching to avoid redundant API calls
- Added background job processing with Inngest for document translations
- Created tRPC endpoints for text and document translation

**Tests:**
- [x] Test translation API functionality
- [x] Test caching behavior
- [x] Test error handling for API failures

**Testing Instructions:**
- Create test documents in each supported language
- Test translation requests with varying content lengths
- Verify cache hits and misses work correctly
- Test error handling with invalid inputs or API failures

**Storybook:**
- [x] Document translation service workflow

### 1.6 AWS S3 Configuration ✅
- [x] Configure S3 bucket policies
- [x] Set up CORS and security settings
- [x] Create environment variables

**Implementation Details:**
- Set up AWS S3 client with proper region and credentials
- Configure environment variables for AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and BUCKET_NAME
- Implement utility functions for generating S3 file paths and signed URLs

**Tests:**
- [x] Test S3 connectivity
- [x] Test permission enforcement
- [x] Test CORS configuration

**Testing Instructions:**
- Run mocked S3 tests with `npm test -- --testPathPattern=s3`
- Verify connection to real S3 bucket in development environment
- Test CORS behavior with cross-origin requests
- Verify proper error handling for S3 errors

**Storybook:**
- [x] Document S3 integration architecture

### 1.7 File Upload Service ✅
- [x] Create file upload component
- [x] Implement secure file upload to S3
- [x] Add file type validation and security checks

**Implementation Details:**
- Create a reusable DocumentUpload component with drag-and-drop functionality
- Implement two-step upload process: get signed URL, then upload directly to S3
- Add progress tracking for uploads
- Validate file types and sizes before upload

**Tests:**
- [x] Test file upload workflow
- [x] Test format validation
- [x] Test error handling

**Testing Instructions:**
- Test uploads with valid and invalid file types
- Verify size limit enforcement
- Test cancellation and resume functionality if implemented
- Verify progress tracking accuracy

**Storybook:**
- [x] Create Storybook stories for file upload component
- [x] Document upload workflow

### 1.8 File Access and Preview ✅
- [x] Implement secure file access through signed URLs
- [x] Create PDF/document preview functionality
- [x] Add download functionality

**Implementation Details:**
- Generate time-limited signed URLs for file downloads
- Implement document preview for common file types (PDF, images, text)
- Track download and view counts for analytics
- Add client-side caching for frequently accessed documents
- Created custom mock implementation for Storybook to ensure proper rendering without tRPC context
- Optimized component display for desktop and mobile viewing

**Tests:**
- [x] Test file retrieval
- [x] Test preview rendering
- [x] Test download functionality

**Testing Instructions:**
- Verify signed URL generation for different file types
- Test preview rendering for PDFs, images, and text documents
- Verify view and download count incrementation
- Test URL expiration behavior

**Storybook:**
- [x] Create Storybook stories for document preview component
- [x] Enhanced document preview stories with proper desktop layout and responsive sizing
- [x] Implemented mock component for Storybook that doesn't require tRPC context

### 1.9 Owner Registration Flow ✅
- [x] Update owner registration and approval workflow
- [x] Add language preference selection
- [x] Enhance admin review interface

**Implementation Details:**
- Create a multi-step registration form for owners
- Implement email verification
- Add admin approval workflow with notifications
- Store building and apartment information
- Allow admins to add notes and approve/reject registrations
- Send email notifications for registration status changes

> **Note for Supabase Migration:** This flow will need to be updated to use Supabase authentication instead of NextAuth. User registration data will be stored in Supabase Auth, with additional metadata stored in the database. See Section 8.5 for migration details.

**Tests:**
- [x] Test registration workflow
- [x] Test approval process
- [x] Test email notifications

**Testing Instructions:**
- Test the complete registration flow from start to finish
- Verify email verification works correctly
- Test admin approval and rejection
- Check email notifications for all status changes

**Storybook:**
- [x] Create Storybook stories for registration components
- [x] Document approval workflow

## 2. Completed Public Area Components

### 2.1 Landing Page Redesign ✅
- [x] Remove property search functionality
- [x] Create promotional content for Costa Beach 3
- [x] Add multilingual support to landing page

**Implementation Details:**
- Design a clean, informative landing page focused on the HOA portal
- Include sections for key features and benefits
- Ensure all content is available in both French and Arabic
- Add clear call-to-action for owner registration

**Tests:**
- [x] Test responsive design
- [x] Test language switching
- [x] Test navigation elements

**Testing Instructions:**
- Test responsiveness on mobile, tablet, and desktop
- Verify all content is translated correctly
- Check loading performance and Core Web Vitals
- Test all CTAs and interactive elements

**Storybook:**
- [x] Create Storybook stories for landing page components
- [x] Document responsive behavior
- [x] Enhanced Storybook stories with responsive viewport demonstrations (Mobile, Tablet, Desktop)
- [x] Added comprehensive responsive design documentation in Storybook

### 2.2 Navigation Structure ✅
- [x] Update header and navigation components
- [x] Simplify routing structure
- [x] Add language-aware navigation

**Implementation Details:**
- Create a simplified navigation structure with Home, About, Contact, and Login/Register
- Implement role-based navigation items for authenticated users
- Ensure navigation labels are properly translated
- Add visual indicators for current page

> **Note for Supabase Migration:** Role-based navigation will need to be updated to use Supabase session and user metadata instead of NextAuth session data. See Section 8.5 for integration details.

**Tests:**
- [x] Test navigation functionality
- [x] Test mobile responsiveness
- [x] Test active state highlighting

**Testing Instructions:**
- Test navigation for all user roles
- Verify correct highlighting of active pages
- Test mobile menu toggle and responsive behavior
- Check keyboard accessibility

**Storybook:**
- [x] Create Storybook stories for navigation components
- [x] Document navigation patterns

### 2.3 Contact Page Update ✅
- [x] Update contact page with HOA-specific information
- [x] Add multilingual support to contact forms
- [x] Implement form validation

**Implementation Details:**
- Create a contact form with fields for name, email, subject, and message
- Add dropdown for selecting the department/recipient
- Implement client and server-side validation
- Send notification emails to administrators
- Enhanced Arabic and French translations with complete department options, contact information, and validation messages
- Fixed translation loading issues in locale-specific contact pages
- Added debug logging to help troubleshoot translation display issues

**Tests:**
- [x] Test form submission
- [x] Test validation messages
- [x] Test i18n of form elements

**Testing Instructions:**
- Test form submission with valid and invalid data
- Verify validation errors are displayed correctly and translated
- Test email delivery to administrators
- Check handling of special characters in different languages

**Storybook:**
- [x] Create Storybook stories for contact form components
- [x] Document form validation patterns

### 2.4 Hero Section ✅
- [x] Create multilingual hero section with high-quality image of Costa Beach 3
- [x] Implement welcome message in French and Arabic
- [x] Add brief community description
- [x] Create clear call-to-action for owner login/registration

**Implementation Details:**
- Designed a responsive hero section with a beautiful blue gradient background
- Created multilingual welcome heading with property branding
- Added concise, impactful description that communicates the portal's purpose
- Implemented prominent CTA buttons for owners to access the portal
- Ensured proper responsive behavior on all device sizes

**Tests:**
- [x] Test responsive layout on various screen sizes
- [x] Test translations in French and Arabic
- [x] Test CTA button functionality and tracking

**Testing Instructions:**
- Verify hero section appearance on mobile, tablet, and desktop devices

**Storybook:**
- [x] Create Storybook stories for hero section component
- [x] Document responsive behavior and language variants

### 2.5 About Costa Beach 3 Section ✅
- [x] Import and adapt existing "About" content from WordPress site
- [x] Add visual elements showcasing the property
- [x] Include community history and description
- [x] Highlight special features and amenities

**Implementation Details:**
- Created an "About" section with comprehensive content about Costa Beach 3
- Implemented a responsive layout with text and image placement using Tailwind CSS
- Added property highlights with visual indicators for modern architecture, beachfront access, premium amenities, and prime location
- Included community history and special features sections
- Created a community highlights section with services and lifestyle information
- Ensured all content is available in English, French, and Arabic with complete translations
- Used responsive grid layout for feature display on different screen sizes

**Tests:**
- [x] Test content display at various screen sizes
- [x] Test image loading and optimization
- [x] Test translations of imported content

**Testing Instructions:**
- Verify content is properly formatted and displays correctly on all devices
- Test image loading performance and responsive resizing
- Ensure all migrated content is properly translated and displays correctly

**Storybook:**
- [x] Create Storybook stories for About section component
- [x] Document content layout patterns and responsive behavior

## 3. Completed Document Management System

### 3.1 Document Browser ✅
- [x] Create document browser component
- [x] Implement filtering by category and date
- [x] Add search functionality

**Implementation Details:**
- Implement DocumentList component that displays documents in a grid or list view
- Add filtering by category, language, and date range
- Implement pagination with configurable page size
- Add search functionality with full-text search on title and description
- Implemented client-side filtering and server-side search capabilities
- Integrated with the document router to support search queries
- Fixed category handling to support multiple formats (camelCase, snake_case, lowercase) of category names
- Enhanced document fetching to be resilient against database schema differences
- Improved error handling for database-related issues

**Tests:**
- [x] Test filtering behavior
- [x] Test search functionality
- [x] Test pagination if implemented
- [x] Test category matching with different format variations

**Testing Instructions:**
- Verify filtering by all supported criteria
- Test search with partial matches and different languages
- Test pagination with various page sizes
- Verify empty state handling
- Verify documents appear correctly regardless of how category names are stored in database

**Storybook:**
- [x] Create Storybook stories for document browser component
- [x] Document filtering and pagination behavior

### 3.2 Document Viewer ✅
- [x] Create document viewer component
- [x] Implement file preview for different formats
- [x] Add translation request option for documents

**Implementation Details:**
- Create a DocumentCard component for displaying document metadata
- Implement in-browser preview for PDFs, images, and text files
- Add download tracking
- Implement a translation request button for documents not in the user's preferred language
- Added support for various file types (PDF, images, text, HTML, JSON)
- Implemented fallback behavior for unsupported file types
- Integrated with translation service to request document translations
- Enhanced error handling for document loading and format issues
- Added robust category handling for document filtering and display

**Tests:**
- [x] Test viewer rendering for different file types
- [x] Test translation request workflow
- [x] Test responsive behavior
- [x] Test category-based filtering

**Testing Instructions:**
- Test preview rendering for all supported file types
- Verify download tracking increments correctly
- Test translation request workflow
- Check responsive behavior on different devices
- Verify correct category filtering and document display regardless of category name format

**Storybook:**
- [x] Create Storybook stories for document viewer component
- [x] Document viewer interactions

### 3.3 Document Upload Interface ✅
- [x] Create document upload interface for admins
- [x] Add metadata editing capabilities
- [x] Implement category and language tagging

**Implementation Details:**
- Create a comprehensive form for document uploads with all metadata fields
- Implement drag-and-drop file upload with progress indicator
- Add validation for required fields and file types
- Allow setting visibility and publication status

**Tests:**
- [x] Test upload workflow
- [x] Test metadata editing
- [x] Test validation

**Testing Instructions:**
- Test the complete upload workflow with various file types
- Verify all metadata fields are saved correctly
- Test validation for required fields and file types
- Check error handling for upload failures

**Storybook:**
- [ ] Create Storybook stories for document upload interface
- [ ] Document metadata editing workflow

### 3.4 Document Management ✅
- [x] Create document listing and management interface
- [x] Add editing, replacing, and deletion functionality
- [ ] Implement versioning if needed

**Implementation Details:**
- Create an admin document management page with filtering and sorting
- Implement CRUD operations for documents
- Add bulk operations for categories and visibility
- Implement soft delete with recovery option
- Add document versioning to track changes over time

**Tests:**
- [x] Test CRUD operations
- [ ] Test version control if implemented
- [x] Test bulk operations if implemented

**Testing Instructions:**
- Test creation, editing, and deletion of documents
- Verify version history if implemented
- Test bulk operations with multiple documents
- Check permission enforcement for different user roles

**Storybook:**
- [ ] Create Storybook stories for document management interface
- [ ] Document CRUD operations

### 3.5. Content Editor Role ✅
- [x] Implement content editor permissions
- [x] Create restricted admin interface for editors
- [x] Add audit logging for content changes

**Implementation Details:**
- Defined specific permissions for the content editor role
- Created a restricted admin interface with document management capabilities
- Implemented category-specific permissions (e.g., content editors can only edit certain document categories)
- Added comprehensive audit logging for all document-related actions (create, edit, delete, view, download)
- Created AuditLog model in Prisma schema to track all content changes
- Implemented audit logging utility functions in src/lib/utils/audit.ts
- Updated documents router to include audit logging for create, delete, update, view, and download operations
- Added document history page to view audit logs for specific documents
- Added filtering and sorting functionality to the admin documents page

**Tests:**
- [x] Test permission enforcement
- [x] Test editor interface functionality
- [x] Test audit log recording

**Testing Instructions:**
- Test content editor permissions with various document categories
- Verify interface restrictions work correctly based on user permissions
- Test audit logging for all content changes (create, edit, delete, view, download)
- Verify proper filtering and display of audit logs in the document history page

**Storybook:**
- [x] Create Storybook stories for editor interface
- [x] Document permission levels

## 4. Priority Enhancements and Features

### 4.1 Phase 2: AI Translation Workflow ⚠️ **PARTIALLY COMPLETE**
- [x] Create translation service with DeepL integration
- [x] Implement translation request workflow
- [x] Add translation API endpoints 
- [x] Create translation UI components
- [ ] **Missing**: Advanced quality validation and scoring
- [ ] **Missing**: Cost estimation and budget management
- [ ] **Missing**: Comprehensive translation management interface

**Current Status**: Basic translation functionality implemented with service layer, API routes, and UI components. Advanced features like quality validation, cost management, and batch processing documented but not implemented.

**Implementation Details:**
- ✅ TranslationService with full CRUD operations (src/lib/services/translationService.ts)
- ✅ API endpoints for translation management (/api/translations/)
- ✅ React components for translation requests (TranslationRequest.tsx)
- ✅ Comprehensive testing (28/28 tests passing)
- ❌ Quality validation system (documented but not built)
- ❌ Cost estimation and budget tracking (documented but not built)
- ❌ Admin translation management interface (documented but not built)

### 4.2 Phase 3: Community Polls & Voting System ✅ **COMPLETE**
- [x] Create polls database schema
- [x] Implement polls service layer with TDD
- [x] Create voting system with validation
- [x] Add poll statistics and results
- [x] **COMPLETED**: API endpoints integration
- [x] **COMPLETED**: UI components for poll creation and voting
- [x] **COMPLETED**: Multilingual poll interface with RTL support

**Current Status**: Full implementation complete with comprehensive multilingual support and testing.

**Implementation Details:**
- ✅ Comprehensive PollsService class (src/lib/services/pollsService.ts)
- ✅ Full CRUD operations for polls, options, and votes
- ✅ Voting validation and statistics calculation
- ✅ Comprehensive testing (13/13 tests passing)
- ✅ **NEW**: PollTranslationService with automatic AI translation (21/21 tests passing)
- ✅ **NEW**: Complete API endpoints (/api/polls/* routes with 9/9 API logic tests passing)
- ✅ **NEW**: TranslatedPollCard component with full RTL support for Arabic
- ✅ **NEW**: PollCard, PollsList, and PollCreationForm components
- ✅ **NEW**: Language switching and translation management interface

**Translation Features Added:**
- ✅ **Database Schema**: Enhanced PollTranslation model with unique constraints
- ✅ **Service Layer**: Complete translation workflow with DeepL/OpenAI integration
- ✅ **API Endpoints**: RESTful translation management with authentication
- ✅ **UI Components**: RTL-aware poll components with language switching
- ✅ **Smart Features**: Translation completeness tracking, automatic fallbacks
- ✅ **Testing**: 30/30 poll translation tests passing

**Files Created/Updated:**
- `src/lib/services/pollTranslationService.ts` - Complete translation service
- `src/lib/services/__tests__/pollTranslationService.test.ts` - Comprehensive tests
- `src/app/api/polls/[id]/translations/route.ts` - Translation API endpoints
- `src/app/api/polls/[id]/translations/[language]/route.ts` - Language-specific endpoints
- `src/app/api/polls/[id]/translations/__tests__/route.simplified.test.ts` - API tests
- `src/components/TranslatedPollCard.tsx` - Enhanced poll card with RTL support
- `src/components/PollCard.tsx` - Basic poll voting interface
- `src/components/PollsList.tsx` - Poll listing with filtering
- `src/components/PollCreationForm.tsx` - Poll creation interface

### 4.3 i18n Code Refactoring
- [ ] Refactor page components to use shared implementations
- [ ] Create language-specific routes for all pages
- [ ] Ensure consistent i18n patterns across the application
- [ ] Improve RTL (Right-to-Left) support for Arabic content

**Implementation Details:**
- Create shared page components in `src/components/pages/` directory
- Move duplicated code from language-specific routes to shared components
- Update language-specific routes to import and render shared components
- Ensure all text content uses the `useI18n` hook for translations
- Add proper redirection from root routes to language-specific routes
- Create RTL utility functions for consistent handling of text alignment, list styles, and flex direction
- Add RTL-specific CSS rules to handle punctuation and list bullet positioning
- Apply RTL classes to components based on the current locale

**Tests:**
- [ ] Test language switching on all pages
- [ ] Verify correct translations in all languages
- [ ] Test URL structure and navigation between pages
- [ ] Test redirection from root routes to language-specific routes
- [ ] Verify proper RTL layout in Arabic, including text alignment, list bullets, and punctuation

**Testing Instructions:**
- Verify all pages render correctly in each language
- Test language switching functionality on each page
- Check that URLs maintain the correct language prefix
- Verify that root routes redirect to the appropriate language-specific route
- For Arabic pages, verify that:
  - Text is properly right-aligned
  - List bullets appear on the right side
  - Punctuation appears on the correct side of text
  - Layout flows from right to left

**Storybook:**
- [ ] Update Storybook stories for refactored components
- [ ] Document i18n implementation patterns and best practices
- [ ] Add examples of RTL layout handling

### 4.4 Document Viewer Translation Request ⚠️ **BASIC IMPLEMENTATION**
- [x] Add basic translation request option for documents
- [x] Implement basic translation request workflow
- [ ] **Missing**: User notification system for completed translations
- [ ] **Missing**: Advanced translation status indicators
- [ ] **Missing**: Comprehensive translation preview system

**Implementation Details:**
- ✅ Basic translation request button in document viewer
- ✅ Basic translation request workflow and queueing
- ✅ Basic translation service integration
- ❌ Comprehensive notification system (documented but not implemented)
- ❌ Advanced translation status indicators (documented but not implemented)
- ❌ Full translation preview system (documented but not implemented)

**Current Status**: Basic translation request functionality exists but lacks the advanced features described in documentation.

**Tests:**
- [x] Test basic translation request UI and functionality
- [x] Test basic translation workflow
- [ ] Test comprehensive notification system (not implemented)
- [ ] Test advanced translation preview (not implemented)

**Testing Instructions:**
- Test requesting translations for various document types
- Verify translation status is properly tracked and displayed
- Check notification delivery when translations are complete
- Test previewing translated documents of different formats
- Run tests with `npm test -- --testPathPattern=translations` to verify translation functionality
- Run tests with `npm test -- --testPathPattern=DocumentTranslationWorkflow` to verify end-to-end workflow

**Storybook:**
- [x] Create Storybook stories for translation request component
- [x] Document translation workflow

### 4.3 Document Versioning

[DELETED]

### 4.4 Owner Dashboard Redesign ✅
- [x] Remove property management sections
- [x] Focus UI on document access
- [x] Add notifications for new documents

**Implementation Details:**
- Created a dashboard layout with sections for different document categories
- Added a recent documents section showing newly added items
- Implemented notification system for new documents in user's preferred categories
- Added quick filters and search functionality
- Ensured proper internationalization support for all dashboard elements
- Fixed authentication flow for owner login with email-based authentication
- Created document-focused pages for the owner dashboard
- Fixed document loading issues by enhancing category handling in the getDocumentsByCategory function
- Added robust error handling and recovery mechanisms for document fetching
- Implemented flexible category matching to support various formats (camelCase, snake_case, lowercase)
- Added comprehensive logging to assist with troubleshooting document loading issues
- Created script for uploading sample documents to populate the database for testing

**Tests:**
- [x] Test dashboard loading
- [x] Test notification system
- [x] Test user authentication flow
- [x] Test document loading with various category formats
- [x] Test error handling and recovery for failed document fetches

**Testing Instructions:**
- Verify dashboard layout on different screen sizes
- Test owner login flow with email authentication
- Verify document categories and recent documents display correctly
- Check notification system for new documents
- Test document loading with different category names and formats
- Verify error handling when document fetching fails

**Storybook:**
- [x] Create Storybook stories for dashboard components
- [x] Document dashboard layout and components

### 4.5 Storybook Component Context Providers
- [x] Ensure all components using `useI18n` are wrapped with `I18nProvider`
- [x] Fix I18nProvider usage in story files by removing unsupported props
- [x] Standardize all stories to use consistent context providers

**Implementation Details:**
- Ensure all story components using internationalization are wrapped in `I18nProvider`
- Fix I18nProvider locale props that are not supported by the component
- Make sure all components that rely on context providers have appropriate decorators

**Tests:**
- [x] Test Storybook build to ensure no context-related errors
- [x] Verify components render correctly with proper context

**Testing Instructions:**
- Run Storybook to verify all components display properly
- Check internationalized components particularly to ensure they function correctly

## 5. Public Area Extensions

### 5.1 Location Section
- [ ] Implement interactive map showing Costa Beach 3 location
- [ ] Add information about nearby amenities and attractions
- [ ] Include transportation information

**Implementation Details:**
- Integrate a map component (Google Maps or similar) showing property location
- Create a responsive layout for displaying location information
- Add information on nearby amenities with distance indicators
- Include transportation options and directions
- Ensure map is responsive and performant on mobile devices

**Tests:**
- [ ] Test map loading and interactions
- [ ] Test responsive behavior on various devices
- [ ] Test information display in different languages

**Testing Instructions:**
- Verify map loads correctly and displays the proper location
- Test interactive features like zoom and pan
- Check that nearby amenity information displays correctly
- Verify proper translations of location information

**Storybook:**
- [ ] Create Storybook stories for location section component
- [ ] Document map integration and responsive behavior

### 5.2 Photo Gallery
- [ ] Create responsive photo gallery grid
- [ ] Implement category-based organization (Common Areas, Beach, Facilities)
- [ ] Add lightbox viewer for full-size images
- [ ] Implement lazy loading for performance

**Implementation Details:**
- Design a responsive grid layout for displaying property photos
- Implement category filtering with tabs or dropdown
- Add lightbox functionality for viewing full-size images
- Implement lazy loading to improve performance
- Ensure images are optimized for web display

**Tests:**
- [ ] Test gallery grid on various screen sizes
- [ ] Test category filtering functionality
- [ ] Test lightbox interactions and keyboard navigation
- [ ] Test image loading performance

**Testing Instructions:**
- Verify gallery displays correctly on all screen sizes
- Test category filtering to ensure it shows correct images
- Check lightbox functionality for viewing full-size images
- Verify lazy loading improves performance on slow connections

**Storybook:**
- [ ] Create Storybook stories for photo gallery component
- [ ] Document category filtering and lightbox interactions

### 5.3 Enhanced Footer
- [ ] Design and implement enhanced footer with contact information
- [ ] Add quick links to important pages
- [ ] Include language switcher component
- [ ] Add social media links if applicable

**Implementation Details:**
- Create a comprehensive footer design with multiple sections
- Include contact information, quick links, and legal disclaimers
- Add language switcher component for easy language changes
- Implement social media links if available
- Ensure responsive layout and proper spacing on all devices

**Tests:**
- [ ] Test footer layout on various screen sizes
- [ ] Test all links for correct destinations
- [ ] Test language switcher functionality

**Testing Instructions:**
- Verify footer displays correctly on all screen sizes
- Test all links to ensure they lead to correct destinations
- Check language switcher updates the UI correctly
- Verify contact information is displayed correctly and actionable

**Storybook:**
- [ ] Create Storybook stories for footer component
- [ ] Document responsive behavior and language switching

## 6. Advanced Features

### 6.1 Translation Management
- [ ] Create interface for requesting/reviewing translations
- [ ] Implement AI translation workflow with DeepL
- [ ] Add manual override capabilities

**Implementation Details:**
- Create a translation management interface for admins
- Implement a workflow for requesting, tracking, and approving translations
- Integrate with DeepL for automated translation
- Allow manual editing and correction of translations
- Add quality metrics for translations

**Tests:**
- [ ] Test translation workflow
- [ ] Test manual editing
- [ ] Test translation status tracking

**Testing Instructions:**
- Test the complete translation workflow
- Verify AI translations are generated correctly
- Test manual editing and correction
- Check status tracking for translation requests

**Storybook:**
- [ ] Create Storybook stories for translation management interface
- [ ] Document translation workflow

### 6.2 User Management Interface
- [ ] Create user listing and management interface
- [ ] Add role assignment capabilities
- [ ] Implement permission editing

**Implementation Details:**
- Create an admin interface for viewing and managing users
- Implement role assignment and permission editing
- Add filtering and search functionality
- Implement user status management (active, suspended, etc.)
- Add audit logging for permission changes

> **Note for Supabase Migration:** User management will be integrated with Supabase Auth. User metadata, roles, and permissions will be stored and managed through Supabase, with custom UI components to interact with the Supabase Auth API. See Section 8.5 for complete migration details.

**Tests:**
- [ ] Test user listing functionality
- [ ] Test role assignment
- [ ] Test permission changes

**Testing Instructions:**
- Test user listing with filtering and search
- Verify role assignment changes permissions correctly
- Test individual permission toggling
- Check audit logging for all permission changes

**Storybook:**
- [ ] Create Storybook stories for user management interface
- [ ] Document permission editing workflow

## 7. Testing, Optimization, and Documentation

### 7.1 Integration Testing
- [ ] Create end-to-end test suite
- [ ] Test full user journeys
- [ ] Test multilingual functionality

**Implementation Details:**
- Set up Cypress or Playwright for end-to-end testing
- Create test scenarios for key user journeys
- Test multilingual functionality across all pages
- Implement visual regression testing
- Add accessibility testing

**Tests:**
- [ ] Owner journey tests
- [ ] Admin journey tests
- [ ] Language switching tests

**Testing Instructions:**
- Run all E2E tests with `npm run test:e2e`
- Verify all user journeys work correctly
- Test language switching on all pages
- Check accessibility compliance

**Storybook:**
- [ ] Create Storybook stories for key user journeys
- [ ] Document testing approach

### 7.2 Performance Optimization
- [ ] Optimize document loading and preview
- [ ] Implement caching strategies
- [ ] Reduce bundle size

**Implementation Details:**
- Implement lazy loading for document lists and previews
- Add caching for frequently accessed documents
- Optimize image and file loading
- Implement code splitting and bundle optimization
- Add performance monitoring

**Tests:**
- [ ] Lighthouse performance tests
- [ ] Load testing for document access
- [ ] Bundle analysis

**Testing Instructions:**
- Run Lighthouse tests on key pages
- Verify bundle sizes with `npm run analyze`
- Test performance with large document libraries
- Check caching behavior

**Storybook:**
- [ ] Document performance optimization techniques

### 7.3 AWS S3 Integration Improvements
- [ ] Add comprehensive retry mechanisms for unreliable connections
- [ ] Improve error handling with specific error messages
- [ ] Implement recovery options for failed uploads/downloads

**Implementation Details:**
- Add exponential backoff and retry logic for S3 operations
- Create detailed error messages for common S3 failures
- Implement recovery options for interrupted uploads
- Add logging and monitoring for S3 operations
- Improve performance with optimized transfer settings

**Tests:**
- [ ] Test retry mechanisms with simulated failures
- [ ] Test error handling for various error scenarios
- [ ] Test recovery options for interrupted operations

**Testing Instructions:**
- Simulate network failures to test retry mechanisms
- Verify error messages are clear and actionable
- Test recovery from interrupted uploads and downloads
- Check performance with large files and unreliable connections

**Storybook:**
- [ ] Document S3 integration best practices and error handling

### 7.4 Component Documentation
- [ ] Document all UI components in Storybook
- [ ] Create interactive examples for each component
- [ ] Add accessibility information

**Implementation Details:**
- Create Storybook stories for all UI components
- Add documentation for props, usage patterns, and examples
- Include accessibility information and best practices
- Add interactive controls for testing component variations
- Include code snippets for implementation

**Tests:**
- [ ] Test Storybook builds
- [ ] Verify component documentation
- [ ] Run accessibility tests

**Testing Instructions:**
- Run Storybook with `npm run storybook`
- Verify all components are documented
- Check accessibility information
- Test interactive controls

### 7.5 Design System
- [ ] Document color palette and typography
- [ ] Create theme documentation
- [ ] Document responsive design patterns

**Implementation Details:**
- Document the color palette with semantic naming
- Create typography documentation with examples
- Document theme configuration and customization
- Add responsive design patterns and breakpoints
- Include dark mode implementation details

**Tests:**
- [ ] Test theme switching
- [ ] Verify design token usage
- [ ] Test responsive behavior

**Testing Instructions:**
- Verify all design tokens are documented
- Test theme switching functionality
- Check responsive design patterns
- Verify dark mode implementation

### 7.6 Production Deployment
- [ ] Configure production environment
- [ ] Set up monitoring and logging
- [ ] Create deployment documentation

**Implementation Details:**
- Set up production environment with proper security configurations
- Implement CI/CD pipeline for automated deployments
- Add monitoring and alerting for critical services
- Create comprehensive deployment documentation
- Implement backup and recovery procedures

**Tests:**
- [ ] Smoke tests on production
- [ ] Verify environment variables
- [ ] Test backup and recovery procedures

**Testing Instructions:**
- Run smoke tests after each deployment
- Verify all environment variables are set correctly
- Test backup and recovery procedures regularly
- Check monitoring and alerting functionality

**Storybook:**
- [ ] Document deployment process

### 7.7 Storybook Improvements and Reorganization ✅
- [x] Fix tRPC context errors in Storybook
- [x] Reorganize sidebar structure into logical categories
- [x] Ensure all components have Storybook stories
- [x] Implement consistent decorators for all components
- [x] Add missing Context Providers for tRPC components

**Implementation Details:**
- Created comprehensive mock implementations for tRPC, i18n, and NextAuth providers
- Reorganized stories following the Atomic Design pattern (atoms, molecules, organisms, templates, pages)
- Implemented proper mock for Next.js navigation functions including the missing redirect function
- Created a component template for consistent story creation
- Added a utility script to check and fix missing dependencies in story files
- Updated Storybook preview to use consistent decorators across all stories
- Fixed navigation issues in the Storybook sidebar
- Created proper organization and sorting for all story categories
- Added improved debugging capabilities for Storybook

**Implementation Steps:**
1. **Fix tRPC Context Error (0.2 SP)** ✅
   - Used existing MockTRPCProvider in .storybook directory
   - Added missing redirect function to mockNextNavigation.ts to address console warnings
   - Ensured proper provider usage in preview.tsx

2. **Reorganize Sidebar Structure (0.2 SP)** ✅
   - Created main categories: Atoms, Molecules, Organisms, Templates, Pages
   - Added subcategories for functional areas (Auth, Documents, Layout, etc.)
   - Updated all story files to use consistent naming conventions
   - Created utility functions in storybook-organization.ts for consistent story titles

3. **Component Template Creation (0.2 SP)** ✅
   - Created a template file for new component stories
   - Added comprehensive example with proper imports, metadata, and story structure
   - Included examples for common prop definitions and story variants

4. **Context Provider Integration (0.2 SP)** ✅
   - Used existing decorators for common contexts
   - Updated mockNextNavigation.ts to include all required navigation functions
   - Created script to analyze and report missing context providers in stories

**Tests:**
- [x] Test Storybook builds
- [x] Verify tRPC components render without errors
- [x] Test all story categories and navigation
- [x] Check component coverage against application inventory

**Testing Instructions:**
- Run `npm run storybook` and verify no console errors
- Navigate through all categories and test each component
- Verify all components that use tRPC hooks render correctly
- Test different variants and responsive views for components
- Check dark mode toggling works across all components
- Run the dependency checker script to identify any missing mocks

**Storybook:**
- [x] Document Storybook organization structure
- [x] Create examples of proper story implementation

## 8. API Implementation and Missing Features

### 8.1 Document API Routes
- [ ] Implement document download API route
- [ ] Implement document preview API route
- [ ] Add proper authentication and authorization
- [ ] Implement error handling and logging

**Implementation Details:**
- Replace placeholder implementation in `/api/documents/[id]/download` with actual S3 download functionality
- Implement proper file streaming or signed URL generation for downloads
- Add authentication checks to ensure only authorized users can access documents
- Implement preview generation for different file types in `/api/documents/[id]/preview`
- Add download tracking to increment document download counts
- Implement proper error handling with specific error messages
- Add logging for all document access for audit purposes

**Tests:**
- [ ] Test document download API with various file types
- [ ] Test authentication and authorization
- [ ] Test error handling for various scenarios
- [ ] Test download tracking functionality

**Testing Instructions:**
- Test document downloads with various file types and sizes
- Verify authentication checks prevent unauthorized access
- Test error scenarios like missing files, server errors, etc.
- Verify download counts are incremented correctly
- Check that appropriate headers are set for different file types

### 8.2 Owner Registration API Routes
- [ ] Implement owner registration API endpoints
- [ ] Add validation and sanitization
- [ ] Implement admin approval workflow
- [ ] Add email notifications

**Implementation Details:**
- Replace placeholder implementation in `/api/admin/owner-registrations` with actual database operations
- Implement proper validation for registration data
- Add sanitization to prevent security issues
- Implement admin approval workflow with status tracking
- Add email notifications for registration status changes
- Implement proper error handling with specific error messages
- Add logging for all registration activities

**Tests:**
- [ ] Test registration submission
- [ ] Test validation and error handling
- [ ] Test admin approval workflow
- [ ] Test email notifications

**Testing Instructions:**
- Test registration submission with valid and invalid data
- Verify validation prevents invalid submissions
- Test admin approval, rejection, and notes functionality
- Verify email notifications are sent for status changes
- Check that appropriate error messages are returned for various scenarios

### 8.3 Admin Interface Enhancements
- [ ] Complete admin dashboard functionality
- [ ] Implement user management features
- [ ] Add document management capabilities
- [ ] Implement audit logging

**Implementation Details:**
- Enhance the admin dashboard with actual data from the database
- Implement user management features (create, edit, delete, suspend)
- Add document management capabilities (upload, edit, delete, categorize)
- Implement audit logging for all admin actions
- Add filtering and search functionality for users and documents
- Implement pagination for large datasets
- Add data export functionality

**Tests:**
- [ ] Test admin dashboard loading and data display
- [ ] Test user management operations
- [ ] Test document management operations
- [ ] Test audit logging

**Testing Instructions:**
- Verify admin dashboard displays correct data
- Test all user management operations
- Test all document management operations
- Verify audit logs record all admin actions
- Test filtering, search, and pagination
- Check data export functionality

### 8.4 NextAuth Integration ~~(DEPRECATED)~~
- [ ] ~~Complete NextAuth integration with proper roles and permissions~~
- [ ] ~~Implement session management~~
- [ ] ~~Add role-based access control~~
- [ ] ~~Implement secure authentication flows~~

**Implementation Details:**
~~- Enhance NextAuth configuration with proper session management
- Implement role-based access control for different user types
- Add custom callbacks to include user roles and permissions in session
- Implement secure authentication flows with email verification
- Add password reset functionality
- Implement account locking for failed login attempts
- Add session expiration and renewal~~

> **Note:** This section has been deprecated in favor of the Supabase Authentication Migration plan (Section 8.5). All authentication-related features will be implemented using Supabase instead of NextAuth.

**Tests:**
- [ ] ~~Test authentication flows~~
- [ ] ~~Test role-based access control~~
- [ ] ~~Test session management~~
- [ ] ~~Test security features~~

**Testing Instructions:**
~~- Test login, logout, and registration flows
- Verify role-based access control restricts unauthorized access
- Test session expiration and renewal
- Check security features like account locking
- Verify password reset functionality~~

> See Section 8.5 for updated testing instructions related to Supabase authentication.

### 8.5 Supabase Authentication Migration ✅
- [x] Set up Supabase project and authentication services
- [x] Implement Supabase client integration
- [x] Update authentication components and hooks
- [x] Implement role-based access control with Supabase
- [x] Update middleware and protected routes
- [x] Create database tables and triggers for user management
- [x] Add fallback mechanisms for database setup issues
- [ ] Migrate user data from existing system to Supabase
- [ ] Add social login providers (Google, Facebook)

**Implementation Details:**
- Created Supabase project and configured authentication settings
- Set up environment variables for Supabase connection
- Created Supabase client utilities for both server-side (`src/lib/supabase/server.ts`) and client-side (`src/lib/supabase/client.ts`) components
- Implemented comprehensive auth utilities in `src/lib/supabase/auth.ts` with sign-up, sign-in, sign-out, password reset, and verification functions
- Added TypeScript types for Supabase database schema in `src/lib/types/database.types.ts`
- Created custom Auth UI components for login, registration, and password management
- Updated middleware to use Supabase session verification while preserving i18n functionality
- Implemented permission checks with role-based access control (requireAuth, requireAdmin, requireVerifiedOwner)
- Added proper handling of protected routes with session verification
- Created hooks for accessing user session and authentication state
- Implemented proper redirection for authentication flows
- Created SQL migration scripts to set up necessary database tables in Supabase
- Added server-side API route to create database tables and triggers
- Implemented fallback mechanisms in AuthWrapper for handling missing database tables
- Enhanced error handling throughout the authentication flow for database-related issues
- Successfully executed database setup scripts with confirmation of table creation
- Verified authentication flow with the new database structure
- Confirmed that the AuthWrapper component works correctly with the database

**Remaining Tasks:**
- Complete user data migration from existing database to Supabase Auth
- Configure and implement Google and Facebook OAuth providers
- Enhance error handling for authentication edge cases
- Add full internationalization support for all auth UI components
- Create comprehensive Storybook stories for auth components

**Tests:**
- [x] Test Supabase client initialization
- [x] Test authentication flows (sign up, sign in, sign out, password reset)
- [x] Test database table creation and fallback mechanisms
- [ ] Test social login providers (Google, Facebook)
- [x] Test session persistence and refresh
- [x] Test role-based access control with Supabase
- [ ] Test data migration accuracy
- [x] Test protected routes and middleware

**Testing Instructions:**
- Verify all authentication flows work end-to-end:
  - Sign up with email/password
  - Sign in with existing credentials
  - Password reset flow
  - Email verification
  - Sign out
- Test protected routes to ensure they properly restrict access based on user role
- Verify session persistence across page navigation and browser refreshes
- Check that error messages are displayed correctly for authentication failures

**Storybook:**
- [ ] Create Storybook stories for auth components
- [ ] Document authentication flows and states
- [ ] Add examples of protected content display based on user role

**Migration Steps:**
1. **Setup and Configuration (0.5 SP)** ✅
   - Create Supabase project in dashboard
   - Configure authentication settings (password policies, email templates)
   - Set up social providers (Google, Facebook)
   - Add environment variables to project

2. **Supabase Client Integration (0.5 SP)** ✅
   - Install Supabase packages (`@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`)
   - Create client utilities for server and browser contexts
   - Implement hooks for authentication state

3. **Database Setup (0.5 SP)** ✅
   - Create SQL migration scripts for database tables
   - Implement server-side API route for table creation
   - Add fallback mechanisms for handling missing tables
   - Implement error handling for database operations
   - Execute database setup scripts and verify successful creation
   - Test authentication flow with the new database structure

4. **User Data Migration (1 SP)**
   - Export existing user data from database
   - Transform data to match Supabase Auth schema
   - Import users to Supabase (consider password hashing differences)
   - Migrate user metadata and role information
   - Verify successful migration with test accounts

5. **Auth UI Components (1 SP)** ✅
   - Install Auth UI packages (`@supabase/auth-ui-react`, `@supabase/auth-ui-shared`)
   - Create sign-in, sign-up, and password reset components
   - Implement social login buttons
   - Style components to match application design
   - Add internationalization support for auth UI

6. **Middleware and Route Protection (1 SP)** ✅
   - Update middleware to verify Supabase session
   - Implement public and protected route handling
   - Create helper functions for role checks
   - Update layout components to handle auth state

7. **Session Management (0.5 SP)** ✅
   - Implement session refresh mechanism
   - Add user profile and session information to context
   - Update components that rely on session data
   - Test session persistence across page navigation

8. **Testing and Validation (1 SP)** ✅
   - Create end-to-end tests for authentication flows
   - Test social login functionality
   - Verify role-based access control
   - Test error handling and edge cases
   - Update existing tests to work with Supabase
   - Test database table creation and fallback mechanisms

9. **Documentation and Cleanup (0.5 SP)**
   - Update documentation with new authentication approach
   - Create Storybook examples for auth components
   - Remove NextAuth dependencies and code
   - Clean up unused authentication components

**Required Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (server-side only)
```

**Implementation Timeline:**
- Total estimated effort: 5.5 story points
- Recommended implementation order: Setup → Client Integration → Auth UI → Middleware → User Migration → Session Management → Testing → Documentation

### 8.6 Social Login Implementation with Required Owner Information

- [ ] Configure Google OAuth provider in Supabase
- [ ] Configure Facebook OAuth provider in Supabase
- [ ] Create multi-step registration flow for social login users
- [ ] Design and implement account completion page
- [ ] Store owner-specific information for social login users

**Implementation Details:**
- Set up Google OAuth in Supabase dashboard with proper redirect URIs and credentials
- Set up Facebook OAuth in Supabase dashboard with proper app configuration
- Create a dedicated "Account Completion" page that appears after social login if required information is missing
- Implement form validation for building and apartment fields
- Store additional owner information in a separate table linked to the Supabase user ID
- Add admin verification process for social login registrations
- Ensure proper linking of social identity with owner profile
- Implement session checking to require profile completion before accessing protected content
- Add language preference selection during the profile completion process

**Technical Architecture:**
1. **Social Provider Configuration**
   - Register applications with Google and Facebook developer consoles
   - Configure callback URLs in both provider dashboards
   - Add provider credentials to Supabase Auth settings
   - Test connection with each provider separately

2. **User Flow Design**
   - Social login → Check if profile complete → Redirect to profile completion if needed → Dashboard access
   - Implement "registrationComplete" flag in user metadata
   - Create middleware redirects based on completion status

3. **UI Components**
   - Create `SocialLoginButtons` component with Google and Facebook options
   - Implement `ProfileCompletion` form with building and apartment fields
   - Add profile verification status indicator
   - Design admin review interface for social registrations

4. **Database Architecture**
   - Create `owner_profiles` table linked to `auth.users` by user_id
   - Add trigger to check profile completion status on login
   - Implement proper indexes for efficient lookups
   - Store social identity information with proper relation to owner profiles

**Tests:**
- [ ] Test OAuth flow with Google provider
- [ ] Test OAuth flow with Facebook provider
- [ ] Test profile completion form submission
- [ ] Test redirects for incomplete profiles
- [ ] Test validation of required owner fields
- [ ] Test admin verification flow for social registrations
- [ ] Test auth state persistence through the multi-step process

**Testing Instructions:**
- Create test applications in Google and Facebook developer consoles
- Configure test applications with proper redirect URIs
- Test the complete registration flow from social login through profile completion
- Verify building and apartment information is correctly stored
- Test the admin approval workflow for social login registrations
- Verify error handling for incomplete profile submissions
- Test with various browser settings including cookie policies and privacy modes

**Storybook:**
- [ ] Create Storybook stories for social login buttons
- [ ] Create Storybook stories for profile completion form
- [ ] Document the multi-step registration flow

**Required Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
FACEBOOK_CLIENT_ID=your-facebook-client-id
```

**Implementation Timeline:**
- Total estimated effort: 2 story points
- Recommended implementation order: 
  1. Provider configuration
  2. Database schema updates
  3. Profile completion UI
  4. Flow implementation
  5. Admin verification integration

**Security Considerations:**
- Implement proper CSRF protection for all auth forms
- Ensure secure handling of tokens and session data
- Add rate limiting for profile completion attempts
- Validate and sanitize all user inputs
- Ensure social identity verification follows best practices
- Monitor for suspicious registration patterns
- Implement proper logging for security audits

## Notes for Implementation

- All user-facing text must support both French and Arabic
- Document categories must be clearly labeled and organized by date
- UI should be simple and intuitive for non-technical users
- Test on both desktop and mobile devices
- Consider accessibility requirements throughout development 
- All UI components should have corresponding Storybook stories
- Storybook should be used for visual regression testing 
- Authentication will be implemented using Supabase Auth instead of NextAuth, with social login support for Google and Facebook
- User roles and permissions will be stored as metadata in Supabase Auth
- All authentication UI components should support internationalization