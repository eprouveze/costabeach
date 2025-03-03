import { createTRPCRouter, publicProcedure, protectedProcedure } from "../../trpc";
import { documentsRouter } from "../documents";
import { createAuditLog } from "@/lib/utils/audit";
import { PrismaClient } from "@prisma/client";
import { DocumentCategory, Language } from "@/lib/types";
import { getUploadUrl, createDocument, getDownloadUrl, incrementViewCount, incrementDownloadCount } from "@/lib/utils/documents";

// Mock dependencies
jest.mock("@/lib/utils/audit", () => ({
  createAuditLog: jest.fn(),
}));

jest.mock("@/lib/utils/documents", () => ({
  getUploadUrl: jest.fn(),
  createDocument: jest.fn(),
  getDownloadUrl: jest.fn().mockResolvedValue("https://example.com/download-url"),
  incrementViewCount: jest.fn(),
  incrementDownloadCount: jest.fn(),
  getDocumentsByCategory: jest.fn(),
  canManageDocumentCategory: jest.fn().mockReturnValue(true),
}));

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    document: {
      findUnique: jest.fn().mockImplementation((args) => {
        if (args.where.id === "doc-1") {
          return Promise.resolve({ 
            id: "doc-1", 
            title: "Test Document",
            filePath: "test/path.pdf" 
          });
        }
        return Promise.resolve(null);
      }),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: "user-1",
        permissions: ["MANAGE_DOCUMENTS"],
      }),
    },
    auditLog: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
  };

  return { 
    PrismaClient: jest.fn().mockImplementation(() => mockPrisma)
  };
});

// Mock trpc context
const mockSession = {
  user: {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    permissions: ["MANAGE_DOCUMENTS"],
  },
};

const createMockContext = (sessionData: any = null) => ({
  session: sessionData,
});

describe("Documents Router Audit Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createDocument", () => {
    it("should create an audit log entry when creating a document", async () => {
      // Arrange
      const mockContext = createMockContext(mockSession);
      const mockCreateDocumentResult = {
        id: "doc-1",
        title: "Test Document",
        description: "Test Description",
        filePath: "path/to/document.pdf",
        fileSize: 1024,
        fileType: "application/pdf",
        category: DocumentCategory.GENERAL,
        language: Language.EN,
        authorId: "user-1",
        isPublished: true,
        viewCount: 0,
        downloadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      (createDocument as jest.Mock).mockResolvedValue(mockCreateDocumentResult);
      
      const input = {
        title: "Test Document",
        description: "Test Description",
        filePath: "path/to/document.pdf",
        fileSize: 1024,
        fileType: "application/pdf",
        category: DocumentCategory.GENERAL,
        language: Language.EN,
        isPublished: true,
      };

      // Mocking the caller function from TRPC
      const caller = {
        mutation: jest.fn().mockImplementation((callback) => {
          return callback({ ctx: mockContext, input });
        }),
      };

      const createDocumentMutation = { 
        ...documentsRouter.createDocument,
        _def: { ...documentsRouter.createDocument._def, mutation: true }
      };
      
      // Act
      await createDocumentMutation._def.resolver({ ctx: mockContext, input });

      // Assert
      expect(createAuditLog).toHaveBeenCalledWith(
        "user-1",
        "create",
        "Document",
        "doc-1",
        expect.objectContaining({
          title: "Test Document",
          category: DocumentCategory.GENERAL,
          language: Language.EN,
        })
      );
    });
  });

  describe("getDownloadUrl", () => {
    it("should create an audit log entry when downloading a document", async () => {
      // Arrange
      const mockContext = createMockContext(mockSession);
      const input = { documentId: "doc-1" };

      // Act
      await documentsRouter.getDownloadUrl._def.resolver({ ctx: mockContext, input });

      // Assert
      expect(createAuditLog).toHaveBeenCalledWith(
        "user-1",
        "download",
        "Document",
        "doc-1",
        expect.objectContaining({ title: "Test Document" })
      );
    });

    it("should not create an audit log if user is not logged in", async () => {
      // Arrange
      const mockContext = createMockContext(null);
      const input = { documentId: "doc-1" };

      // Act
      await documentsRouter.getDownloadUrl._def.resolver({ ctx: mockContext, input });

      // Assert
      expect(createAuditLog).not.toHaveBeenCalled();
    });
  });

  describe("incrementViewCount", () => {
    it("should create an audit log entry when viewing a document", async () => {
      // Arrange
      const mockContext = createMockContext(mockSession);
      const input = { documentId: "doc-1" };

      // Act
      await documentsRouter.incrementViewCount._def.resolver({ ctx: mockContext, input });

      // Assert
      expect(createAuditLog).toHaveBeenCalledWith(
        "user-1",
        "view",
        "Document",
        "doc-1",
        expect.objectContaining({ title: "Test Document" })
      );
    });

    it("should not create an audit log if user is not logged in", async () => {
      // Arrange
      const mockContext = createMockContext(null);
      const input = { documentId: "doc-1" };

      // Act
      await documentsRouter.incrementViewCount._def.resolver({ ctx: mockContext, input });

      // Assert
      expect(createAuditLog).not.toHaveBeenCalled();
    });
  });
}); 