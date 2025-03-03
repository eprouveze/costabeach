import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get the supabase admin client
    const supabase = createClient();
    
    // Check connection to database
    const healthCheck = await prisma.$queryRaw`SELECT 1 as check`;
    
    // Create users table if it doesn't exist
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          role TEXT DEFAULT 'user',
          is_verified_owner BOOLEAN DEFAULT false,
          preferred_language TEXT DEFAULT 'french',
          permissions TEXT[] DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      console.log("Users table created or already exists");
    } catch (tableError: any) {
      console.error("Error creating users table:", tableError);
      return NextResponse.json({ 
        success: false, 
        message: "Error creating users table", 
        error: tableError.message 
      }, { status: 500 });
    }
    
    // Add RLS policies for users table
    try {
      // First check if RLS is already enabled
      const rlsCheck = await prisma.$queryRaw`
        SELECT relrowsecurity FROM pg_class WHERE relname = 'users';
      `;
      
      // Enable RLS if it's not already enabled
      await prisma.$executeRaw`
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      `;
      
      // Create policies (will fail silently if they already exist)
      try {
        await prisma.$executeRaw`
          CREATE POLICY "Users can view their own data" ON users
          FOR SELECT USING (auth.uid() = id);
        `;
      } catch (e) {
        console.log("Policy likely already exists");
      }
      
      try {
        await prisma.$executeRaw`
          CREATE POLICY "Users can update their own data" ON users
          FOR UPDATE USING (auth.uid() = id);
        `;
      } catch (e) {
        console.log("Policy likely already exists");
      }
      
      try {
        await prisma.$executeRaw`
          CREATE POLICY "Service role can manage all users" ON users
          USING (auth.jwt() ->> 'role' = 'service_role');
        `;
      } catch (e) {
        console.log("Policy likely already exists");
      }
      
      console.log("RLS policies set up successfully");
    } catch (rlsError: any) {
      console.error("Error setting up RLS policies:", rlsError);
      return NextResponse.json({ 
        success: false, 
        message: "Error setting up RLS policies", 
        error: rlsError.message 
      }, { status: 500 });
    }
    
    // Create a stored procedure for setting up users with elevated privileges
    try {
      await prisma.$executeRaw`
        CREATE OR REPLACE FUNCTION setup_user_as_owner(user_id TEXT, user_email TEXT)
        RETURNS VOID AS $$
        BEGIN
          INSERT INTO users (id, email, name, role, is_verified_owner, permissions)
          VALUES (
            user_id, 
            user_email, 
            split_part(user_email, '@', 1), 
            'owner', 
            TRUE, 
            ARRAY['viewDocuments', 'downloadDocuments', 'requestTranslations']
          )
          ON CONFLICT (id) DO UPDATE SET
            role = 'owner',
            is_verified_owner = TRUE,
            permissions = ARRAY['viewDocuments', 'downloadDocuments', 'requestTranslations'],
            updated_at = CURRENT_TIMESTAMP;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;
      
      console.log("Created setup_user_as_owner function");
    } catch (functionError: any) {
      console.error("Error creating function:", functionError);
      return NextResponse.json({ 
        success: false, 
        message: "Error creating setup_user_as_owner function", 
        error: functionError.message 
      }, { status: 500 });
    }
    
    // Set up specific user if provided
    const email = "manu@prouveze.fr"; // Hardcode for this specific case
    
    if (email) {
      // Find the user with the matching email
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        return NextResponse.json({ 
          success: false, 
          message: "Error fetching auth users", 
          error: authError.message 
        }, { status: 500 });
      }
      
      const authUser = authUsers.users.find(user => 
        user.email?.toLowerCase() === email.toLowerCase()
      );
      
      if (authUser) {
        try {
          // Use the function we just created
          await prisma.$executeRaw`
            SELECT setup_user_as_owner(${authUser.id}, ${authUser.email});
          `;
          
          console.log(`User ${email} set up as owner`);
        } catch (userError: any) {
          console.error("Error setting up user:", userError);
          return NextResponse.json({ 
            success: false, 
            message: `Error setting up user ${email}`, 
            error: userError.message 
          }, { status: 500 });
        }
      } else {
        console.log(`User with email ${email} not found in auth system`);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Database setup completed successfully",
      databaseHealth: healthCheck ? "connected" : "error",
      setupUser: email ? `Attempted to set up ${email} as owner` : "No user specified"
    });
  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    }, { status: 500 });
  }
} 