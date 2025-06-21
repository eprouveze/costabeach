import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  // Ensure connection string has the required parameters for Supabase/PgBouncer
  const databaseUrl = process.env.DATABASE_URL || '';
  const urlWithParams = databaseUrl.includes('?') 
    ? databaseUrl.includes('pgbouncer=true') ? databaseUrl : `${databaseUrl}&pgbouncer=true&statement_cache_size=0`
    : `${databaseUrl}?pgbouncer=true&statement_cache_size=0`;
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: urlWithParams,
      },
    },
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

// Add cleanup for development mode to prevent connection leaks
if (process.env.NODE_ENV === 'development') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

// Export as 'db' for compatibility with existing tRPC setup
export const db = prisma;
