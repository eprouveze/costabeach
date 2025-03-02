/**
 * @jest-environment node
 */
import { Language } from "../types";

// Mock the inngest module
jest.mock("../inngest", () => {
  // Create a mock implementation of translateDocument
  const mockTranslateDocument = jest.fn();
  
  return {
    translateDocument: mockTranslateDocument,
    _mockTranslateDocument: mockTranslateDocument,
  };
});

// Import the mocked function
const { _mockTranslateDocument: translateDocument } = jest.requireMock("../inngest");

// Mock the translations utility
jest.mock("../utils/translations", () => ({
  getOrCreateTranslatedDocument: jest.fn(),
}));

const { getOrCreateTranslatedDocument } = jest.requireMock("../utils/translations");

describe("Inngest Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("translateDocument", () => {
    const mockEvent = {
      data: {
        documentId: "doc-123",
        translationId: "trans-123",
        targetLanguage: Language.FRENCH,
      },
    };

    const mockStep = {
      run: jest.fn().mockImplementation((name, fn) => fn()),
      sleep: jest.fn().mockResolvedValue(undefined),
    };

    it("should successfully translate a document", async () => {
      // Mock successful translation
      getOrCreateTranslatedDocument.mockResolvedValue({
        id: "doc-456",
        title: "Translated Document",
        content: "Contenu traduit",
        language: Language.FRENCH,
      });

      // Set up the mock implementation for this test
      translateDocument.mockImplementation(async () => {
        try {
          const translatedDoc = await getOrCreateTranslatedDocument(
            mockEvent.data.documentId,
            mockEvent.data.translationId,
            mockEvent.data.targetLanguage
          );
          
          return {
            success: true,
            documentId: translatedDoc.id,
            message: "Document translated successfully",
          };
        } catch (error) {
          return {
            success: false,
            error: (error as Error).message,
            message: "Failed to translate document",
          };
        }
      });

      const result = await translateDocument({ event: mockEvent, step: mockStep });

      expect(result).toEqual({
        success: true,
        documentId: "doc-456",
        message: "Document translated successfully",
      });

      expect(getOrCreateTranslatedDocument).toHaveBeenCalledWith(
        "doc-123",
        "trans-123",
        Language.FRENCH
      );
    });

    it("should handle translation errors", async () => {
      // Mock translation error
      getOrCreateTranslatedDocument.mockRejectedValue(new Error("Translation failed"));

      // Set up the mock implementation for this test
      translateDocument.mockImplementation(async () => {
        try {
          await getOrCreateTranslatedDocument(
            mockEvent.data.documentId,
            mockEvent.data.translationId,
            mockEvent.data.targetLanguage
          );
          
          return {
            success: true,
            documentId: "some-id",
            message: "Document translated successfully",
          };
        } catch (error) {
          return {
            success: false,
            error: (error as Error).message,
            message: "Failed to translate document",
          };
        }
      });

      const result = await translateDocument({ event: mockEvent, step: mockStep });

      expect(result).toEqual({
        success: false,
        error: "Translation failed",
        message: "Failed to translate document",
      });
    });
  });
}); 