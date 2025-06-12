"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from 'react-toastify';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export function AuthWrapper({ children, requireAuth = false, allowedRoles = [] }: AuthWrapperProps) {
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for session to be determined
      if (status === "loading") {
        return;
      }

      setLoading(false);

      // If authentication is required but no session exists
      if (requireAuth && status === "unauthenticated") {
        // Get the current locale from the URL
        const pathParts = pathname?.split('/') || [];
        const locale = pathParts.length > 1 && ['fr', 'en', 'ar'].includes(pathParts[1]) 
          ? pathParts[1] 
          : 'fr';
        
        // Redirect to the owner login page with return URL
        const returnUrl = encodeURIComponent(pathname || '/');
        router.push(`/${locale}/owner-login?returnUrl=${returnUrl}`);
        return;
      }

      // If we have a session and role checking is required
      if (session && allowedRoles.length > 0) {
        // In NextAuth, role information would be in session.user
        // This is a placeholder - adjust based on your session structure
        const userRole = (session.user as any)?.role || 'user';
        
        if (!allowedRoles.includes(userRole)) {
          toast.error('You do not have permission to access this page');
          
          // Get the current locale from the URL
          const pathParts = pathname?.split('/') || [];
          const locale = pathParts.length > 1 && ['fr', 'en', 'ar'].includes(pathParts[1]) 
            ? pathParts[1] 
            : 'fr';
          
          router.push(`/${locale}/`);
          return;
        }
      }
    };

    checkAuth();
  }, [status, session, requireAuth, allowedRoles, router, pathname]);

  // Show loading state while checking authentication
  if (loading || status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // If auth is required and we're not authenticated, don't render anything
  // (the redirect should handle this)
  if (requireAuth && status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}