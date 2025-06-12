import { inferAsyncReturnType } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { getCurrentUser } from '@/lib/auth/index';
import { db } from '@/lib/db';

export async function createContext({ req, resHeaders }: FetchCreateContextFnOptions) {
  // Get the current user from the request if available
  const user = await getCurrentUser();
  
  return {
    user,
    headers: req.headers,
    db: db,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>; 