import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Export as 'db' for compatibility with existing tRPC setup
export const db = prisma;
