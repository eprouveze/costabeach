import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { createServiceClient, createAuthClient, TestUser } from '../security/test-utils';

describe('Admin Functionality with RLS Policies', () => {
  // Test users
  const adminUser: TestUser = {
    id: uuidv4(),
    email: `admin-${uuidv4()}@example.com`,
    role: 'admin',
  };
  
  const contentEditorUser: TestUser = {
    id: uuidv4(),
    email: `editor-${uuidv4()}@example.com`,
    role: 'content_editor',
  };
  
  const regularUser: TestUser = {
    id: uuidv4(),
    email: `user-${uuidv4()}@example.com`,
  };
  
  // Test IDs
  let allowlistId: string;
  
  // Create clients
  const serviceClient = createServiceClient();
  const adminClient = createAuthClient(adminUser);
  const editorClient = createAuthClient(contentEditorUser);
  const regularUserClient = createAuthClient(regularUser);
  
  // Set up test data
  beforeAll(async () => {
    // Create test users in DB
    await serviceClient
      .from('User')
      .insert([
        adminUser,
        contentEditorUser,
        regularUser,
      ]);
    
    // Create allowlist entry
    const { data: allowlistData } = await serviceClient
      .from('Allowlist')
      .insert({
        id: uuidv4(),
        email: `allowed-${uuidv4()}@example.com`,
        created_at: new Date().toISOString(),
      })
      .select();
    
    allowlistId = allowlistData![0].id;
  });
  
  // Clean up test data
  afterAll(async () => {
    await serviceClient.from('Allowlist').delete().eq('id', allowlistId);
    
    await serviceClient.from('User').delete().in('id', [
      adminUser.id,
      contentEditorUser.id,
      regularUser.id,
    ]);
  });
  
  // === Allowlist Table Tests ===
  
  test('admin user should be able to view allowlist entries', async () => {
    const { data, error } = await adminClient
      .from('Allowlist')
      .select('*');
    
    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThanOrEqual(1);
    expect(data!.some(entry => entry.id === allowlistId)).toBe(true);
  });
  
  test('content editor should not be able to view allowlist entries', async () => {
    const { data, error } = await editorClient
      .from('Allowlist')
      .select('*');
    
    // Editor should get empty result due to RLS
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });
  
  test('regular user should not be able to view allowlist entries', async () => {
    const { data, error } = await regularUserClient
      .from('Allowlist')
      .select('*');
    
    // Regular user should get empty result due to RLS
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });
  
  test('admin user should be able to create allowlist entries', async () => {
    const newAllowlistEntry = {
      email: `new-allowed-${uuidv4()}@example.com`,
      created_at: new Date().toISOString(),
    };
    
    const { data, error } = await adminClient
      .from('Allowlist')
      .insert(newAllowlistEntry)
      .select();
    
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].email).toBe(newAllowlistEntry.email);
    
    // Clean up
    await serviceClient.from('Allowlist').delete().eq('id', data![0].id);
  });
  
  test('non-admin users should not be able to create allowlist entries', async () => {
    const newAllowlistEntry = {
      email: `attempted-${uuidv4()}@example.com`,
      created_at: new Date().toISOString(),
    };
    
    // Try with content editor
    const { data: editorData, error: editorError } = await editorClient
      .from('Allowlist')
      .insert(newAllowlistEntry)
      .select();
    
    expect(editorError).not.toBeNull();
    expect(editorData).toBeNull();
    
    // Try with regular user
    const { data: userData, error: userError } = await regularUserClient
      .from('Allowlist')
      .insert(newAllowlistEntry)
      .select();
    
    expect(userError).not.toBeNull();
    expect(userData).toBeNull();
  });
  
  // === User Management Tests ===
  
  test('admin user should be able to view all users', async () => {
    const { data, error } = await adminClient
      .from('User')
      .select('*');
    
    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThanOrEqual(3);
  });
  
  test('admin user should be able to update user roles', async () => {
    // Update regular user to have content_editor role
    const { error } = await adminClient
      .from('User')
      .update({ role: 'content_editor' })
      .eq('id', regularUser.id);
    
    expect(error).toBeNull();
    
    // Verify update was successful
    const { data } = await serviceClient
      .from('User')
      .select('role')
      .eq('id', regularUser.id);
    
    expect(data![0].role).toBe('content_editor');
    
    // Reset role back
    await serviceClient
      .from('User')
      .update({ role: null })
      .eq('id', regularUser.id);
  });
  
  test('non-admin users should not be able to update user roles', async () => {
    // Try with content editor
    const { error: editorError } = await editorClient
      .from('User')
      .update({ role: 'admin' })
      .eq('id', contentEditorUser.id);
    
    expect(editorError).not.toBeNull();
    
    // Try with regular user
    const { error: userError } = await regularUserClient
      .from('User')
      .update({ role: 'admin' })
      .eq('id', regularUser.id);
    
    expect(userError).not.toBeNull();
    
    // Verify no changes were made
    const { data: editorData } = await serviceClient
      .from('User')
      .select('role')
      .eq('id', contentEditorUser.id);
    
    expect(editorData![0].role).toBe('content_editor');
  });
  
  // === VerificationToken Table Tests ===
  
  test('only service role should access verification tokens', async () => {
    // First create a verification token with service role
    const token = {
      identifier: `test-${uuidv4()}@example.com`,
      token: uuidv4(),
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // expires in 24 hours
    };
    
    await serviceClient
      .from('VerificationToken')
      .insert(token);
    
    // Try to access with admin (should fail)
    const { data: adminData, error: adminError } = await adminClient
      .from('VerificationToken')
      .select('*')
      .eq('identifier', token.identifier);
    
    // RLS should block access - admin gets empty result
    expect(adminError).toBeNull();
    expect(adminData).toHaveLength(0);
    
    // Cleanup
    await serviceClient
      .from('VerificationToken')
      .delete()
      .eq('identifier', token.identifier);
  });
  
  // === _prisma_migrations Table Tests ===
  
  test('only service role should access prisma migrations', async () => {
    // Try to access with admin (should fail)
    const { data: adminData, error: adminError } = await adminClient
      .from('_prisma_migrations')
      .select('*')
      .limit(1);
    
    // RLS should block access - admin gets empty result
    expect(adminError).toBeNull();
    expect(adminData).toHaveLength(0);
  });
}); 