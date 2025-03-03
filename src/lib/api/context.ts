import { inferAsyncReturnType } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { getServerSession } from "next-auth";
import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function createContext({ req, resHeaders }: FetchCreateContextFnOptions) {
  // Get the session from the request if available
  const session = await getServerAuthSession();
  
  return {
    session,
    headers: req.headers,
    db: prisma,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>; 