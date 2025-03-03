import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    
    // Build the query
    const query: any = {
      where: {
        isPublished: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    };
    
    // Add category filter if provided
    if (category && category !== 'ALL') {
      query.where.category = category;
    }
    
    // Add search filter if provided
    if (search) {
      query.where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get documents from the database
    const documents = await prisma.document.findMany(query);
    
    // Return the documents
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
} 