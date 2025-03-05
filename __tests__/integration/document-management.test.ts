import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { createServiceClient, createAuthClient, TestUser } from '../security/test-utils';

describe('Document Management with RLS Policies', () => {
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
  
  const anotherUser: TestUser = {
    id: uuidv4(),
    email: `another-${uuidv4()}@example.com`,
  };
  
  // Document IDs
  let adminDocumentId: string;
  let editorDocumentId: string;
  let regularUserDocumentId: string;
  
  // Create clients
  const serviceClient = createServiceClient();
  const adminClient = createAuthClient(adminUser);
  const editorClient = createAuthClient(contentEditorUser);
  const regularUserClient = createAuthClient(regularUser);
  const anotherUserClient = createAuthClient(anotherUser);
  
  // Set up test data
  beforeAll(async () => {
    // Create test users in DB
    await serviceClient
      .from('User')
      .insert([
        adminUser,
        contentEditorUser,
        regularUser,
        anotherUser,
      ]);
    
    // Create documents
    const { data: adminDocData } = await serviceClient
      .from('Document')
      .insert({
        id: uuidv4(),
        title: 'Admin Document',
        content: 'Content created by admin',
        user_id: adminUser.id,
      })
      .select();
    
    adminDocumentId = adminDocData![0].id;
    
    const { data: editorDocData } = await serviceClient
      .from('Document')
      .insert({
        id: uuidv4(),
        title: 'Editor Document',
        content: 'Content created by editor',
        user_id: contentEditorUser.id,
      })
      .select();
    
    editorDocumentId = editorDocData![0].id;
    
    const { data: userDocData } = await serviceClient
      .from('Document')
      .insert({
        id: uuidv4(),
        title: 'User Document',
        content: 'Content created by regular user',
        user_id: regularUser.id,
      })
      .select();
    
    regularUserDocumentId = userDocData![0].id;
  });
  
  // Clean up test data
  afterAll(async () => {
    await serviceClient.from('Document').delete().in('id', [
      adminDocumentId,
      editorDocumentId,
      regularUserDocumentId,
    ]);
    
    await serviceClient.from('User').delete().in('id', [
      adminUser.id,
      contentEditorUser.id,
      regularUser.id,
      anotherUser.id,
    ]);
  });
  
  // === Document Viewing Tests ===
  
  test('all authenticated users should be able to view documents', async () => {
    // Admin user
    const { data: adminViewData, error: adminViewError } = await adminClient
      .from('Document')
      .select('*');
    
    expect(adminViewError).toBeNull();
    expect(adminViewData!.length).toBeGreaterThanOrEqual(3);
    
    // Content editor user
    const { data: editorViewData, error: editorViewError } = await editorClient
      .from('Document')
      .select('*');
    
    expect(editorViewError).toBeNull();
    expect(editorViewData!.length).toBeGreaterThanOrEqual(3);
    
    // Regular user
    const { data: userViewData, error: userViewError } = await regularUserClient
      .from('Document')
      .select('*');
    
    expect(userViewError).toBeNull();
    expect(userViewData!.length).toBeGreaterThanOrEqual(3);
    
    // Another regular user
    const { data: anotherViewData, error: anotherViewError } = await anotherUserClient
      .from('Document')
      .select('*');
    
    expect(anotherViewError).toBeNull();
    expect(anotherViewData!.length).toBeGreaterThanOrEqual(3);
  });
  
  // === Document Creation Tests ===
  
  test('admin user should be able to create documents', async () => {
    const newDocument = {
      title: 'New Admin Document',
      content: 'New content created by admin',
      user_id: adminUser.id,
    };
    
    const { data, error } = await adminClient
      .from('Document')
      .insert(newDocument)
      .select();
    
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].title).toBe(newDocument.title);
    
    // Clean up
    await serviceClient.from('Document').delete().eq('id', data![0].id);
  });
  
  test('content editor should be able to create documents', async () => {
    const newDocument = {
      title: 'New Editor Document',
      content: 'New content created by editor',
      user_id: contentEditorUser.id,
    };
    
    const { data, error } = await editorClient
      .from('Document')
      .insert(newDocument)
      .select();
    
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].title).toBe(newDocument.title);
    
    // Clean up
    await serviceClient.from('Document').delete().eq('id', data![0].id);
  });
  
  test('regular user should not be able to create documents', async () => {
    const newDocument = {
      title: 'Attempted Regular User Document',
      content: 'This should fail',
      user_id: regularUser.id,
    };
    
    const { data, error } = await regularUserClient
      .from('Document')
      .insert(newDocument)
      .select();
    
    // Should be rejected by RLS
    expect(error).not.toBeNull();
    expect(data).toBeNull();
  });
  
  // === Document Update Tests ===
  
  test('admin user should be able to update any document', async () => {
    const { error } = await adminClient
      .from('Document')
      .update({ title: 'Admin Updated Title' })
      .eq('id', regularUserDocumentId);
    
    expect(error).toBeNull();
    
    // Verify update was successful
    const { data } = await serviceClient
      .from('Document')
      .select('title')
      .eq('id', regularUserDocumentId);
    
    expect(data![0].title).toBe('Admin Updated Title');
  });
  
  test('content editor should be able to update any document', async () => {
    const { error } = await editorClient
      .from('Document')
      .update({ title: 'Editor Updated Title' })
      .eq('id', adminDocumentId);
    
    expect(error).toBeNull();
    
    // Verify update was successful
    const { data } = await serviceClient
      .from('Document')
      .select('title')
      .eq('id', adminDocumentId);
    
    expect(data![0].title).toBe('Editor Updated Title');
  });
  
  test('regular user should not be able to update documents', async () => {
    const { error } = await regularUserClient
      .from('Document')
      .update({ title: 'Regular User Updated Title' })
      .eq('id', editorDocumentId);
    
    // Should be rejected by RLS
    expect(error).not.toBeNull();
    
    // Verify no changes were made
    const { data } = await serviceClient
      .from('Document')
      .select('title')
      .eq('id', editorDocumentId);
    
    expect(data![0].title).not.toBe('Regular User Updated Title');
  });
  
  // === Document Deletion Tests ===
  
  test('admin user should be able to delete any document', async () => {
    // Create a document to delete
    const { data: docToDeleteData } = await serviceClient
      .from('Document')
      .insert({
        id: uuidv4(),
        title: 'Document to Delete by Admin',
        content: 'This will be deleted',
        user_id: contentEditorUser.id,
      })
      .select();
    
    const docToDeleteId = docToDeleteData![0].id;
    
    // Admin tries to delete
    const { error } = await adminClient
      .from('Document')
      .delete()
      .eq('id', docToDeleteId);
    
    expect(error).toBeNull();
    
    // Verify deletion
    const { data, count } = await serviceClient
      .from('Document')
      .select('*', { count: 'exact' })
      .eq('id', docToDeleteId);
    
    expect(count).toBe(0);
    expect(data).toHaveLength(0);
  });
  
  test('content editor should be able to delete any document', async () => {
    // Create a document to delete
    const { data: docToDeleteData } = await serviceClient
      .from('Document')
      .insert({
        id: uuidv4(),
        title: 'Document to Delete by Editor',
        content: 'This will be deleted',
        user_id: adminUser.id,
      })
      .select();
    
    const docToDeleteId = docToDeleteData![0].id;
    
    // Editor tries to delete
    const { error } = await editorClient
      .from('Document')
      .delete()
      .eq('id', docToDeleteId);
    
    expect(error).toBeNull();
    
    // Verify deletion
    const { data, count } = await serviceClient
      .from('Document')
      .select('*', { count: 'exact' })
      .eq('id', docToDeleteId);
    
    expect(count).toBe(0);
    expect(data).toHaveLength(0);
  });
  
  test('regular user should not be able to delete documents', async () => {
    // Regular user tries to delete
    const { error } = await regularUserClient
      .from('Document')
      .delete()
      .eq('id', editorDocumentId);
    
    // Should be rejected by RLS
    expect(error).not.toBeNull();
    
    // Verify document still exists
    const { data } = await serviceClient
      .from('Document')
      .select('*')
      .eq('id', editorDocumentId);
    
    expect(data).toHaveLength(1);
  });
}); 