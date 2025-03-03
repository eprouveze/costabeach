import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db';
import { getDownloadUrl } from '@/lib/utils/documents';
import path from 'path';
import fs from 'fs';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Retrieve the document from the database
    const document = await prisma.document.findUnique({
      where: { id }
    });
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    try {
      // Try to get a signed URL from S3 with inline disposition
      const previewUrl = await getDownloadUrl(document.filePath, 3600, false);
      
      // Increment the view count
      await prisma.document.update({
        where: { id },
        data: { viewCount: { increment: 1 } }
      });
      
      // Redirect to the signed URL
      return NextResponse.redirect(previewUrl);
    } catch (error) {
      console.error('Error getting S3 preview URL:', error);
      
      // Fallback to local dummy.pdf if S3 fails
      const filePath = path.join(process.cwd(), 'public', 'dummy.pdf');
      
      if (fs.existsSync(filePath)) {
        // Read file as buffer
        const fileBuffer = fs.readFileSync(filePath);
        
        // Increment the view count
        await prisma.document.update({
          where: { id },
          data: { viewCount: { increment: 1 } }
        });
        
        // Return the file as a response with inline disposition
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline',
          },
        });
      } else {
        // Return an error if the dummy file doesn't exist
        return NextResponse.json(
          { error: 'Document file not found' },
          { status: 404 }
        );
      }
    }
  } catch (error) {
    console.error('Error previewing document:', error);
    return NextResponse.json(
      { error: 'Failed to preview document' },
      { status: 500 }
    );
  }
} 