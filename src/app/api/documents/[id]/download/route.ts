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
    const document = await prisma.documents.findUnique({
      where: { id }
    });
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    try {
      // Try to get a signed URL from S3
      const downloadUrl = await getDownloadUrl(document.filePath);
      
      // Increment the download count
      await prisma.documents.update({
        where: { id },
        data: { downloadCount: { increment: 1 } }
      });
      
      // Redirect to the signed URL
      return NextResponse.redirect(downloadUrl);
    } catch (error) {
      console.error('Error getting S3 download URL:', error);
      
      // Fallback to local dummy.pdf if S3 fails
      const filePath = path.join(process.cwd(), 'public', 'dummy.pdf');
      
      if (fs.existsSync(filePath)) {
        // Read file as buffer
        const fileBuffer = fs.readFileSync(filePath);
        
        // Construct a filename from the document title
        const filename = `${document.title.replace(/[^a-zA-Z0-9\._-]/g, '_')}.pdf`;
        
        // Increment the download count
        await prisma.documents.update({
          where: { id },
          data: { downloadCount: { increment: 1 } }
        });
        
        // Return the file as a response
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
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
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
} 