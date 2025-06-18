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

// Email translations
const emailTranslations = {
  fr: {
    subject: "Connexion à Costa Beach - Lien de connexion",
    welcome: "Bienvenue !",
    connectText: "Cliquez sur le bouton ci-dessous pour vous connecter à votre espace propriétaire Costa Beach 3 :",
    connectButton: "🔐 Se connecter à Costa Beach",
    securityNote: "🔒 Sécurité :",
    securityText: "Ce lien de connexion expire dans 24 heures et ne peut être utilisé qu'une seule fois.",
    ignoreText: "Si vous n'avez pas demandé cette connexion, vous pouvez ignorer cet email en toute sécurité.",
    residenceName: "Costa Beach 3 - Résidence",
    portalName: "Portail des Copropriétaires",
    location: "Bouznika, Maroc",
    copyright: "Tous droits réservés.",
    preheader: "Connexion sécurisée à votre espace Costa Beach 3 - Cliquez pour accéder à votre portail propriétaire"
  },
  en: {
    subject: "Sign in to Costa Beach - Login Link",
    welcome: "Welcome!",
    connectText: "Click the button below to sign in to your Costa Beach 3 owner portal:",
    connectButton: "🔐 Sign in to Costa Beach",
    securityNote: "🔒 Security:",
    securityText: "This login link expires in 24 hours and can only be used once.",
    ignoreText: "If you didn't request this login, you can safely ignore this email.",
    residenceName: "Costa Beach 3 - Residence",
    portalName: "Owner Portal",
    location: "Bouznika, Morocco",
    copyright: "All rights reserved.",
    preheader: "Secure login to your Costa Beach 3 portal - Click to access your owner dashboard"
  },
  ar: {
    subject: "تسجيل الدخول إلى كوستا بيتش - رابط الدخول",
    welcome: "مرحبًا!",
    connectText: "انقر على الزر أدناه لتسجيل الدخول إلى بوابة مالكي كوستا بيتش 3:",
    connectButton: "🔐 تسجيل الدخول إلى كوستا بيتش",
    securityNote: "🔒 الأمان:",
    securityText: "رابط تسجيل الدخول هذا ينتهي خلال 24 ساعة ويمكن استخدامه مرة واحدة فقط.",
    ignoreText: "إذا لم تطلب تسجيل الدخول هذا، يمكنك تجاهل هذا البريد الإلكتروني بأمان.",
    residenceName: "كوستا بيتش 3 - الإقامة",
    portalName: "بوابة المالكين",
    location: "بوزنيقة، المغرب",
    copyright: "جميع الحقوق محفوظة.",
    preheader: "تسجيل دخول آمن إلى بوابة كوستا بيتش 3 - انقر للوصول إلى لوحة تحكم المالك"
  }
};

function getLocaleFromUrl(url: string): string {
  if (url.includes("/ar/")) return "ar";
  if (url.includes("/en/")) return "en";
  return "fr"; // Default to French
}

function getEmailTranslations(locale: string = "fr") {
  return emailTranslations[locale as keyof typeof emailTranslations] || emailTranslations.fr;
}

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


// Using standard PrismaAdapter with proper NextAuth model naming conventions

export const authOptions: NextAuthOptions & { trustHost: boolean } = {
  // When deploying on platforms like Vercel that sit behind a proxy we need to explicitly
  // tell NextAuth that it can trust the incoming host header. Otherwise certain API
  // routes (e.g. /api/auth/session) may return an HTML error page that the client tries
  // to parse as JSON, leading to the "Unexpected token '<'" error.
  trustHost: !!process.env.NEXTAUTH_URL,
  

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
      sendVerificationRequest: async ({ identifier: email, url }) => {
        // Get the current request's host
        const headersList = await headers();
        const host = headersList.get("host");
        const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
        
        // Replace the URL's origin with the current request's origin
        const currentOrigin = `${protocol}://${host}`;
        const urlObject = new URL(url);
        const newUrl = url.replace(urlObject.origin, currentOrigin);

        // Detect locale from the URL
        const locale = getLocaleFromUrl(url);
        const t = getEmailTranslations(locale);
        const isRTL = locale === "ar";

        const resend = new Resend(process.env.RESEND_API_KEY);
        try {
          const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || "Costa Beach <info@costabeach.ma>",
            to: email,
            subject: t.subject,
            html: `
              <!DOCTYPE html>
              <html lang="${locale}" dir="${isRTL ? 'rtl' : 'ltr'}">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${t.subject}</title>
              </head>
              <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: ${isRTL ? 'rtl' : 'ltr'};">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header with logo and brand -->
                  <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
                    <img src="https://costabeach.ma/images/cropped-IMG_0005.webp" alt="Costa Beach Logo" style="width: 80px; height: 80px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); background-color: white; padding: 4px;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
                      Costa Beach 3
                    </h1>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">
                      ${t.portalName}
                    </p>
                  </div>
                  
                  <!-- Main content -->
                  <div style="padding: 40px 30px;">
                    <h2 style="color: #1e293b; margin: 0 0 24px 0; font-size: 24px; font-weight: 600;">
                      ${t.welcome}
                    </h2>
                    
                    <p style="color: #475569; margin: 0 0 32px 0; font-size: 16px; line-height: 1.6;">
                      ${t.connectText}
                    </p>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="${newUrl}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); transition: all 0.3s ease;">
                        ${t.connectButton}
                      </a>
                    </div>
                    
                    <div style="background-color: #f1f5f9; border-left: 4px solid #0ea5e9; padding: 16px 20px; margin: 32px 0; border-radius: 0 6px 6px 0; ${isRTL ? 'border-left: none; border-right: 4px solid #0ea5e9;' : ''}">
                      <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.5;">
                        <strong>${t.securityNote}</strong> ${t.securityText}
                      </p>
                    </div>
                    
                    <p style="color: #64748b; margin: 32px 0 0 0; font-size: 14px; line-height: 1.5;">
                      ${t.ignoreText}
                    </p>
                  </div>
                  
                  <!-- Footer -->
                  <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <div style="margin-bottom: 16px;">
                      <img src="https://costabeach.ma/images/cropped-IMG_0005.webp" alt="Costa Beach" style="width: 40px; height: 40px; border-radius: 4px; background-color: white; padding: 2px;">
                    </div>
                    <p style="color: #64748b; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
                      ${t.residenceName}
                    </p>
                    <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                      ${t.portalName} | ${t.location}
                    </p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                      <p style="color: #94a3b8; margin: 0; font-size: 11px;">
                        © ${new Date().getFullYear()} Costa Beach 3. ${t.copyright}
                      </p>
                    </div>
                  </div>
                </div>
                
                <!-- Email client compatibility -->
                <div style="display: none; font-size: 1px; color: #f8fafc; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
                  ${t.preheader}
                </div>
              </body>
              </html>
            `,
          });
        } catch (error) {
          console.error('Failed to send email:', error);
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
    if (!session?.user?.id) {
      return null;
    }

    // Fetch full user data including permissions from database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isAdmin: true,
        permissions: true
      }
    });

    if (!dbUser) {
      return null;
    }

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      isAdmin: dbUser.isAdmin || false,
      permissions: (dbUser.permissions as string[]) || []
    };
  } catch (error) {
    console.error("Failed to retrieve current user:", error);
    return null;
  }
};
