import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { Resend } from "resend";
import { headers } from "next/headers";
import { UserRole } from "@/lib/types";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth/adapters" {
  interface AdapterUser {
    login?: string;
    role?: UserRole;
    dashboardEnabled?: boolean;
    isTeamAdmin?: boolean;
  }
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: UserRole;
      isAdmin?: boolean;
    } & DefaultSession["user"];
  }

  export interface Profile {
    login: string;
  }

  interface User {
    role?: UserRole;
    login?: string;
    expires?: string;
    isTeamAdmin?: boolean;
    isAdmin?: boolean;
  }
}

// Force localhost in development, regardless of what's set in env files
if (process.env.NODE_ENV === "development") {
  process.env.NEXTAUTH_URL = "http://localhost:3000";
} else if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.trim() === "") {
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
  process.env.NEXTAUTH_URL = vercelUrl;
}

// Debug: Log the NEXTAUTH_URL being used
console.log('🔍 [AUTH CONFIG] NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('🔍 [AUTH CONFIG] NODE_ENV:', process.env.NODE_ENV);
console.log('🔍 [AUTH CONFIG] VERCEL_URL:', process.env.VERCEL_URL);

// Using standard PrismaAdapter with proper NextAuth model naming conventions

export const authOptions: NextAuthOptions & { trustHost: boolean } = {
  // When deploying on platforms like Vercel that sit behind a proxy we need to explicitly
  // tell NextAuth that it can trust the incoming host header. Otherwise certain API
  // routes (e.g. /api/auth/session) may return an HTML error page that the client tries
  // to parse as JSON, leading to the "Unexpected token '<'" error.
  trustHost: !!process.env.NEXTAUTH_URL,
  
  // Enable debug logging
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error('🔥 [NEXTAUTH ERROR]', code, metadata);
    },
    warn(code) {
      console.warn('⚠️ [NEXTAUTH WARN]', code);
    },
    debug(code, metadata) {
      console.log('🐛 [NEXTAUTH DEBUG]', code, metadata);
    }
  },

  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: "localhost", // Dummy server config since we override with sendVerificationRequest
        port: 587,
        auth: {
          user: "dummy",
          pass: "dummy",
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        console.log('📧 [EMAIL] sendVerificationRequest called!');
        console.log('📧 [EMAIL] Starting to send verification email to:', email);
        console.log('📧 [EMAIL] URL:', url);
        console.log('📧 [EMAIL] Provider:', provider);
        
        // Get the current request's host
        const headersList = await headers();
        const host = headersList.get("host");
        const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
        
        // Replace the URL's origin with the current request's origin
        const currentOrigin = `${protocol}://${host}`;
        const urlObject = new URL(url);
        const newUrl = url.replace(urlObject.origin, currentOrigin);

        console.log('📧 [EMAIL] Generated magic link URL:', newUrl);
        console.log('📧 [EMAIL] Using Resend API key:', process.env.RESEND_API_KEY ? '✅ SET' : '❌ MISSING');
        console.log('📧 [EMAIL] Using from address:', process.env.EMAIL_FROM);

        const resend = new Resend(process.env.RESEND_API_KEY);
        try {
          console.log('📧 [EMAIL] Attempting to send email via Resend...');
          const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || "Costa Beach <onboarding@resend.dev>",
            to: email,
            subject: "Sign in to Costa Beach",
            html: `
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <h1 style="color: #2563eb; margin-bottom: 24px;">Welcome to Costa Beach</h1>
                <p style="margin-bottom: 24px;">Click the link below to sign in to your account:</p>
                <a href="${newUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Sign in to Costa Beach</a>
                <p style="margin-top: 24px; color: #6b7280;">If you did not request this email, you can safely ignore it.</p>
                <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280;">
                  <p style="font-size: 14px;">Costa Beach Owner Portal</p>
                </div>
              </div>
            `,
          });
          console.log('✅ [EMAIL] Email sent successfully! Result:', result);
        } catch (error) {
          console.error('❌ [EMAIL] Failed to send email:', error);
          console.error('❌ [EMAIL] Error details:', {
            message: error.message,
            cause: error.cause,
            stack: error.stack
          });
          throw new Error('Failed to send verification email');
        }
      },
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      console.log('🔍 [SIGNIN] Callback called for:', user.email);
      
      // Only allow sign in if the user exists and is verified
      if (!user.email) {
        console.log('❌ [SIGNIN] No email provided');
        return false;
      }

      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        console.log('🔍 [SIGNIN] Database user found:', !!dbUser);

        // If user doesn't exist, check if they have a pending registration
        if (!dbUser) {
          console.log('🔍 [SIGNIN] No user found, checking registration...');
          const registration = await prisma.ownerRegistration.findUnique({
            where: { email: user.email },
          });

          console.log('🔍 [SIGNIN] Registration found:', !!registration, 'Status:', registration?.status);

          if (!registration || registration.status !== "approved") {
            console.log('❌ [SIGNIN] Registration not approved, blocking signin');
            return false;
          }
        }

        console.log('✅ [SIGNIN] Signin approved');
        return true;
      } catch (error) {
        console.error('❌ [SIGNIN] Error in signin callback:', error);
        return false;
      }
    },
    async session({ session, user }) {
      console.log('🔍 [SESSION] Session callback called');
      console.log('🔍 [SESSION] User object:', user ? { id: user.id, email: user.email } : 'No user');
      console.log('🔍 [SESSION] Session object:', session.user ? { email: session.user.email } : 'No session user');
      
      if (user && session.user) {
        // Fetch complete user data from database to ensure we have all fields
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { 
              id: true, 
              email: true, 
              name: true, 
              role: true, 
              isAdmin: true,
              permissions: true
            }
          });
          
          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.name = dbUser.name;
            session.user.email = dbUser.email;
            session.user.role = dbUser.role as UserRole;
            session.user.isAdmin = dbUser.isAdmin || false;
            
            console.log('🔍 [SESSION] Enhanced session with DB data:', {
              id: session.user.id,
              email: session.user.email,
              isAdmin: session.user.isAdmin,
              role: session.user.role
            });
          }
        } catch (error) {
          console.error('❌ [SESSION] Error fetching user data:', error);
          // Fallback to adapter user data
          session.user.id = user.id;
          session.user.role = user.role as UserRole;
          session.user.isAdmin = !!user.isAdmin;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Get the current request's host
      const headersList = await headers();
      const host = headersList.get("host");
      const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
      const currentBaseUrl = `${protocol}://${host}`;

      // Allows relative callback URLs
      if (url.startsWith("/")) return `${currentBaseUrl}${url}`;
      // Allows callback URLs on the same host (ignoring port)
      else if (new URL(url).hostname === new URL(currentBaseUrl).hostname) return url;
      return currentBaseUrl;
    },
  },
  pages: {
    signIn: "/fr/owner-login", // Default to French locale
    signOut: "/fr/auth/signout",
    error: "/fr/auth/error", 
    verifyRequest: "/fr/auth/verify",
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);

// Util: Get the current authenticated user (or null if none)
export const getCurrentUser = async () => {
  try {
    const session = await getServerSession(authOptions);
    return session?.user ?? null;
  } catch (error) {
    console.error("Failed to retrieve current user:", error);
    return null;
  }
};
