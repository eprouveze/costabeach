import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for admin access
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET() {
  try {
    // Create users table if it doesn't exist
    const { error: createTableError } = await supabaseAdmin.from('users').select('id').limit(1);
    
    if (createTableError && createTableError.message.includes('does not exist')) {
      // Table doesn't exist, create it
      const { error } = await supabaseAdmin.sql`
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
      
      if (error) {
        console.error('Error creating users table:', error);
        return NextResponse.json({ error: 'Error creating users table' }, { status: 500 });
      }
    }
    
    // Create a function to handle new user creation
    const { error: createFunctionError } = await supabaseAdmin.sql`
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
    
    if (createFunctionError) {
      console.error('Error creating user function:', createFunctionError);
      return NextResponse.json({ error: 'Error creating user function' }, { status: 500 });
    }
    
    // Create a trigger to automatically create a user record when a new auth user is created
    const { error: createTriggerError } = await supabaseAdmin.sql`
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;
    
    if (createTriggerError) {
      console.error('Error creating trigger:', createTriggerError);
      return NextResponse.json({ error: 'Error creating trigger' }, { status: 500 });
    }
    
    // Create RLS policies for the users table
    const { error: createPoliciesError } = await supabaseAdmin.sql`
      ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
      
      -- First, drop any existing policies to avoid conflicts
      DROP POLICY IF EXISTS "Users can read their own data" ON "users";
      DROP POLICY IF EXISTS "Users can update their own data" ON "users";
      DROP POLICY IF EXISTS "Service role can read all users" ON "users";
      DROP POLICY IF EXISTS "Service role can update all users" ON "users";
      DROP POLICY IF EXISTS "Service role can insert users" ON "users";
      DROP POLICY IF EXISTS "Anyone can insert users" ON "users";
      DROP POLICY IF EXISTS "Auth can insert users" ON "users";
      
      -- Allow users to read their own data
      CREATE POLICY "Users can read their own data" ON "users"
        FOR SELECT USING (auth.uid() = id);
      
      -- Allow users to update their own data
      CREATE POLICY "Users can update their own data" ON "users"
        FOR UPDATE USING (auth.uid() = id);
      
      -- Allow authenticated users to insert their own user record
      CREATE POLICY "Auth can insert users" ON "users"
        FOR INSERT WITH CHECK (auth.uid() = id);
      
      -- Allow service role to read all users
      CREATE POLICY "Service role can read all users" ON "users"
        FOR SELECT USING (auth.role() = 'service_role');
      
      -- Allow service role to update all users
      CREATE POLICY "Service role can update all users" ON "users"
        FOR UPDATE USING (auth.role() = 'service_role');
      
      -- Allow service role to insert users
      CREATE POLICY "Service role can insert users" ON "users"
        FOR INSERT WITH CHECK (auth.role() = 'service_role');
      
      -- Allow anyone to insert users (for testing purposes)
      CREATE POLICY "Anyone can insert users" ON "users"
        FOR INSERT WITH CHECK (true);
    `;
    
    if (createPoliciesError) {
      console.error('Error creating policies:', createPoliciesError);
      return NextResponse.json({ error: 'Error creating policies' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: "Database setup completed successfully" });
  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json({ error: 'Error setting up database' }, { status: 500 });
  }
} 