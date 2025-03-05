import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { createServiceClient } from '../security/test-utils';

describe('Authentication Flows with RLS Policies', () => {
  const testEmail = `test-${uuidv4()}@example.com`;
  const testPassword = 'Password123!';
  let userId: string | undefined;
  
  // Create clients
  const serviceClient = createServiceClient();
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
  
  // Clean up after all tests
  afterAll(async () => {
    if (userId) {
      // Clean up the test user using service role
      await serviceClient.from('User').delete().eq('id', userId);
    }
  });
  
  test('should allow user registration', async () => {
    // Register a new user
    const { data, error } = await anonClient.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    expect(error).toBeNull();
    expect(data.user).not.toBeNull();
    userId = data.user?.id;
    
    // Verify user was created in the User table via service role
    const { data: userData, error: userError } = await serviceClient
      .from('User')
      .select('*')
      .eq('id', userId);
    
    expect(userError).toBeNull();
    expect(userData).toHaveLength(1);
    expect(userData![0].email).toBe(testEmail);
  });
  
  test('should allow user login', async () => {
    // Login with the created user
    const { data, error } = await anonClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    expect(error).toBeNull();
    expect(data.user).not.toBeNull();
    expect(data.user?.id).toBe(userId);
    
    // Verify access token works by fetching user's own data
    const authedClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { 
        auth: { 
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${data.session?.access_token}`,
          },
        },
      }
    );
    
    // Attempt to access own user data (should be allowed by RLS)
    const { data: userData, error: userError } = await authedClient
      .from('User')
      .select('*')
      .eq('id', userId);
    
    expect(userError).toBeNull();
    expect(userData).toHaveLength(1);
    expect(userData![0].email).toBe(testEmail);
  });
  
  test('should restrict access to other users data', async () => {
    // First, create another test user with service role
    const anotherUserId = uuidv4();
    await serviceClient
      .from('User')
      .insert({
        id: anotherUserId,
        email: `another-${uuidv4()}@example.com`,
      });
    
    // Login with the first test user
    const { data } = await anonClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    // Setup authenticated client
    const authedClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { 
        auth: { 
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${data.session?.access_token}`,
          },
        },
      }
    );
    
    // Attempt to access another user's data (should be restricted by RLS)
    const { data: otherUserData, error: otherUserError } = await authedClient
      .from('User')
      .select('*')
      .eq('id', anotherUserId);
    
    // We expect no error but empty data (RLS should filter out the row)
    expect(otherUserData).toHaveLength(0);
    
    // Clean up the other test user
    await serviceClient.from('User').delete().eq('id', anotherUserId);
  });
  
  test('should properly handle logout', async () => {
    // Login with test user
    const { data } = await anonClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    const authedClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { 
        auth: { 
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${data.session?.access_token}`,
          },
        },
      }
    );
    
    // Verify we can access our own data
    const { data: beforeLogout } = await authedClient
      .from('User')
      .select('*')
      .eq('id', userId);
    
    expect(beforeLogout).toHaveLength(1);
    
    // Logout
    await authedClient.auth.signOut();
    
    // Create a new client with the same (now invalid) token
    const loggedOutClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { 
        auth: { 
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${data.session?.access_token}`,
          },
        },
      }
    );
    
    // Try to access data with invalid token (logout invalidates the token on the server)
    const { data: afterLogout } = await loggedOutClient
      .from('User')
      .select('*')
      .eq('id', userId);
    
    // The request should return no data due to RLS or auth failure
    expect(afterLogout).toHaveLength(0);
  });
}); 