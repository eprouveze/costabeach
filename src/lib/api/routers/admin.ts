import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";
import { checkPermission } from "@/lib/utils/permissions";
import { Permission } from "@/lib/types";

export const adminRouter = router({
  // Get dashboard statistics
  getDashboardStats: protectedProcedure
    .query(async ({ ctx }) => {
      const { user } = ctx;
      
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to access admin statistics",
        });
      }

      // Get user permissions from database
      const userRecord = await prisma.user.findUnique({
        where: { id: user.id },
        select: { 
          isAdmin: true, 
          permissions: true 
        }
      });

      if (!userRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if user has admin permissions or specific permissions to view dashboard
      const userPermissions = (userRecord.permissions as Permission[]) || [];
      const canViewDashboard = 
        userRecord.isAdmin ||
        checkPermission(userPermissions, Permission.VIEW_USERS) ||
        checkPermission(userPermissions, Permission.MANAGE_USERS) ||
        checkPermission(userPermissions, Permission.VIEW_DOCUMENTS) ||
        checkPermission(userPermissions, Permission.MANAGE_DOCUMENTS);

      if (!canViewDashboard) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions to view admin dashboard",
        });
      }

      try {
        // Fetch dashboard statistics
        const [
          totalUsers,
          totalDocuments,
          activeSessions,
        ] = await Promise.all([
          // Count total users
          prisma.user.count(),
          
          // Count total documents
          prisma.documents.count(),
          
          // Count active sessions (sessions updated in last 24 hours)
          getActiveSessionsCount(),
        ]);

        // For messages sent, we'll start with 0 since we don't have WhatsApp tracking yet
        // This can be enhanced later when WhatsApp message logging is implemented
        const messagesSent = 0;

        return {
          totalUsers,
          totalDocuments,
          messagesSent,
          activeSessions,
        };
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch dashboard statistics",
        });
      }
    }),
});

// Helper function to count active sessions
async function getActiveSessionsCount(): Promise<number> {
  try {
    // Count sessions that haven't expired yet (active sessions)
    const now = new Date();
    
    const activeSessions = await prisma.session.count({
      where: {
        expires: {
          gt: now
        }
      }
    });

    return activeSessions;
  } catch (error) {
    console.error("Error counting active sessions:", error);
    // Return 0 if there's an error or if sessions table doesn't exist
    return 0;
  }
}