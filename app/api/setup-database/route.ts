import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

// Create a Supabase client with the service role key for admin access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create a PostgreSQL client for direct SQL execution
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function GET() {
  try {
    // Check if users table exists
    const { data, error: checkTableError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);
    
    let tableExists = !checkTableError || !checkTableError.message?.includes('does not exist');
    
    if (!tableExists) {
      console.log('Users table does not exist, creating it...');
      
      // Create users table
      const client = await pool.connect();
      try {
        // Create users table
        await client.query(`
          CREATE TABLE IF NOT EXISTS public.users (
            id UUID PRIMARY KEY,
            name TEXT,
            email TEXT UNIQUE,
            email_verified TIMESTAMP,
            image TEXT,
            role TEXT DEFAULT 'user',
            is_admin BOOLEAN DEFAULT FALSE,
            building_number TEXT,
            apartment_number TEXT,
            phone_number TEXT,
            is_verified_owner BOOLEAN DEFAULT FALSE,
            permissions TEXT[],
            preferred_language TEXT DEFAULT 'french',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
        
        // Create function to handle new user creation
        await client.query(`
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
        `);
        
        // Create trigger
        await client.query(`
          DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
          CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        `);
        
        // Create RLS policies
        await client.query(`
          ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
          
          -- Drop existing policies to avoid conflicts
          DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
          DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
          DROP POLICY IF EXISTS "Service role can read all users" ON public.users;
          DROP POLICY IF EXISTS "Service role can update all users" ON public.users;
          DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
          DROP POLICY IF EXISTS "Anyone can insert users" ON public.users;
          DROP POLICY IF EXISTS "Auth can insert users" ON public.users;
          
          -- Create new policies
          CREATE POLICY "Users can read their own data" ON public.users
            FOR SELECT USING (auth.uid() = id);
          
          CREATE POLICY "Users can update their own data" ON public.users
            FOR UPDATE USING (auth.uid() = id);
          
          CREATE POLICY "Auth can insert users" ON public.users
            FOR INSERT WITH CHECK (auth.uid() = id);
          
          CREATE POLICY "Service role can read all users" ON public.users
            FOR SELECT USING (auth.role() = 'service_role');
          
          CREATE POLICY "Service role can update all users" ON public.users
            FOR UPDATE USING (auth.role() = 'service_role');
          
          CREATE POLICY "Service role can insert users" ON public.users
            FOR INSERT WITH CHECK (auth.role() = 'service_role');
          
          CREATE POLICY "Anyone can insert users" ON public.users
            FOR INSERT WITH CHECK (true);
        `);
        
        console.log('Database setup completed successfully');
      } catch (error) {
        console.error('Error executing SQL:', error);
        return NextResponse.json({ error: 'Error setting up database' }, { status: 500 });
      } finally {
        client.release();
      }
    } else {
      console.log('Users table already exists');
    }
    
    return NextResponse.json({ success: true, message: "Database setup completed successfully" });
  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json({ error: 'Error setting up database' }, { status: 500 });
  }
} 