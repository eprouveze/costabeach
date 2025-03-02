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

// Mock the translations router
jest.mock("@/lib/api/routers/translations", () => {
  const mockRouter = {
    requestDocumentTranslation: jest.fn(),
    getTranslationStatus: jest.fn(),
  };
  
  return {
    translationsRouter: {
      requestDocumentTranslation: {
        mutation: (fn) => {
          mockRouter.requestDocumentTranslation = fn;
          return { requestDocumentTranslation: fn };
        },
      },
      getTranslationStatus: {
        query: (fn) => {
          mockRouter.getTranslationStatus = fn;
          return { getTranslationStatus: fn };
        },
      },
    },
    _mockRouter: mockRouter,
  };
});

// Import the mocked router
const { _mockRouter: mockRouter } = jest.requireMock("@/lib/api/routers/translations");

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

describe("translationsRouter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

      await expect(async () => {
        await mockRouter.requestDocumentTranslation({ input, ctx: mockCtx });
      }).rejects.toThrow(TRPCError);
      
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

      await expect(async () => {
        await mockRouter.requestDocumentTranslation({ input, ctx: mockCtx });
      }).rejects.toThrow(TRPCError);
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
    });
  });
}); 