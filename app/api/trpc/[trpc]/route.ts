import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/lib/api/root';
import { createTRPCContext } from '@/lib/api/trpc';
import { getServerAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => {
      const user = await getServerAuthSession();
      return {
        user,
        headers: req.headers,
        db,
      };
    },
  });

export { handler as GET, handler as POST }; 