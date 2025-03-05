# Security Tests

This directory contains tests for verifying the security of the application, particularly focusing on Row Level Security (RLS) policies in Supabase.

## Row Level Security (RLS) Tests

The tests in this directory verify that the RLS policies implemented in Supabase are working correctly. These tests ensure that:

1. Users can only access data they are authorized to see
2. Users can only modify data they are authorized to modify
3. Admin users have appropriate elevated permissions
4. Service roles can access necessary data for server-side operations

### Test Files

- `document-rls.test.js`: Tests for Document table RLS policies
- `owner-registration-rls.test.js`: Tests for OwnerRegistration table RLS policies
- `test-utils.ts`: Utility functions for creating test users, clients, and data

### Running the Tests

To run all security tests:

```bash
npm test -- __tests__/security
```

To run a specific test file:

```bash
npm test -- __tests__/security/document-rls.test.js
```

## Test Environment

The tests use a simulated environment by default, which means they don't actually connect to Supabase but use mocked responses. This allows the tests to run quickly and without requiring a real database connection.

The mock implementation is defined in `jest.setup.js` at the root of the project.

## Adding New Tests

When adding new RLS policies to the database, you should also add corresponding tests to verify they work as expected. Follow these steps:

1. Create a new test file if testing a new table, or add to an existing file if extending policies for an existing table
2. Use the utility functions in `test-utils.ts` to create test users and clients
3. Write tests that verify both positive cases (authorized access works) and negative cases (unauthorized access is blocked)
4. Run the tests to ensure they pass

## Test Structure

Each test file follows a similar structure:

1. Import necessary dependencies
2. Define test users with different roles
3. Create authenticated clients for each user
4. Test various operations (select, insert, update, delete) with different user roles
5. Verify that operations succeed or fail according to the expected RLS policies

## Example Test

```javascript
test('regular user should be able to view their own registration', async () => {
  const result = await regularUserClient
    .from('OwnerRegistration')
    .select('*')
    .eq('email', regularUser.email);
  
  expect(result.error || null).toBeNull();
  expect(result.data?.length).toBeGreaterThanOrEqual(1);
});
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