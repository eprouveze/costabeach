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
    const document = await prisma.documents.findUnique({
      where: { id: documentId },
    });
    
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }
    
    // If the document is not published, check if the user is authenticated
    if (!document.is_public) {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }
    
    // Check if preview is available for this file type
    const previewableTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'text/plain',
      'text/html',
      'application/json'
    ];
    
    const fileType = document.file_type.toLowerCase();
    const canPreview = previewableTypes.some(type => fileType.includes(type));
    
    if (!canPreview) {
      return NextResponse.json(
        { error: "Preview not available for this file type" },
        { status: 400 }
      );
    }
    
    // Increment the view count
    await prisma.documents.update({
      where: { id: documentId },
      data: { view_count: { increment: 1 } },
    });
    
    // Generate a signed URL for the document with inline content disposition
    // Use a shorter expiration time for previews (15 minutes)
    const previewUrl = await getDownloadUrl(document.file_path, 15 * 60, false);
    
    return NextResponse.json({ previewUrl });
  } catch (error) {
    console.error("Error generating preview URL:", error);
    return NextResponse.json(
      { error: "Failed to generate preview URL" },
      { status: 500 }
    );
  }
} 