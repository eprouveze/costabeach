# Costa Beach HOA Portal Development Plan

## Overview

This development plan outlines the transformation of the Costa Beach application from a property rental marketplace to an HOA information portal. The plan is divided into stories, each representing approximately one story point of effort.

## Development Tracking

- [ ] **Completed**
- [ ] **Tested**
- [ ] **Reviewed**
- [ ] **Deployed**

## Development Process Rules

1. **Each feature MUST be tested before being marked as done**
   - Run all associated unit and integration tests for the feature
   - Add new tests if coverage is inadequate
   - Document any test failures or gaps

2. **Feature Implementation Checklist**
   - Implement the feature according to specifications
   - Write or update necessary tests
   - Run tests and verify they pass
   - Update documentation and Storybook
   - Mark as complete ONLY after tests pass

3. **Code Quality Requirements**
   - Follow established patterns in the codebase
   - Include proper error handling
   - Ensure accessibility compliance
   - Implement proper internationalization

4. **Git Workflow**
   - After completing a section (e.g., "### 1.1 Document Schema"), including successful tests and Storybook with no errors, create a Git commit
   - Use semantic commit messages that clearly describe the changes
   - Include the section number and name in the commit message (e.g., "feat(1.1): Complete Document Schema implementation")
   - Run `npm run build` before committing to ensure there are no build errors
   - Update the development plan to mark the section as completed

## Identified Issues to Fix

### Critical Issues
1. **i18n Server Utilities (Section 2.1-2.2)** ✅
   - Fixed type errors in `src/lib/i18n/server.ts` - The `cookies()` and `headers()` functions now properly await the Promises
   - Fixed translation cache initialization in `src/lib/i18n/utils.ts`

### Missing Features in "Completed" Items
1. **Document Browser (Section 5.1)** ✅
   - Implemented search functionality for documents
   - Added client-side filtering and server-side search capabilities
   - Integrated with the document router to support search queries

2. **Document Viewer (Section 5.2)** ✅
   - Added file preview for different formats (PDF, images, text, HTML)
   - Implemented translation request option with background processing
   - Created UI components for requesting translations and checking status

3. **Document Management (Section 6.2)**
   - Implement document versioning functionality
   - Expand editing capabilities

4. **Content Editor Role (Section 7.3)**
   - Add audit logging for content changes
   - Create restricted admin interface specifically for editors

### Performance and Reliability Issues
1. **AWS S3 Integration** ⚠️
   - Basic error handling is implemented for all S3 operations
   - Still need to add comprehensive retry mechanisms for unreliable connections
   - Need to improve error handling with more specific error messages and recovery options

2. **i18n Framework** ✅
   - Optimized translation loading by switching from dynamic imports to static imports in `I18nProvider`
   - Added enhanced debugging and logging to troubleshoot translation loading issues
   - Fixed missing translations in contact page sections for French and Arabic locales
   - Added more comprehensive fallback handling when translations are missing
   - Fixed test suite to properly mock router and translations
   - Added detailed validation for contact form in all supported languages

## Reordered Implementation Plan

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

**Tests:**
- [x] Test filtering behavior
- [x] Test search functionality
- [x] Test pagination if implemented

**Testing Instructions:**
- Verify filtering by all supported criteria
- Test search with partial matches and different languages
- Test pagination with various page sizes
- Verify empty state handling

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

**Tests:**
- [x] Test viewer rendering for different file types
- [x] Test translation request workflow
- [x] Test responsive behavior

**Testing Instructions:**
- Test preview rendering for all supported file types
- Verify download tracking increments correctly
- Test translation request workflow
- Check responsive behavior on different devices

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
- [ ] Create restricted admin interface for editors
- [ ] Add audit logging for content changes

**Implementation Details:**
- Define specific permissions for the content editor role
- Create a restricted admin interface with document management only
- Implement category-specific permissions (e.g., can only edit certain document categories)
- Add audit logging for all content changes
- Implement approval workflow for sensitive document categories

**Tests:**
- [x] Test permission enforcement
- [ ] Test editor interface functionality
- [ ] Test audit log recording

**Testing Instructions:**
- Test content editor permissions with various document categories
- Verify interface restrictions work correctly
- Test audit logging for all content changes
- Check approval workflow for sensitive documents

**Storybook:**
- [ ] Create Storybook stories for editor interface
- [ ] Document permission levels

## 4. Priority Enhancements and Features

### 4.1 i18n Code Refactoring
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

### 4.2 Document Viewer Translation Request ✅
- [x] Add translation request option for documents
- [x] Implement translation request workflow
- [x] Add user notification for completed translations

**Implementation Details:**
- Add translation request button to document viewer for documents not in user's preferred language
- Create translation request workflow that queues document for translation
- Implement notification system to alert users when translations are ready
- Add translation status indicators to document cards
- Ensure translation preview works correctly for all supported document types
- Implemented background job processing with Inngest for document translations
- Created tRPC procedures for requesting and checking translation status
- Added polling mechanism to update UI when translation is complete

**Tests:**
- [x] Test translation request UI and functionality
- [x] Test translation workflow from request to completion
- [x] Test notification system for completed translations
- [x] Test translation preview for different document types
- [x] Test translation router endpoints
- [x] Test Inngest background job processing
- [x] Test end-to-end translation workflow

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

**Tests:**
- [x] Test dashboard loading
- [x] Test notification system
- [x] Test user authentication flow

**Testing Instructions:**
- Verify dashboard layout on different screen sizes
- Test owner login flow with email authentication
- Verify document categories and recent documents display correctly
- Check notification system for new documents

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

