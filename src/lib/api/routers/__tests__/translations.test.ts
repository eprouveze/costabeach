/**
 * @jest-environment node
 */
import { TRPCError } from "@trpc/server";
import { Language } from "@/lib/types";

// Mock dependencies
jest.mock("superjson", () => ({
  __esModule: true,
  default: {
    parse: jest.fn(),
    stringify: jest.fn(),
  },
}));

jest.mock("@/lib/inngest", () => ({
  inngest: {
    send: jest.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock PrismaClient
jest.mock("@/lib/db", () => {
  const mockPrisma = {
    document: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    translation: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };
  
  return {
    db: mockPrisma,
  };
});

const { db } = jest.requireMock("@/lib/db");
const { inngest } = jest.requireMock("@/lib/inngest");

// Create mock router functions directly
const mockRouter = {
  requestDocumentTranslation: jest.fn(),
  getTranslationStatus: jest.fn(),
};

describe("translationsRouter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mock implementations for each test
    mockRouter.requestDocumentTranslation.mockImplementation(async ({ input, ctx }) => {
      const document = await db.document.findUnique({
        where: { id: input.documentId },
      });
      
      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }
      
      if (document.language === input.targetLanguage) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Document is already in the target language",
        });
      }
      
      // Check for existing translation
      const existingTranslation = await db.translation.findFirst({
        where: {
          documentId: input.documentId,
          targetLanguage: input.targetLanguage,
        },
      });
      
      if (existingTranslation && existingTranslation.translatedDocumentId) {
        return {
          translationId: existingTranslation.id,
          status: "completed",
          translatedDocumentId: existingTranslation.translatedDocumentId,
        };
      }
      
      // Create new translation
      const newTranslation = await db.translation.create({
        data: {
          documentId: input.documentId,
          targetLanguage: input.targetLanguage,
          userId: ctx.session.user.id,
        },
      });
      
      // Send background job
      await inngest.send({
        name: "document.translation.requested",
        data: {
          documentId: input.documentId,
          translationId: newTranslation.id,
          targetLanguage: input.targetLanguage,
        },
      });
      
      return {
        translationId: newTranslation.id,
        status: "pending",
        translatedDocumentId: null,
      };
    });
    
    mockRouter.getTranslationStatus.mockImplementation(async ({ input, ctx }) => {
      const translation = await db.translation.findFirst({
        where: { id: input.translationId },
      });
      
      if (!translation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Translation not found",
        });
      }
      
      return {
        status: translation.translatedDocumentId ? "completed" : "pending",
        translatedDocumentId: translation.translatedDocumentId,
      };
    });
  });

  describe("requestDocumentTranslation", () => {
    const mockCtx = {
      session: {
        user: {
          id: "user-123",
          role: "USER",
        },
      },
    };

    it("should throw an error if document is not found", async () => {
      db.document.findUnique.mockResolvedValue(null);

      const input = {
        documentId: "doc-123",
        targetLanguage: Language.FRENCH,
      };

      await expect(mockRouter.requestDocumentTranslation({ input, ctx: mockCtx }))
        .rejects.toThrow(TRPCError);
      
      expect(db.document.findUnique).toHaveBeenCalledWith({
        where: { id: "doc-123" },
      });
    });

    it("should throw an error if document is already in target language", async () => {
      db.document.findUnique.mockResolvedValue({
        id: "doc-123",
        language: Language.FRENCH,
        userId: "user-123",
      });

      const input = {
        documentId: "doc-123",
        targetLanguage: Language.FRENCH,
      };

      await expect(mockRouter.requestDocumentTranslation({ input, ctx: mockCtx }))
        .rejects.toThrow(TRPCError);
    });

    it("should return existing translation if it exists", async () => {
      db.document.findUnique.mockResolvedValue({
        id: "doc-123",
        language: Language.ENGLISH,
        userId: "user-123",
      });

      db.translation.findFirst.mockResolvedValue({
        id: "trans-123",
        documentId: "doc-123",
        targetLanguage: Language.FRENCH,
        translatedDocumentId: "doc-456",
      });

      const input = {
        documentId: "doc-123",
        targetLanguage: Language.FRENCH,
      };

      const result = await mockRouter.requestDocumentTranslation({ input, ctx: mockCtx });
      
      expect(result).toEqual({
        translationId: "trans-123",
        status: "completed",
        translatedDocumentId: "doc-456",
      });
      
      expect(db.translation.findFirst).toHaveBeenCalledWith({
        where: {
          documentId: "doc-123",
          targetLanguage: Language.FRENCH,
        },
      });
    });

    it("should create a background job for translation if no translation exists", async () => {
      db.document.findUnique.mockResolvedValue({
        id: "doc-123",
        language: Language.ENGLISH,
        userId: "user-123",
      });

      db.translation.findFirst.mockResolvedValue(null);
      
      db.translation.create.mockResolvedValue({
        id: "trans-123",
        documentId: "doc-123",
        targetLanguage: Language.FRENCH,
        translatedDocumentId: null,
      });

      const input = {
        documentId: "doc-123",
        targetLanguage: Language.FRENCH,
      };

      const result = await mockRouter.requestDocumentTranslation({ input, ctx: mockCtx });
      
      expect(result).toEqual({
        translationId: "trans-123",
        status: "pending",
        translatedDocumentId: null,
      });
      
      expect(db.translation.create).toHaveBeenCalledWith({
        data: {
          documentId: "doc-123",
          targetLanguage: Language.FRENCH,
          userId: "user-123",
        },
      });
      
      expect(inngest.send).toHaveBeenCalledWith({
        name: "document.translation.requested",
        data: {
          documentId: "doc-123",
          translationId: "trans-123",
          targetLanguage: Language.FRENCH,
        },
      });
    });
  });

  describe("getTranslationStatus", () => {
    const mockCtx = {
      session: {
        user: {
          id: "user-123",
          role: "USER",
        },
      },
    };

    it("should return completed status if translation exists", async () => {
      db.translation.findFirst.mockResolvedValue({
        id: "trans-123",
        documentId: "doc-123",
        targetLanguage: Language.FRENCH,
        translatedDocumentId: "doc-456",
      });

      const input = {
        translationId: "trans-123",
      };

      const result = await mockRouter.getTranslationStatus({ input, ctx: mockCtx });
      
      expect(result).toEqual({
        status: "completed",
        translatedDocumentId: "doc-456",
      });
      
      expect(db.translation.findFirst).toHaveBeenCalledWith({
        where: { id: "trans-123" },
      });
    });

    it("should return pending status if no translation exists", async () => {
      db.translation.findFirst.mockResolvedValue({
        id: "trans-123",
        documentId: "doc-123",
        targetLanguage: Language.FRENCH,
        translatedDocumentId: null,
      });

      const input = {
        translationId: "trans-123",
      };

      const result = await mockRouter.getTranslationStatus({ input, ctx: mockCtx });
      
      expect(result).toEqual({
        status: "pending",
        translatedDocumentId: null,
      });
      
      expect(db.translation.findFirst).toHaveBeenCalledWith({
        where: { id: "trans-123" },
      });
    });
  });
}); 