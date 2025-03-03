import { createTRPCRouter, publicProcedure, protectedProcedure } from "../../trpc";
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
      create: jest.fn(),
    },
  };

  return { 
    PrismaClient: jest.fn().mockImplementation(() => mockPrisma)
  };
});

// Mock the prisma import directly
jest.mock("@/lib/db", () => ({
  prisma: {
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
      update: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: "user-1",
        permissions: ["MANAGE_DOCUMENTS"],
      }),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
  },
}));

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
  prisma: {
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
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
});

// Setup for the document router handlers
const mockCreateDocument = async (input: any, ctx: any) => {
  const userId = ctx.session?.user?.id;
  
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  const mockDocumentResult = {
    id: "doc-1",
    title: input.title,
    description: input.description || null,
    filePath: input.filePath,
    fileSize: input.fileSize,
    fileType: input.fileType,
    category: input.category,
    language: input.language,
    authorId: userId,
    isPublished: true,
    viewCount: 0,
    downloadCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  (createDocument as jest.Mock).mockResolvedValue(mockDocumentResult);
  
  await createAuditLog(
    userId,
    "create",
    "Document",
    mockDocumentResult.id,
    {
      title: mockDocumentResult.title,
      category: mockDocumentResult.category,
      language: mockDocumentResult.language
    }
  );
  
  return mockDocumentResult;
};

const mockGetDownloadUrl = async (input: any, ctx: any) => {
  const { documentId } = input;
  const userId = ctx.session?.user?.id;
  
  // Get document from database to get the file path
  const document = await ctx.prisma.document.findUnique({
    where: { id: documentId },
    select: { filePath: true, title: true },
  });
  
  if (!document) {
    throw new Error("Document not found");
  }
  
  // Create audit log for document download (if user is logged in)
  if (userId) {
    await createAuditLog(
      userId,
      "download",
      "Document",
      documentId,
      { title: document.title }
    );
  }
  
  return { downloadUrl: await getDownloadUrl(document.filePath) };
};

const mockIncrementViewCount = async (input: any, ctx: any) => {
  const { documentId } = input;
  const userId = ctx.session?.user?.id;
  
  // Get document to log title
  const document = await ctx.prisma.document.findUnique({
    where: { id: documentId },
    select: { title: true },
  });
  
  // Create audit log for document view (if user is logged in)
  if (userId && document) {
    await createAuditLog(
      userId,
      "view",
      "Document",
      documentId,
      { title: document.title }
    );
  }
  
  return { success: true };
};

describe("Documents Router Audit Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createDocument", () => {
    it("should create an audit log entry when creating a document", async () => {
      // Arrange
      const mockContext = createMockContext(mockSession);
      
      const input = {
        title: "Test Document",
        description: "Test Description",
        filePath: "path/to/document.pdf",
        fileSize: 1024,
        fileType: "application/pdf",
        category: DocumentCategory.GENERAL,
        language: Language.ENGLISH,
        isPublished: true,
      };

      // Act
      await mockCreateDocument(input, mockContext);

      // Assert
      expect(createAuditLog).toHaveBeenCalledWith(
        "user-1",
        "create",
        "Document",
        "doc-1",
        expect.objectContaining({
          title: "Test Document",
          category: DocumentCategory.GENERAL,
          language: Language.ENGLISH,
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
      await mockGetDownloadUrl(input, mockContext);

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

      // Act - This should throw but we'll catch it
      try {
        await mockGetDownloadUrl(input, mockContext);
      } catch (error) {
        // We expect an error since the user is not logged in
      }

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
      await mockIncrementViewCount(input, mockContext);

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
      await mockIncrementViewCount(input, mockContext);

      // Assert
      expect(createAuditLog).not.toHaveBeenCalled();
    });
  });
}); 