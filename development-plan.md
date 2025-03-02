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

2. **Document Viewer (Section 5.2)**
   - Add file preview for different formats
   - Implement translation request option

3. **Document Management (Section 6.2)**
   - Implement document versioning functionality
   - Expand editing capabilities

4. **Content Editor Role (Section 7.3)**
   - Add audit logging for content changes
   - Create restricted admin interface specifically for editors

### Performance and Reliability Issues
1. **AWS S3 Integration**
   - Add comprehensive error handling for upload failures
   - Implement retry mechanisms for unreliable connections

2. **i18n Framework** ✅
   - Optimize translation loading to reduce performance impact
   - Add more comprehensive fallback handling
   - Fixed test suite to properly mock router and translations

## 1. Database Schema Updates

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

## 2. Internationalization (i18n) Framework

### 2.1 Next.js i18n Setup ✅
- [x] Configure Next.js internationalization
- [x] Set up language detection and routing
- [x] Create language switcher component

**Implementation Details:**
- Configure i18n in next.config.ts with supported locales (fr, ar)
- Implement middleware for language detection from cookies, headers, and user preferences
- Create a reusable LanguageSwitcher component with dropdown and button variants
- Ensure RTL support for Arabic language

**Tests:**
- [x] Test language detection
- [x] Test route generation with language prefixes
- [x] Test language persistence

**Testing Instructions:**
- Run `npm test -- --testPathPattern=i18n` to verify i18n functionality
- Test manual language switching in the browser
- Verify RTL layout for Arabic language
- Test cookie persistence across sessions

**Storybook:**
- [x] Create Storybook stories for language switcher component
- [x] Document i18n usage patterns

### 2.2 Translation Infrastructure ✅
- [x] Create translation files (JSON/YAML)
- [x] Implement translation hooks and components
- [x] Configure fallback language handling

**Implementation Details:**
- Create separate JSON files for each language (fr.json, ar.json, en.json)
- Organize translations by feature area (common, auth, documents, admin)
- Implement useI18n hook for accessing translations in client components
- Add fallback to default locale when translations are missing

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

### 2.3 OpenAI Translation Service ✅
- [x] Create translation API endpoint
- [x] Implement OpenAI integration for text translation
- [x] Add caching mechanism for translations

**Implementation Details:**
- Created a comprehensive translation service with OpenAI integration
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

**Note:** There are some TypeScript issues that need to be resolved in a future update. The core functionality is implemented and working as expected.

## 3. AWS S3 File Storage Integration

### 3.1 AWS S3 Configuration
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

### 3.2 File Upload Service
- [x] Create file upload component
- [x] Implement secure file upload to S3
- [x] Add file type validation and security checks

**Implementation Details:**
- Create a reusable DocumentUpload component with drag-and-drop functionality
- Implement two-step upload process: get signed URL, then upload directly to S3
- Add progress tracking for uploads
- Validate file types and sizes before upload

**Tests:**
- [ ] Test file upload workflow
- [ ] Test format validation
- [ ] Test error handling

**Testing Instructions:**
- Test uploads with valid and invalid file types
- Verify size limit enforcement
- Test cancellation and resume functionality if implemented
- Verify progress tracking accuracy

**Storybook:**
- [ ] Create Storybook stories for file upload component
- [ ] Document upload workflow

### 3.3 File Access and Preview
- [x] Implement secure file access through signed URLs
- [ ] Create PDF/document preview functionality
- [x] Add download functionality

**Implementation Details:**
- Generate time-limited signed URLs for file downloads
- Implement document preview for common file types (PDF, images, text)
- Track download and view counts for analytics
- Add client-side caching for frequently accessed documents

**Tests:**
- [x] Test file retrieval
- [ ] Test preview rendering
- [ ] Test download functionality

**Testing Instructions:**
- Verify signed URL generation for different file types
- Test preview rendering for PDFs, images, and text documents
- Verify view and download count incrementation
- Test URL expiration behavior

**Storybook:**
- [ ] Create Storybook stories for document preview component

