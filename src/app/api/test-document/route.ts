import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DocumentCategory, Language } from '@/lib/types';

export async function GET() {
  try {
    // Check database connection
    const dbStatus = await prisma.$queryRaw`SELECT 1 as status`;
    
    // Try to fetch documents
    const documents = await prisma.document.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Check S3 configuration
    const s3Config = {
      region: process.env.AWS_REGION || 'us-west-2',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ? 'configured' : 'missing',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? 'configured' : 'missing',
      bucketName: process.env.BUCKET_NAME || 'costa-beach-documents'
    };
    
    return NextResponse.json({
      status: 'ok',
      dbConnection: dbStatus ? 'connected' : 'failed',
      documentsCount: documents.length,
      documents: documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        language: doc.language
      })),
      s3Config
    });
  } catch (error) {
    console.error('Test document API error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 });
  }
} 