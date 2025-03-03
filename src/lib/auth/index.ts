import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";
import { headers } from "next/headers";

export enum UserRole {
  user = "user",
  admin = "admin",
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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
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

        const resend = new Resend(process.env.RESEND_API_KEY);
        try {
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
        } catch (error) {
          console.error('Failed to send email:', error);
          throw new Error('Failed to send verification email');
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      // Only allow sign in if the user exists and is verified
      if (!user.email) return false;

      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      // If user doesn't exist, check if they have a pending registration
      if (!dbUser) {
        const registration = await prisma.ownerRegistration.findUnique({
          where: { email: user.email },
        });

        if (!registration || registration.status !== "approved") {
          return false;
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.isAdmin = user.isAdmin;
      }
      return token;
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
    signIn: "/owner-login",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);