## 4. Public Area Redesign

### 4.1 Landing Page Redesign ✅
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

### 4.2 Navigation Structure
- [ ] Update header and navigation components
- [ ] Simplify routing structure
- [ ] Add language-aware navigation

**Implementation Details:**
- Create a simplified navigation structure with Home, About, Contact, and Login/Register
- Implement role-based navigation items for authenticated users
- Ensure navigation labels are properly translated
- Add visual indicators for current page

**Tests:**
- [ ] Test navigation functionality
- [ ] Test mobile responsiveness
- [ ] Test active state highlighting

**Testing Instructions:**
- Test navigation for all user roles
- Verify correct highlighting of active pages
- Test mobile menu toggle and responsive behavior
- Check keyboard accessibility

**Storybook:**
- [ ] Create Storybook stories for navigation components
- [ ] Document navigation patterns

### 4.3 Contact Page Update
- [ ] Update contact page with HOA-specific information
- [ ] Add multilingual support to contact forms
- [ ] Implement form validation

**Implementation Details:**
- Create a contact form with fields for name, email, subject, and message
- Add dropdown for selecting the department/recipient
- Implement client and server-side validation
- Send notification emails to administrators

**Tests:**
- [ ] Test form submission
- [ ] Test validation messages
- [ ] Test i18n of form elements

**Testing Instructions:**
- Test form submission with valid and invalid data
- Verify validation errors are displayed correctly and translated
- Test email delivery to administrators
- Check handling of special characters in different languages

**Storybook:**
- [ ] Create Storybook stories for contact form components
- [ ] Document form validation patterns

## 5. Owner Portal Document System

### 5.1 Document Browser
- [x] Create document browser component
- [x] Implement filtering by category and date
- [ ] Add search functionality

**Implementation Details:**
- Implement DocumentList component that displays documents in a grid or list view
- Add filtering by category, language, and date range
- Implement pagination with configurable page size
- Add search functionality with full-text search on title and description

**Tests:**
- [x] Test filtering behavior
- [ ] Test search functionality
- [x] Test pagination if implemented

**Testing Instructions:**
- Verify filtering by all supported criteria
- Test search with partial matches and different languages
- Test pagination with various page sizes
- Verify empty state handling

**Storybook:**
- [ ] Create Storybook stories for document browser component
- [ ] Document filtering and pagination behavior

### 5.2 Document Viewer
- [x] Create document viewer component
- [ ] Implement file preview for different formats
- [ ] Add translation request option for documents

**Implementation Details:**
- Create a DocumentCard component for displaying document metadata
- Implement in-browser preview for PDFs, images, and text files
- Add download tracking
- Implement a translation request button for documents not in the user's preferred language

**Tests:**
- [ ] Test viewer rendering for different file types
- [ ] Test translation request workflow
- [ ] Test responsive behavior

**Testing Instructions:**
- Test preview rendering for all supported file types
- Verify download tracking increments correctly
- Test translation request workflow
- Check responsive behavior on different devices

**Storybook:**
- [ ] Create Storybook stories for document viewer component
- [ ] Document viewer interactions

### 5.3 Owner Dashboard Redesign
- [ ] Remove property management sections
- [ ] Focus UI on document access
- [ ] Add notifications for new documents

**Implementation Details:**
- Create a dashboard layout with sections for different document categories
- Add a recent documents section showing newly added items
- Implement notification system for new documents in user's preferred categories
- Add quick filters and search functionality

**Tests:**
- [ ] Test dashboard loading
- [ ] Test notification system
- [ ] Test user preferences if implemented

**Testing Instructions:**
- Verify dashboard layout on different screen sizes
- Test notification appearance and dismissal
- Verify user preferences are saved and applied correctly
- Test performance with large document libraries

**Storybook:**
- [ ] Create Storybook stories for dashboard components
- [ ] Document notification system

## 6. Admin Document Management

### 6.1 Document Upload Interface
- [x] Create document upload interface for admins
- [x] Add metadata editing capabilities
- [x] Implement category and language tagging

