import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

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
    
    // Check if the user exists using Prisma
    try {
      let user = await prisma.users.findUnique({
        where: { id: userId }
      });
      
      if (user) {
        console.log('[API] User exists, ensuring owner status if needed');
        
        // Check if the user needs to be upgraded to verified owner
        if (!user.is_verified_owner) {
          user = await prisma.users.update({
            where: { id: userId },
            data: { is_verified_owner: true }
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
        
        try {
          // Create user with Prisma
          const newUser = await prisma.users.create({
            data: {
              id: userId,
              email: userEmail,
              name: userEmail.split('@')[0] || 'User',
              role: 'user',
              is_verified_owner: true, // Set to true for owner dashboard
              preferred_language: 'french',
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
        } catch (createError) {
          console.error('[API] Error creating user:', createError);
          
          return NextResponse.json({
            success: false,
            message: "Failed to create user",
            error: String(createError)
          }, { status: 500 });
        }
      }
    } catch (error) {
      console.error('[API] Error checking user:', error);
      
      return NextResponse.json({
        success: false,
        message: "Error checking user",
        error: String(error)
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[API] Server error:', error);
    
    return NextResponse.json({
      success: false,
      message: "Server error",
      error: String(error)
    }, { status: 500 });
  }
} 