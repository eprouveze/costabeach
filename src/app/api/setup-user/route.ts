import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  // Get the email from the query string
  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get("email");
  
  if (!email) {
    return NextResponse.json({ 
      success: false, 
      message: "Email parameter is required" 
    }, { status: 400 });
  }
  
  try {
    // Get the supabase admin client
    const supabase = createClient();
    
    // Check if the user exists in Supabase Auth
    const { data, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      return NextResponse.json({ 
        success: false, 
        message: "Error fetching auth users", 
        error: authError.message 
      }, { status: 500 });
    }
    
    // Find the user with the matching email
    const authUser = data?.users?.find(user => user.email?.toLowerCase() === email.toLowerCase());
    
    if (!authUser) {
      return NextResponse.json({ 
        success: false, 
        message: `User with email ${email} not found in auth system` 
      }, { status: 404 });
    }
    
    // Now try to find or create the user in the database
    try {
      // First check if the users table exists
      try {
        await prisma.$queryRaw`SELECT 1 FROM users LIMIT 1`;
      } catch (tableError: any) {
        // Table doesn't exist, create it
        if (tableError.message.includes('does not exist')) {
          console.log('Creating users table...');
          
          // Create users table
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
          
          // Add RLS policies
          await prisma.$executeRaw`
            ALTER TABLE users ENABLE ROW LEVEL SECURITY;
          `;
          
          await prisma.$executeRaw`
            CREATE POLICY "Users can view their own data" ON users
            FOR SELECT USING (auth.uid() = id);
          `;
          
          await prisma.$executeRaw`
            CREATE POLICY "Users can update their own data" ON users
            FOR UPDATE USING (auth.uid() = id);
          `;
          
          await prisma.$executeRaw`
            CREATE POLICY "Service role can manage all users" ON users
            USING (auth.jwt() ->> 'role' = 'service_role');
          `;
        } else {
          throw tableError;
        }
      }
      
      // Now try to create or update the user
      const existingUser = await prisma.user.findUnique({
        where: { id: authUser.id }
      });
      
      if (existingUser) {
        // Update the user to ensure owner status
        const updatedUser = await prisma.user.update({
          where: { id: authUser.id },
          data: {
            is_verified_owner: true,
            role: 'owner',
            permissions: ['viewDocuments', 'downloadDocuments', 'requestTranslations']
          }
        });
        
        return NextResponse.json({ 
          success: true, 
          message: "User updated with owner permissions", 
          user: updatedUser 
        });
      } else {
        // Create the user
        const newUser = await prisma.user.create({
          data: {
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Owner',
            role: 'owner',
            is_verified_owner: true,
            preferred_language: authUser.user_metadata?.preferred_language || 'french',
            permissions: ['viewDocuments', 'downloadDocuments', 'requestTranslations'],
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        
        return NextResponse.json({ 
          success: true, 
          message: "User created with owner permissions", 
          user: newUser 
        });
      }
    } catch (dbError: any) {
      if (dbError.message && dbError.message.includes('violates row-level security policy')) {
        // Try to run in elevated privileges
        try {
          // Use raw SQL with service role
          await supabase.rpc('setup_user_as_owner', { 
            user_id: authUser.id,
            user_email: authUser.email
          });
          
          return NextResponse.json({ 
            success: true, 
            message: "User set up with owner permissions using elevated privileges" 
          });
        } catch (rpcError: any) {
          return NextResponse.json({ 
            success: false, 
            message: "Could not set up user with elevated privileges", 
            error: rpcError.message 
          }, { status: 500 });
        }
      }
      
      return NextResponse.json({ 
        success: false, 
        message: "Database error", 
        error: dbError.message 
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    }, { status: 500 });
  }
} 