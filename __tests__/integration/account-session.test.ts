import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { createServiceClient, createAuthClient, TestUser } from '../security/test-utils';

describe('Account and Session Tables with RLS Policies', () => {
  // Test users
  const adminUser: TestUser = {
    id: uuidv4(),
    email: `admin-${uuidv4()}@example.com`,
    role: 'admin',
  };
  
  const regularUser: TestUser = {
    id: uuidv4(),
    email: `user-${uuidv4()}@example.com`,
  };
  
  const anotherUser: TestUser = {
    id: uuidv4(),
    email: `another-${uuidv4()}@example.com`,
  };
  
  // Test IDs
  let regularUserAccountId: string;
  let regularUserSessionId: string;
  let anotherUserAccountId: string;
  let anotherUserSessionId: string;
  
  // Create clients
  const serviceClient = createServiceClient();
  const adminClient = createAuthClient(adminUser);
  const regularUserClient = createAuthClient(regularUser);
  const anotherUserClient = createAuthClient(anotherUser);
  
  // Set up test data
  beforeAll(async () => {
    // Create test users in DB
    await serviceClient
      .from('User')
      .insert([
        adminUser,
        regularUser,
        anotherUser,
      ]);
    
    // Create test accounts
    const regularAccount = {
      id: uuidv4(),
      userId: regularUser.id,
      type: 'oauth',
      provider: 'google',
      providerAccountId: `google-${uuidv4()}`,
      refresh_token: uuidv4(),
      access_token: uuidv4(),
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      scope: 'email profile',
      id_token: uuidv4(),
    };
    
    const anotherAccount = {
      id: uuidv4(),
      userId: anotherUser.id,
      type: 'oauth',
      provider: 'github',
      providerAccountId: `github-${uuidv4()}`,
      refresh_token: uuidv4(),
      access_token: uuidv4(),
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      scope: 'user',
    };
    
    const { data: regAccData } = await serviceClient
      .from('Account')
      .insert(regularAccount)
      .select();
    
    regularUserAccountId = regAccData![0].id;
    
    const { data: anotherAccData } = await serviceClient
      .from('Account')
      .insert(anotherAccount)
      .select();
    
    anotherUserAccountId = anotherAccData![0].id;
    
    // Create test sessions
    const regularSession = {
      id: uuidv4(),
      sessionToken: uuidv4(),
      userId: regularUser.id,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // expires in 24 hours
    };
    
    const anotherSession = {
      id: uuidv4(),
      sessionToken: uuidv4(),
      userId: anotherUser.id,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // expires in 24 hours
    };
    
    const { data: regSessData } = await serviceClient
      .from('Session')
      .insert(regularSession)
      .select();
    
    regularUserSessionId = regSessData![0].id;
    
    const { data: anotherSessData } = await serviceClient
      .from('Session')
      .insert(anotherSession)
      .select();
    
    anotherUserSessionId = anotherSessData![0].id;
  });
  
  // Clean up test data
  afterAll(async () => {
    await serviceClient.from('Session').delete().in('id', [
      regularUserSessionId,
      anotherUserSessionId,
    ]);
    
    await serviceClient.from('Account').delete().in('id', [
      regularUserAccountId,
      anotherUserAccountId,
    ]);
    
    await serviceClient.from('User').delete().in('id', [
      adminUser.id,
      regularUser.id,
      anotherUser.id,
    ]);
  });
  
  // === Account Table Tests ===
  
  test('users should be able to view their own accounts', async () => {
    const { data, error } = await regularUserClient
      .from('Account')
      .select('*')
      .eq('userId', regularUser.id);
    
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].id).toBe(regularUserAccountId);
  });
  
  test('users should not be able to view other users accounts', async () => {
    const { data, error } = await regularUserClient
      .from('Account')
      .select('*')
      .eq('userId', anotherUser.id);
    
    expect(error).toBeNull();
    expect(data).toHaveLength(0); // RLS should filter this out
  });
  
  test('admin user should be able to view all accounts', async () => {
    const { data, error } = await adminClient
      .from('Account')
      .select('*');
    
    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThanOrEqual(2);
  });
  
  test('regular user should be able to update their own account', async () => {
    const { error } = await regularUserClient
      .from('Account')
      .update({ scope: 'email profile openid' })
      .eq('id', regularUserAccountId);
    
    expect(error).toBeNull();
    
    // Verify update was successful
    const { data } = await serviceClient
      .from('Account')
      .select('scope')
      .eq('id', regularUserAccountId);
    
    expect(data![0].scope).toBe('email profile openid');
  });
  
  test('regular user should not be able to update other accounts', async () => {
    const { error } = await regularUserClient
      .from('Account')
      .update({ scope: 'hacked' })
      .eq('id', anotherUserAccountId);
    
    expect(error).not.toBeNull();
    
    // Verify no changes were made
    const { data } = await serviceClient
      .from('Account')
      .select('scope')
      .eq('id', anotherUserAccountId);
    
    expect(data![0].scope).not.toBe('hacked');
  });
  
  // === Session Table Tests ===
  
  test('users should be able to view their own sessions', async () => {
    const { data, error } = await regularUserClient
      .from('Session')
      .select('*')
      .eq('userId', regularUser.id);
    
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].id).toBe(regularUserSessionId);
  });
  
  test('users should not be able to view other users sessions', async () => {
    const { data, error } = await regularUserClient
      .from('Session')
      .select('*')
      .eq('userId', anotherUser.id);
    
    expect(error).toBeNull();
    expect(data).toHaveLength(0); // RLS should filter this out
  });
  
  test('admin user should be able to view all sessions', async () => {
    const { data, error } = await adminClient
      .from('Session')
      .select('*');
    
    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThanOrEqual(2);
  });
  
  test('regular user should be able to delete their own session', async () => {
    // First create a new session for the regular user to delete
    const newSession = {
      id: uuidv4(),
      sessionToken: uuidv4(),
      userId: regularUser.id,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    
    const { data: newSessionData } = await serviceClient
      .from('Session')
      .insert(newSession)
      .select();
    
    const newSessionId = newSessionData![0].id;
    
    // Now try to delete it
    const { error } = await regularUserClient
      .from('Session')
      .delete()
      .eq('id', newSessionId);
    
    expect(error).toBeNull();
    
    // Verify deletion
    const { data, count } = await serviceClient
      .from('Session')
      .select('*', { count: 'exact' })
      .eq('id', newSessionId);
    
    expect(count).toBe(0);
    expect(data).toHaveLength(0);
  });
  
  test('regular user should not be able to delete other users sessions', async () => {
    const { error } = await regularUserClient
      .from('Session')
      .delete()
      .eq('id', anotherUserSessionId);
    
    expect(error).not.toBeNull();
    
    // Verify session still exists
    const { data } = await serviceClient
      .from('Session')
      .select('*')
      .eq('id', anotherUserSessionId);
    
    expect(data).toHaveLength(1);
  });
}); 