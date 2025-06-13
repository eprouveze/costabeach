import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/index";
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
    
    // Increment the download count
    await prisma.documents.update({
      where: { id: documentId },
      data: { download_count: { increment: 1 } },
    });
    
    // Generate a signed URL for the document with content disposition header
    const downloadUrl = await getDownloadUrl(document.file_path);
    
    return NextResponse.json({ downloadUrl });
  } catch (error) {
    console.error("Error generating download URL:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    );
  }
} 