**Implementation Details:**
- Create a comprehensive form for document uploads with all metadata fields
- Implement drag-and-drop file upload with progress indicator
- Add validation for required fields and file types
- Allow setting visibility and publication status

**Tests:**
- [ ] Test upload workflow
- [ ] Test metadata editing
- [ ] Test validation

**Testing Instructions:**
- Test the complete upload workflow with various file types
- Verify all metadata fields are saved correctly
- Test validation for required fields and file types
- Check error handling for upload failures

**Storybook:**
- [ ] Create Storybook stories for document upload interface
- [ ] Document metadata editing workflow

### 6.2 Document Management
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
- [ ] Test CRUD operations
- [ ] Test version control if implemented
- [ ] Test bulk operations if implemented

**Testing Instructions:**
- Test creation, editing, and deletion of documents
- Verify version history if implemented
- Test bulk operations with multiple documents
- Check permission enforcement for different user roles

**Storybook:**
- [ ] Create Storybook stories for document management interface
- [ ] Document CRUD operations

### 6.3 Translation Management
- [ ] Create interface for requesting/reviewing translations
- [ ] Implement AI translation workflow
- [ ] Add manual override capabilities

**Implementation Details:**
- Create a translation management interface for admins
- Implement a workflow for requesting, tracking, and approving translations
- Integrate with OpenAI for automated translation
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

## 7. User and Permission Management

### 7.1 User Management Interface
- [ ] Create user listing and management interface
- [ ] Add role assignment capabilities
- [ ] Implement permission editing

**Implementation Details:**
- Create an admin interface for viewing and managing users
- Implement role assignment and permission editing
- Add filtering and search functionality
- Implement user status management (active, suspended, etc.)
- Add audit logging for permission changes

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

### 7.2 Owner Registration Flow
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

**Tests:**
- [ ] Test registration workflow
- [ ] Test approval process
- [ ] Test email notifications

**Testing Instructions:**
- Test the complete registration flow from start to finish
- Verify email verification works correctly
- Test admin approval and rejection
- Check email notifications for all status changes

**Storybook:**
- [ ] Create Storybook stories for registration components
- [ ] Document approval workflow

### 7.3 Content Editor Role
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

## 8. Testing and Deployment

### 8.1 Integration Testing
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

### 8.2 Performance Optimization
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

### 8.3 Production Deployment
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

## 9. Storybook Documentation

### 9.1 Component Documentation
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

### 9.2 Design System
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

### 9.3 Usage Patterns
- [ ] Document common usage patterns
- [ ] Create example workflows
- [ ] Add code snippets for implementation

**Implementation Details:**
- Document common usage patterns for components and features
- Create example workflows for common tasks
- Add code snippets for implementation
- Include best practices and anti-patterns
- Document integration patterns with other libraries

**Tests:**
- [ ] Verify documentation accuracy
- [ ] Test code snippets
- [ ] Gather user feedback

**Testing Instructions:**
- Verify documentation accuracy
- Test all code snippets
- Gather user feedback on documentation clarity
- Update based on feedback

## Notes for Implementation

- All user-facing text must support both French and Arabic
- Document categories must be clearly labeled and organized by date
- UI should be simple and intuitive for non-technical users
- Test on both desktop and mobile devices
- Consider accessibility requirements throughout development 
- All UI components should have corresponding Storybook stories
- Storybook should be used for visual regression testing 

## Known Issues and Priorities

1. **Document Search**: The document browser component needs search functionality implemented
2. **Document Preview**: File preview for different formats is not yet implemented
3. **Translation Workflow**: The OpenAI translation service needs to be implemented
4. **Audit Logging**: Content changes should be logged for accountability
5. **User Management**: The user management interface needs to be implemented
6. **Dashboard Redesign**: The owner dashboard needs to be redesigned for document access
7. **Public Area**: The public area needs to be redesigned for the HOA portal
8. **i18n Type Errors**: Fix async function handling in i18n server utilities 