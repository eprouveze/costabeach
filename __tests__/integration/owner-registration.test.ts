import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { createServiceClient, createAuthClient, TestUser } from '../security/test-utils';

describe('Owner Registration with RLS Policies', () => {
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
  
  // Registration IDs
  let regularUserRegistrationId: string;
  let anotherUserRegistrationId: string;
  
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
    
    // Create owner registrations
    const { data: regData1 } = await serviceClient
      .from('OwnerRegistration')
      .insert({
        id: uuidv4(),
        email: regularUser.email,
        name: 'Regular User Business',
        status: 'pending',
      })
      .select();
    
    regularUserRegistrationId = regData1![0].id;
    
    const { data: regData2 } = await serviceClient
      .from('OwnerRegistration')
      .insert({
        id: uuidv4(),
        email: anotherUser.email,
        name: 'Another User Business',
        status: 'pending',
      })
      .select();
    
    anotherUserRegistrationId = regData2![0].id;
  });
  
  // Clean up test data
  afterAll(async () => {
    await serviceClient.from('OwnerRegistration').delete().in('id', [
      regularUserRegistrationId,
      anotherUserRegistrationId,
    ]);
    
    await serviceClient.from('User').delete().in('id', [
      adminUser.id,
      regularUser.id,
      anotherUser.id,
    ]);
  });
  
  test('regular user should be able to view their own registration', async () => {
    const { data, error } = await regularUserClient
      .from('OwnerRegistration')
      .select('*')
      .eq('email', regularUser.email);
    
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].id).toBe(regularUserRegistrationId);
    expect(data![0].email).toBe(regularUser.email);
  });
  
  test('regular user should not be able to view others registrations', async () => {
    const { data, error } = await regularUserClient
      .from('OwnerRegistration')
      .select('*')
      .eq('email', anotherUser.email);
    
    expect(error).toBeNull();
    expect(data).toHaveLength(0); // RLS should filter this out
  });
  
  test('admin user should be able to view and update all registrations', async () => {
    // Admin should see all registrations
    const { data: allData, error: allError } = await adminClient
      .from('OwnerRegistration')
      .select('*');
    
    expect(allError).toBeNull();
    expect(allData!.length).toBeGreaterThanOrEqual(2);
    
    // Admin should be able to update status
    const { error: updateError } = await adminClient
      .from('OwnerRegistration')
      .update({ status: 'approved' })
      .eq('id', regularUserRegistrationId);
    
    expect(updateError).toBeNull();
    
    // Verify update was successful
    const { data: updatedData } = await serviceClient
      .from('OwnerRegistration')
      .select('status')
      .eq('id', regularUserRegistrationId);
    
    expect(updatedData![0].status).toBe('approved');
  });
  
  test('regular user should be able to create their own registration', async () => {
    // First, delete the existing registration for this test
    await serviceClient
      .from('OwnerRegistration')
      .delete()
      .eq('id', regularUserRegistrationId);
    
    // Now create a new one
    const newRegistration = {
      name: 'New Business Name',
      email: regularUser.email,
      phone: '123-456-7890',
      business_type: 'Restaurant',
    };
    
    const { data, error } = await regularUserClient
      .from('OwnerRegistration')
      .insert(newRegistration)
      .select();
    
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].name).toBe(newRegistration.name);
    expect(data![0].email).toBe(regularUser.email);
    
    // Update regularUserRegistrationId for cleanup
    regularUserRegistrationId = data![0].id;
  });
  
  test('regular user should not be able to create registration with another email', async () => {
    const badRegistration = {
      name: 'Fake Business',
      email: anotherUser.email, // Using someone else's email
      phone: '555-555-5555',
      business_type: 'Cafe',
    };
    
    const { data, error } = await regularUserClient
      .from('OwnerRegistration')
      .insert(badRegistration)
      .select();
    
    // Should be rejected by RLS
    expect(error).not.toBeNull();
    expect(data).toBeNull();
  });
  
  test('regular user should be able to update their own registration', async () => {
    const { error } = await regularUserClient
      .from('OwnerRegistration')
      .update({ name: 'Updated Business Name' })
      .eq('id', regularUserRegistrationId);
    
    expect(error).toBeNull();
    
    // Verify update was successful
    const { data } = await serviceClient
      .from('OwnerRegistration')
      .select('name')
      .eq('id', regularUserRegistrationId);
    
    expect(data![0].name).toBe('Updated Business Name');
  });
  
  test('regular user should not be able to update others registrations', async () => {
    const { error } = await regularUserClient
      .from('OwnerRegistration')
      .update({ name: 'Hacked Business Name' })
      .eq('id', anotherUserRegistrationId);
    
    // This update should fail with no rows affected (filtered by RLS)
    expect(error).toBeNull(); // No error, but no effect
    
    // Verify no changes were made
    const { data } = await serviceClient
      .from('OwnerRegistration')
      .select('name')
      .eq('id', anotherUserRegistrationId);
    
    expect(data![0].name).not.toBe('Hacked Business Name');
  });
}); 