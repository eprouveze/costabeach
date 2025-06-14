import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth/index";
import { prisma } from "@/lib/db";
import { inngest } from "@/lib/inngest";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const user = await getServerAuthSession();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { documentId, targetLanguage } = body;

    if (!documentId || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the document to translate
    const document = await prisma.documents.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check if document is already in the target language
    if (document.language === targetLanguage) {
      return NextResponse.json(
        { error: "Document is already in the target language" },
        { status: 400 }
      );
    }

    // Check if translation already exists
    const existingTranslation = await prisma.documents.findFirst({
      where: {
        originalDocumentId: documentId,
        language: targetLanguage,
      },
    });

    if (existingTranslation) {
      return NextResponse.json({
        success: true,
        documentId: existingTranslation.id,
        message: "Translation already exists",
        status: "completed",
      });
    }

    // Create a background job for translation using Inngest
    await inngest.send({
      name: "document/translate",
      data: {
        documentId,
        targetLanguage,
        userId: user.user?.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Document translation requested",
      status: "pending",
    });
  } catch (error) {
    console.error("Error requesting document translation:", error);
    return NextResponse.json(
      { error: "Failed to request document translation" },
      { status: 500 }
    );
  }
} 