import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Get the userId and userEmail from the request body
    const { userId, userEmail } = await req.json();
    
    if (!userId || !userEmail) {
      return NextResponse.json({ 
        success: false, 
        message: "User ID and email are required" 
      }, { status: 400 });
    }
    
    console.log(`[API] ensure-user-exists called for user: ${userEmail} (${userId})`);
    
    // Get the supabase admin client with service role
    const supabase = createClient();
    
    // First, check if the users table exists and create it if needed
    try {
      // Using the RPC function if it exists
      try {
        await supabase.rpc('create_users_table_if_not_exists');
        console.log('[API] Called create_users_table_if_not_exists RPC function');
      } catch (rpcError: any) {
        // RPC function might not exist, use direct SQL instead
        console.log('[API] RPC function not available, using direct SQL');
        
        try {
          await prisma.$queryRaw`SELECT 1 FROM users LIMIT 1`;
          console.log('[API] Users table exists');
        } catch (tableError: any) {
          // Table doesn't exist, create it with the necessary RLS policies
          if (tableError.message.includes('does not exist')) {
            console.log('[API] Creating users table...');
            
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
              DO $$
              BEGIN
                  BEGIN
                      CREATE POLICY "Users can view their own data" ON users
                      FOR SELECT USING (auth.uid()::text = id);
                  EXCEPTION WHEN OTHERS THEN
                      NULL;
                  END;

                  BEGIN
                      CREATE POLICY "Users can update their own data" ON users
                      FOR UPDATE USING (auth.uid()::text = id);
                  EXCEPTION WHEN OTHERS THEN
                      NULL;
                  END;

                  BEGIN
                      CREATE POLICY "Service role can manage all users" ON users
                      USING (current_setting('request.jwt.claims', true)::json ->> 'role' = 'service_role');
                  EXCEPTION WHEN OTHERS THEN
                      NULL;
                  END;
              END $$;
            `;
            
            console.log('[API] Users table and RLS policies created');
          } else {
            throw tableError;
          }
        }
      }
      
      // Now check if the user exists using Prisma
      let user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (user) {
        console.log('[API] User exists, ensuring owner status if needed');
        
        // Check if the user needs to be upgraded to verified owner
        if (!user.isVerifiedOwner) {
          user = await prisma.user.update({
            where: { id: userId },
            data: { isVerifiedOwner: true }
          });
          console.log('[API] User updated to verified owner status');
        }
        
        return NextResponse.json({ 
          success: true, 
          message: "User verified", 
          user,
          action: "verified"
        });
      } else {
        console.log('[API] User does not exist, creating new record');
        
        // If Prisma fails due to RLS, try direct SQL with service role
        try {
          // First try with Prisma
          const newUser = await prisma.user.create({
            data: {
              id: userId,
              email: userEmail,
              name: userEmail.split('@')[0] || 'User',
              role: 'user',
              isVerifiedOwner: true, // Set to true for owner dashboard
              preferredLanguage: 'french',
              permissions: ['viewDocuments', 'downloadDocuments']
            }
          });
          
          console.log('[API] User created successfully via Prisma');
          
          return NextResponse.json({
            success: true,
            message: "User created",
            user: newUser,
            action: "created"
          });
        } catch (prismaError: any) {
          console.error('[API] Prisma error:', prismaError);
          
          // If we encounter RLS issues, try raw SQL via supabase
          if (prismaError.message.includes('violates row-level security policy') ||
              prismaError.message.includes('permission denied')) {
            console.log('[API] Using direct SQL with service role to bypass RLS');
            
            try {
              // Use raw SQL with service role
              const { data, error } = await supabase
                .from('users')
                .insert([{
                  id: userId,
                  email: userEmail,
                  name: userEmail.split('@')[0] || 'User',
                  role: 'user',
                  is_verified_owner: true, // Set to true for owner dashboard
                  preferred_language: 'french',
                  permissions: ['viewDocuments', 'downloadDocuments']
                }])
                .select()
                .single();
              
              if (error) {
                throw error;
              }
              
              console.log('[API] User created successfully via Supabase SQL');
              
              return NextResponse.json({
                success: true,
                message: "User created with service role",
                user: data,
                action: "created_with_service_role"
              });
            } catch (sqlError: any) {
              // As a last resort, try the setup_user_as_owner RPC function
              try {
                console.log('[API] Trying setup_user_as_owner RPC function');
                
                await supabase.rpc('setup_user_as_owner', { 
                  user_id: userId,
                  user_email: userEmail
                });
                
                console.log('[API] User created via RPC function');
                
                return NextResponse.json({
                  success: true,
                  message: "User created with RPC function",
                  action: "created_with_rpc"
                });
              } catch (rpcError: any) {
                console.error('[API] RPC error:', rpcError);
                
                return NextResponse.json({
                  success: false,
                  message: "Could not create user with any method",
                  error: {
                    prisma: prismaError.message,
                    sql: sqlError.message,
                    rpc: rpcError.message
                  }
                }, { status: 500 });
              }
            }
          } else {
            return NextResponse.json({
              success: false,
              message: "Database error",
              error: prismaError.message
            }, { status: 500 });
          }
        }
      }
    } catch (error: any) {
      console.error('[API] Server error:', error);
      
      return NextResponse.json({
        success: false,
        message: "Server error",
        error: error.message
      }, { status: 500 });
    }
} 