### 5.1 HOA Services Section
- [ ] Create service cards for document access and key HOA functions
- [ ] Implement community announcements preview
- [ ] Add contact information component
- [ ] Create important dates/calendar preview

**Implementation Details:**
- Design service cards with icons representing key HOA functions
- Create a community announcements preview showing recent items
- Include a contact information component with key contact details
- Add a calendar preview showing upcoming important dates
- Ensure all components are responsive and properly translated

**Tests:**
- [ ] Test service cards layout and responsiveness
- [ ] Test announcement previews with sample content
- [ ] Test calendar display with various date formats

**Testing Instructions:**
- Verify service cards display correctly on all screen sizes
- Test announcement previews with different content lengths
- Check calendar display with various date formats and language settings
- Verify all interactive elements function correctly

**Storybook:**
- [ ] Create Storybook stories for service cards component
- [ ] Document announcement and calendar components

### 5.2 Location Section
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

### 5.3 Photo Gallery
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

### 5.4 Enhanced Footer
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

### 7.7 Storybook Improvements and Reorganization
- [ ] Fix tRPC context errors in Storybook
- [ ] Reorganize sidebar structure into logical categories
- [ ] Ensure all components have Storybook stories
- [ ] Implement consistent decorators for all components
- [ ] Add missing Context Providers for tRPC components

**Implementation Details:**
- Create a comprehensive mock for the tRPC Provider that works across all components
- Add the mock tRPC Provider to Storybook's preview.tsx as a global decorator
- Reorganize stories following the Atomic Design pattern (atoms, molecules, organisms, templates, pages)
- Implement decorators for common contexts (I18nProvider, TRPCProvider, SessionProvider)
- Ensure proper mobile and responsive views for all components
- Create stories for missing components, especially those added in recent sprints
- Implement proper error handling for components that require server-side data
- Add documentation for usage patterns and best practices
- Update existing stories to follow consistent patterns
- Add dark mode support for all components

**Implementation Steps:**
1. **Fix tRPC Context Error (0.2 SP)**
   - Create an enhanced MockTRPCProvider in .storybook directory
   - Add proper error handling to prevent "__untypedClient" errors
   - Register the provider in Storybook preview.tsx instead of per-story
   - Test on all components that use tRPC hooks

2. **Reorganize Sidebar Structure (0.2 SP)**
   - Create main categories: Atoms, Molecules, Organisms, Templates, Pages
   - Add subcategories for functional areas (Auth, Documents, Layout, etc.)
   - Update all story files to use consistent naming conventions
   - Add sorting metadata to ensure logical ordering

3. **Complete Component Coverage (0.4 SP)**
   - Inventory all components in the application
   - Identify components without stories
   - Create stories for missing components
   - Ensure all variants are documented

4. **Context Provider Implementation (0.2 SP)**
   - Create reusable decorators for common contexts
   - Implement a global decorator setup for preview.tsx
   - Test with components that require multiple contexts
   - Add documentation for context usage in stories

**Tests:**
- [ ] Test Storybook builds
- [ ] Verify tRPC components render without errors
- [ ] Test all story categories and navigation
- [ ] Check component coverage against application inventory

**Testing Instructions:**
- Run `npm run storybook` and verify no console errors
- Navigate through all categories and test each component
- Verify all components that use tRPC hooks render correctly
- Test different variants and responsive views for components
- Check dark mode toggling works across all components

**Dependencies:**
- This task depends on up-to-date component implementations
- Requires knowledge of all component dependencies and context requirements
- Access to design documentation for proper organization

**Storybook:**
- [ ] Document Storybook organization structure
- [ ] Create examples of proper story implementation

**Related Areas:**
- Component Documentation (Section 7.4)
- Design System (Section 7.5)
- Integration Testing (Section 7.1)

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

**Remaining Tasks:**
- Complete user data migration from existing database to Supabase Auth
- Configure and implement Google and Facebook OAuth providers
- Enhance error handling for authentication edge cases
- Add full internationalization support for all auth UI components
- Create comprehensive Storybook stories for auth components

**Tests:**
- [x] Test Supabase client initialization
- [x] Test authentication flows (sign up, sign in, sign out, password reset)
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
1. **Setup and Configuration (0.5 SP)**
   - Create Supabase project in dashboard
   - Configure authentication settings (password policies, email templates)
   - Set up social providers (Google, Facebook)
   - Add environment variables to project

2. **Supabase Client Integration (0.5 SP)**
   - Install Supabase packages (`@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`)
   - Create client utilities for server and browser contexts
   - Implement hooks for authentication state

3. **User Data Migration (1 SP)**
   - Export existing user data from database
   - Transform data to match Supabase Auth schema
   - Import users to Supabase (consider password hashing differences)
   - Migrate user metadata and role information
   - Verify successful migration with test accounts

4. **Auth UI Components (1 SP)**
   - Install Auth UI packages (`@supabase/auth-ui-react`, `@supabase/auth-ui-shared`)
   - Create sign-in, sign-up, and password reset components
   - Implement social login buttons
   - Style components to match application design
   - Add internationalization support for auth UI

5. **Middleware and Route Protection (1 SP)**
   - Update middleware to verify Supabase session
   - Implement public and protected route handling
   - Create helper functions for role checks
   - Update layout components to handle auth state

6. **Session Management (0.5 SP)**
   - Implement session refresh mechanism
   - Add user profile and session information to context
   - Update components that rely on session data
   - Test session persistence across page navigation

7. **Testing and Validation (1 SP)**
   - Create end-to-end tests for authentication flows
   - Test social login functionality
   - Verify role-based access control
   - Test error handling and edge cases
   - Update existing tests to work with Supabase

8. **Documentation and Cleanup (0.5 SP)**
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