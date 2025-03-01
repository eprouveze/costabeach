import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDownloadUrl } from "@/lib/utils/documents";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await context.params;
    
    // Get the document from the database
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });
    
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }
    
    // If the document is not published, check if the user is authenticated
    if (!document.isPublished) {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }
    
    // Increment the view count
    await prisma.document.update({
      where: { id: documentId },
      data: { viewCount: { increment: 1 } },
    });
    
    // Generate a signed URL for the document
    const previewUrl = await getDownloadUrl(document.filePath);
    
    return NextResponse.json({ previewUrl });
  } catch (error) {
    console.error("Error generating preview URL:", error);
    return NextResponse.json(
      { error: "Failed to generate preview URL" },
      { status: 500 }
    );
  }
} 