import { prisma } from "@/lib/db";

export type AuditAction = "create" | "update" | "delete" | "view" | "download" | "translate";
export type AuditEntityType = "Document" | "User" | "Settings";

/**
 * Check if the auditLog model exists in the Prisma schema
 */
const hasAuditLogModel = (): boolean => {
  return 'auditLog' in prisma;
};

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
    // Skip if auditLog model doesn't exist
    if (!hasAuditLogModel()) {
      console.warn('AuditLog model not found in Prisma schema. Skipping audit logging.');
      return;
    }
    
    // @ts-ignore - auditLog might not exist in the schema
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
  // Return empty results if auditLog model doesn't exist
  if (!hasAuditLogModel()) {
    console.warn('AuditLog model not found in Prisma schema. Returning empty results.');
    return {
      logs: [],
      total: 0
    };
  }
  
  const where: any = {};
  
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (userId) where.userId = userId;
  if (action) where.action = action;
  
  const [logs, total] = await Promise.all([
    // @ts-ignore - auditLog might not exist in the schema
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
    // @ts-ignore - auditLog might not exist in the schema
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
  // Return empty array if auditLog model doesn't exist
  if (!hasAuditLogModel()) {
    console.warn('AuditLog model not found in Prisma schema. Returning empty results.');
    return [];
  }
  
  // @ts-ignore - auditLog might not exist in the schema
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