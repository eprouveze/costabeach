# Row Level Security (RLS) Tests

This directory contains tests that verify the correct implementation of Supabase Row Level Security (RLS) policies across various tables in the application.

## Test Structure

The tests are organized into several files:

- `__tests__/security/test-utils.ts` - Utility functions for creating test users, clients with different authentication contexts, and test data
- `__tests__/integration/auth-flows.test.ts` - Tests for authentication flows with RLS (register, login, logout)
- `__tests__/integration/owner-registration.test.ts` - Tests for owner registration process with RLS
- `__tests__/integration/document-management.test.ts` - Tests for document viewing, creation, and management with RLS
- `__tests__/integration/admin-functionality.test.ts` - Tests for admin-specific functionality with RLS
- `__tests__/integration/account-session.test.ts` - Tests for Account and Session tables with RLS

## Running the Tests

To run all RLS tests:

```bash
npm test -- --testPathPattern=__tests__/integration
```

To run a specific test file:

```bash
npm test -- __tests__/integration/auth-flows.test.ts
```

## Prerequisites

Before running the tests, make sure:

1. You have a Supabase instance with the RLS policies implemented
2. The following environment variables are set in your `.env.test` file:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - The anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` - The service role key (needed for test setup)

## Test Coverage

These tests verify the following aspects of RLS policies:

### Authentication Flows
- User registration creates proper records
- Users can access their own data after login
- Users cannot access other users' data
- Session invalidation works correctly upon logout

### Owner Registration
- Users can create and view their own registrations
- Users cannot view or modify others' registrations
- Admins can view and update all registrations
- Email-based access control works as expected

### Document Management
- All authenticated users can view documents
- Only admins and content editors can create documents
- Only admins and content editors can update documents
- Only admins and content editors can delete documents

### Admin Functionality
- Admin users can view and manage allowlist entries
- Non-admin users cannot access the allowlist
- Admin users can view and update user roles
- Only service role can access VerificationToken and _prisma_migrations tables

### Account and Session Security
- Users can view and manage their own accounts and sessions
- Users cannot access other users' accounts or sessions
- Admin users can view all accounts and sessions

## Troubleshooting

If tests are failing, check the following:

1. Confirm your RLS policies are correctly implemented on all tables
2. Verify the environment variables are set correctly
3. Ensure your Supabase instance is running and accessible
4. Check the database schema matches what the tests expect 