import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { DocumentCategory, Language } from '@/lib/types';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check database connection
    const testResult = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Return some mock document data to verify the API is working
    return NextResponse.json({
      success: true,
      message: "Document API is working",
      databaseConnection: testResult ? "connected" : "failed",
      mockDocuments: [
        {
          id: "test-doc-1",
          title: "Test Document 1",
          description: "This is a test document for API diagnosis",
          category: DocumentCategory.COMITE_DE_SUIVI,
          language: Language.FRENCH,
          createdAt: new Date(),
          fileSize: 12345
        }
      ]
    });
  } catch (error: any) {
    console.error("Error in test-document API:", error);
    
    return NextResponse.json({
      success: false,
      message: "Error in document API",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 