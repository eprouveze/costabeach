import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Create users table if it doesn't exist
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS "users" (
        "id" UUID PRIMARY KEY,
        "name" TEXT,
        "email" TEXT UNIQUE,
        "email_verified" TIMESTAMP,
        "image" TEXT,
        "role" TEXT DEFAULT 'user',
        "is_admin" BOOLEAN DEFAULT FALSE,
        "building_number" TEXT,
        "apartment_number" TEXT,
        "phone_number" TEXT,
        "is_verified_owner" BOOLEAN DEFAULT FALSE,
        "permissions" TEXT[],
        "preferred_language" TEXT DEFAULT 'french',
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // Execute the SQL
    const { error: createTableError } = await supabase.rpc('pgclient', { query: createUsersTable });
    
    if (createTableError) {
      console.error('Error creating users table:', createTableError);
      return NextResponse.json({ error: 'Error creating users table' }, { status: 500 });
    }
    
    // Create a function to handle new user creation
    const createUserFunction = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.users (id, email, name, role, is_admin, is_verified_owner, preferred_language)
        VALUES (
          new.id,
          new.email,
          coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
          'user',
          false,
          false,
          coalesce(new.raw_user_meta_data->>'preferred_language', 'french')
        );
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Execute the SQL
    const { error: createFunctionError } = await supabase.rpc('pgclient', { query: createUserFunction });
    
    if (createFunctionError) {
      console.error('Error creating user function:', createFunctionError);
      return NextResponse.json({ error: 'Error creating user function' }, { status: 500 });
    }
    
    // Create a trigger to automatically create a user record when a new auth user is created
    const createTrigger = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;
    
    // Execute the SQL
    const { error: createTriggerError } = await supabase.rpc('pgclient', { query: createTrigger });
    
    if (createTriggerError) {
      console.error('Error creating trigger:', createTriggerError);
      return NextResponse.json({ error: 'Error creating trigger' }, { status: 500 });
    }
    
    // Create RLS policies for the users table
    const createPolicies = `
      ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
      
      -- Allow users to read their own data
      CREATE POLICY IF NOT EXISTS "Users can read their own data" ON "users"
        FOR SELECT USING (auth.uid() = id);
      
      -- Allow users to update their own data
      CREATE POLICY IF NOT EXISTS "Users can update their own data" ON "users"
        FOR UPDATE USING (auth.uid() = id);
      
      -- Allow service role to read all users
      CREATE POLICY IF NOT EXISTS "Service role can read all users" ON "users"
        FOR SELECT USING (auth.role() = 'service_role');
      
      -- Allow service role to update all users
      CREATE POLICY IF NOT EXISTS "Service role can update all users" ON "users"
        FOR UPDATE USING (auth.role() = 'service_role');
      
      -- Allow service role to insert users
      CREATE POLICY IF NOT EXISTS "Service role can insert users" ON "users"
        FOR INSERT WITH CHECK (auth.role() = 'service_role');
    `;
    
    // Execute the SQL
    const { error: createPoliciesError } = await supabase.rpc('pgclient', { query: createPolicies });
    
    if (createPoliciesError) {
      console.error('Error creating policies:', createPoliciesError);
      return NextResponse.json({ error: 'Error creating policies' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json({ error: 'Error setting up database' }, { status: 500 });
  }
} 