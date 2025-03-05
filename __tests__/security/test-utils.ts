import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { describe, test, expect } from '@jest/globals';

// Types for test users
export type TestUser = {
  id: string;
  email: string;
  role?: string;
};

// Create test users with different roles
export const createTestUsers = (): {
  adminUser: TestUser;
  contentEditorUser: TestUser;
  regularUser: TestUser;
  anotherRegularUser: TestUser;
} => {
  return {
    adminUser: {
      id: uuidv4(),
      email: `admin-${uuidv4()}@example.com`,
      role: 'admin',
    },
    contentEditorUser: {
      id: uuidv4(),
      email: `content-editor-${uuidv4()}@example.com`,
      role: 'content_editor',
    },
    regularUser: {
      id: uuidv4(),
      email: `user-${uuidv4()}@example.com`,
    },
    anotherRegularUser: {
      id: uuidv4(),
      email: `another-user-${uuidv4()}@example.com`,
    },
  };
};

// Create a supabase client with the appropriate authentication context
export const createAuthClient = (
  user?: TestUser
): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.com';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key';

  const client = createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession: false,
      },
    }
  );

  // If a user is provided, set the auth context for the client
  if (user) {
    // @ts-ignore - We're setting the auth token manually for test purposes
    client.auth.session = () => ({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  }

  return client;
};

// Create a supabase client with the service role
export const createServiceClient = (): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.com';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key';

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
      },
    }
  );
};

// Setup test data
export const setupTestData = async (
  serviceClient: SupabaseClient,
  users: ReturnType<typeof createTestUsers>
) => {
  // Insert test users
  await serviceClient.from('User').insert([
    { id: users.adminUser.id, email: users.adminUser.email, role: users.adminUser.role },
    { id: users.contentEditorUser.id, email: users.contentEditorUser.email, role: users.contentEditorUser.role },
    { id: users.regularUser.id, email: users.regularUser.email },
    { id: users.anotherRegularUser.id, email: users.anotherRegularUser.email },
  ]);

  // Insert test documents
  const adminDocument = {
    id: uuidv4(),
    title: 'Admin Document',
    content: 'Content created by admin',
    user_id: users.adminUser.id,
  };

  const contentEditorDocument = {
    id: uuidv4(),
    title: 'Content Editor Document',
    content: 'Content created by content editor',
    user_id: users.contentEditorUser.id,
  };

  const regularUserDocument = {
    id: uuidv4(),
    title: 'Regular User Document',
    content: 'Content created by regular user',
    user_id: users.regularUser.id,
  };

  await serviceClient.from('Document').insert([
    adminDocument,
    contentEditorDocument,
    regularUserDocument,
  ]);

  // Insert test owner registrations
  await serviceClient.from('OwnerRegistration').insert([
    {
      id: uuidv4(),
      email: users.regularUser.email,
      name: 'Regular User Business',
      status: 'pending',
    },
    {
      id: uuidv4(),
      email: users.anotherRegularUser.email,
      name: 'Another User Business',
      status: 'approved',
    },
  ]);

  return {
    documents: {
      adminDocument,
      contentEditorDocument,
      regularUserDocument,
    },
  };
};

// Clean up test data
export const cleanupTestData = async (serviceClient: SupabaseClient, users: ReturnType<typeof createTestUsers>) => {
  await serviceClient.from('Document').delete().in('user_id', [
    users.adminUser.id,
    users.contentEditorUser.id,
    users.regularUser.id,
  ]);
  
  await serviceClient.from('OwnerRegistration').delete().in('email', [
    users.regularUser.email,
    users.anotherRegularUser.email,
  ]);
  
  await serviceClient.from('User').delete().in('id', [
    users.adminUser.id,
    users.contentEditorUser.id,
    users.regularUser.id,
    users.anotherRegularUser.id,
  ]);
};

// Add a basic test to satisfy Jest requirement
describe('Test Utils', () => {
  test('createTestUsers should return expected user roles', () => {
    const users = createTestUsers();
    expect(users.adminUser.role).toBe('admin');
    expect(users.contentEditorUser.role).toBe('content_editor');
    expect(users.regularUser.role).toBeUndefined();
  });
}); 