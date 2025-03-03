import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  // Define variables at the highest scope to make them available in catch blocks
  let userId: string | undefined;
  let userEmail: string | undefined;
  
  try {
    // Check content type and content length to prevent empty body errors
    const contentType = req.headers.get('content-type') || '';
    const contentLength = req.headers.get('content-length') || '0';
    
    // If empty request or wrong content type, return error
    if (parseInt(contentLength) === 0 || !contentType.includes('application/json')) {
      console.log('[API] ensure-user-exists: Empty request or invalid content type');
      return NextResponse.json({ 
        success: false, 
        message: "Invalid request. Please provide a JSON body with userId and userEmail." 
      }, { status: 400 });
    }
    
    // Get the userId and userEmail from the request body
    try {
      const reqBody = await req.json();
      userId = reqBody.userId;
      userEmail = reqBody.userEmail;
    } catch (jsonError) {
      console.error('[API] JSON parsing error:', jsonError);
      return NextResponse.json({ 
        success: false, 
        message: "Invalid JSON in request body" 
      }, { status: 400 });
    }
    
    if (!userId || !userEmail) {
      return NextResponse.json({ 
        success: false, 
        message: "User ID and email are required" 
      }, { status: 400 });
    }
    
    console.log(`[API] ensure-user-exists called for user: ${userEmail} (${userId})`);
    
    // Get the supabase admin client with service role
    const supabase = createClient();
    
    // Skip Prisma and use Supabase directly to avoid schema mismatch issues
    try {
      // Check if user exists with Supabase
      const { data: existingUsers, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (userError && !userError.message.includes('No rows found')) {
        console.error('[API] Error checking user with Supabase:', userError);
        throw userError;
      }
      
      if (existingUsers) {
        console.log('[API] User exists, ensuring owner status if needed');
        
        // Check if the user needs to be upgraded to verified owner
        if (!existingUsers.is_verified_owner) {
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({ is_verified_owner: true })
            .eq('id', userId)
            .select()
            .single();
          
          if (updateError) {
            console.error('[API] Error updating user:', updateError);
            throw updateError;
          }
          
          console.log('[API] User updated to verified owner status');
          
          return NextResponse.json({ 
            success: true, 
            message: "User updated to verified owner", 
            user: updatedUser,
            action: "verified"
          });
        }
        
        return NextResponse.json({ 
          success: true, 
          message: "User already verified", 
          user: existingUsers,
          action: "already_verified"
        });
      } else {
        console.log('[API] User does not exist, creating new record');
        
        // Create user with Supabase
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            id: userId,
            email: userEmail,
            name: userEmail.split('@')[0] || 'User',
            role: 'user',
            is_verified_owner: true,
            preferred_language: 'french',
            permissions: ['viewDocuments', 'downloadDocuments']
          }])
          .select()
          .single();
        
        if (createError) {
          console.error('[API] Error creating user:', createError);
          throw createError;
        }
        
        console.log('[API] User created successfully:', newUser);
        
        return NextResponse.json({
          success: true,
          message: "User created",
          user: newUser,
          action: "created"
        });
      }
    } catch (error) {
      console.error('[API] Error handling user:', error);
      
      // Return a successful response with fallback user data
      // This prevents infinite retries while still allowing the UI to work
      const fallbackUser = {
        id: userId,
        email: userEmail,
        name: userEmail?.split('@')[0] || 'User',
        role: 'user',
        isVerifiedOwner: true,
        preferredLanguage: 'french',
        permissions: ['viewDocuments', 'downloadDocuments'],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return NextResponse.json({
        success: true,
        message: "Using fallback user profile due to database issues",
        user: fallbackUser,
        action: "fallback",
        note: "Database issue detected. Please check your database schema."
      });
    }
  } catch (error) {
    console.error('[API] Server error:', error);
    
    // Still return a 200 with fallback data to prevent UI retries
    return NextResponse.json({
      success: true,
      message: "Server error but providing fallback",
      user: {
        id: userId || crypto.randomUUID(),
        email: userEmail || 'unknown@example.com',
        name: userEmail ? userEmail.split('@')[0] : 'Guest User',
        role: 'user',
        isVerifiedOwner: true,
        preferredLanguage: 'french',
        permissions: ['viewDocuments', 'downloadDocuments'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      action: "error_fallback",
      error: String(error)
    });
  }
} 