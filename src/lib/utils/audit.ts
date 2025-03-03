import { prisma } from "@/lib/db";

export type AuditAction = "create" | "update" | "delete" | "view" | "download" | "translate";
export type AuditEntityType = "Document" | "User" | "Settings";

/**
 * Creates an audit log entry in the database
 */
export const createAuditLog = async (
  userId: string,
  action: AuditAction,
  entityType: AuditEntityType,
  entityId: string,
  details?: Record<string, any>
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details: details ? (details as any) : undefined,
      },
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
    // Don't throw here - we don't want audit logging to break normal operation
  }
};

/**
 * Get audit logs with filtering options
 */
export const getAuditLogs = async ({
  entityType,
  entityId,
  userId,
  action,
  limit = 50,
  offset = 0,
}: {
  entityType?: AuditEntityType;
  entityId?: string;
  userId?: string;
  action?: AuditAction;
  limit?: number;
  offset?: number;
}) => {
  const where: any = {};
  
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (userId) where.userId = userId;
  if (action) where.action = action;
  
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      skip: offset,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);
  
  return {
    logs,
    total,
  };
};

/**
 * Get audit history for a specific entity
 */
export const getEntityAuditHistory = async (
  entityType: AuditEntityType,
  entityId: string,
  limit = 10
) => {
  return prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    take: limit,
  });
}; 