import { createAuditLog, getAuditLogs, getEntityAuditHistory, type AuditAction, type AuditEntityType } from "../audit";
import { prisma } from "@/lib/db";

// Mock the Prisma client
jest.mock("@/lib/db", () => ({
  prisma: {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("Audit Logging Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createAuditLog", () => {
    it("should create an audit log entry", async () => {
      // Arrange
      const mockCreate = prisma.auditLog.create as jest.Mock;
      mockCreate.mockResolvedValue({ id: "audit-1" });

      const userId = "user-1";
      const action: AuditAction = "create";
      const entityType: AuditEntityType = "Document";
      const entityId = "doc-1";
      const details = { title: "Test Document" };

      // Act
      await createAuditLog(userId, action, entityType, entityId, details);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          userId,
          action,
          entityType,
          entityId,
          details,
        },
      });
    });

    it("should not throw errors but log them to console", async () => {
      // Arrange
      const mockCreate = prisma.auditLog.create as jest.Mock;
      const mockError = new Error("Database error");
      mockCreate.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      // Act
      await createAuditLog("user-1", "create", "Document", "doc-1");

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error creating audit log:",
        mockError
      );
    });
  });

  describe("getAuditLogs", () => {
    it("should retrieve audit logs with filtering options", async () => {
      // Arrange
      const mockFindMany = prisma.auditLog.findMany as jest.Mock;
      const mockCount = prisma.auditLog.count as jest.Mock;

      const mockLogs = [
        {
          id: "audit-1",
          userId: "user-1",
          action: "create",
          entityType: "Document",
          entityId: "doc-1",
          details: { title: "Test Document" },
          createdAt: new Date(),
          user: { id: "user-1", name: "Test User", email: "test@example.com" },
        },
      ];

      mockFindMany.mockResolvedValue(mockLogs);
      mockCount.mockResolvedValue(1);

      // Act
      const result = await getAuditLogs({
        entityType: "Document",
        entityId: "doc-1",
        userId: "user-1",
        action: "create",
      });

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          entityType: "Document",
          entityId: "doc-1",
          userId: "user-1",
          action: "create",
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
        skip: 0,
        take: 50,
      });

      expect(mockCount).toHaveBeenCalledWith({
        where: {
          entityType: "Document",
          entityId: "doc-1",
          userId: "user-1",
          action: "create",
        },
      });

      expect(result).toEqual({
        logs: mockLogs,
        total: 1,
      });
    });

    it("should handle pagination correctly", async () => {
      // Arrange
      const mockFindMany = prisma.auditLog.findMany as jest.Mock;
      const mockCount = prisma.auditLog.count as jest.Mock;

      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(100);

      // Act
      await getAuditLogs({
        limit: 10,
        offset: 20,
      });

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });
  });

  describe("getEntityAuditHistory", () => {
    it("should retrieve audit history for a specific entity", async () => {
      // Arrange
      const mockFindMany = prisma.auditLog.findMany as jest.Mock;
      const mockLogs = [
        {
          id: "audit-1",
          userId: "user-1",
          action: "create",
          entityType: "Document",
          entityId: "doc-1",
          details: { title: "Test Document" },
          createdAt: new Date(),
          user: { id: "user-1", name: "Test User", email: "test@example.com" },
        },
        {
          id: "audit-2",
          userId: "user-1",
          action: "update",
          entityType: "Document",
          entityId: "doc-1",
          details: { title: "Updated Document" },
          createdAt: new Date(),
          user: { id: "user-1", name: "Test User", email: "test@example.com" },
        },
      ];

      mockFindMany.mockResolvedValue(mockLogs);

      // Act
      const result = await getEntityAuditHistory("Document", "doc-1", 5);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          entityType: "Document",
          entityId: "doc-1",
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
        take: 5,
      });

      expect(result).toEqual(mockLogs);
    });
  });
}); 