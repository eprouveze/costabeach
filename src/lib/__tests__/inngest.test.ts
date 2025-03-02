/**
 * @jest-environment node
 */
import { translateDocument } from "../inngest";
import { Language } from "../types";

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

      const result = await translateDocument({ event: mockEvent, step: mockStep } as any);

      expect(result).toEqual({
        success: true,
        documentId: "doc-456",
        message: "Document translated successfully",
      });

      expect(mockStep.run).toHaveBeenCalledTimes(2);
      expect(getOrCreateTranslatedDocument).toHaveBeenCalledWith(
        "doc-123",
        "trans-123",
        Language.FRENCH
      );
    });

    it("should handle translation errors", async () => {
      // Mock translation error
      getOrCreateTranslatedDocument.mockRejectedValue(new Error("Translation failed"));

      const result = await translateDocument({ event: mockEvent, step: mockStep } as any);

      expect(result).toEqual({
        success: false,
        error: "Translation failed",
        message: "Failed to translate document",
      });

      expect(mockStep.run).toHaveBeenCalledTimes(2);
    });
  });
}); 