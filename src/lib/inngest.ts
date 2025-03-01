import { Inngest } from "inngest";
import { getOrCreateTranslatedDocument } from "./utils/translations";
import { Language } from "./types";

// Create a client
export const inngest = new Inngest({
  id: "costa-beach-hoa",
});

// Define event types
export type InngestEvents = {
  "document/translate": {
    data: {
      documentId: string;
      targetLanguage: string;
      userId: string;
    };
  };
  "user/registered": {
    data: {
      userId: string;
      email: string;
    };
  };
};

// Define the function types to match Inngest's expected signature
export const userRegistered = inngest.createFunction(
  { name: "User Registered", id: "user/registered" },
  { event: "user/registered" },
  async ({ event, step }) => {
    // Handle the event
    return { status: "success" };
  },
);

export const translateDocument = inngest.createFunction(
  { name: "Translate Document", id: "document/translate" },
  { event: "document/translate" },
  async ({ event, step }) => {
    const { documentId, targetLanguage, userId } = event.data;
    
    // Log the start of translation
    await step.run("log-start", async () => {
      console.log(`Starting translation of document ${documentId} to ${targetLanguage}`);
      return { status: "started" };
    });
    
    try {
      // Perform the translation
      const translatedDocument = await step.run("translate-document", async () => {
        return await getOrCreateTranslatedDocument(
          documentId,
          targetLanguage as unknown as Language
        );
      });
      
      await step.run("log-complete", async () => {
        console.log(`Translation completed. New document ID: ${translatedDocument.id}`);
        return { status: "completed" };
      });
      
      return {
        success: true,
        documentId: translatedDocument.id,
        message: "Document translation completed successfully",
      };
    } catch (error) {
      await step.run("log-error", async () => {
        console.error(`Translation failed: ${(error as Error).message}`);
        return { status: "failed", error: (error as Error).message };
      });
      
      return {
        success: false,
        error: (error as Error).message,
        message: "Document translation failed",
      };
    }
  },
);
