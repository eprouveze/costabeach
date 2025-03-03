export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    routes: {
      health: '/api/health',
      trpcTest: '/api/trpc-test',
      debug: '/api/debug'
    },
    env: process.env.NODE_ENV
  });
}