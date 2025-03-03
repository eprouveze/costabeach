const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Helper function for safe directory removal
function safeRemoveDir(dirPath) {
  console.log(`Attempting to remove directory: ${dirPath}`);
  try {
    if (fs.existsSync(dirPath)) {
      console.log(`Directory exists: ${dirPath}`);
      
      // On macOS/Linux, try using rm command directly which might work better with external drives
      try {
        execSync(`rm -rf "${dirPath}"`, { stdio: 'inherit' });
        console.log(`Removed directory using rm command: ${dirPath}`);
        return true;
      } catch (rmErr) {
        console.warn(`Failed to remove with rm command, falling back to fs.rmSync: ${rmErr.message}`);
        
        // Fallback to Node.js fs methods
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`Removed directory using fs.rmSync: ${dirPath}`);
        return true;
      }
    } else {
      console.log(`Directory does not exist: ${dirPath}`);
      return false;
    }
  } catch (err) {
    console.error(`Error removing directory ${dirPath}:`, err);
    return false;
  }
}

// Print environment info
console.log('=== Environment Information ===');
console.log(`Current working directory: ${process.cwd()}`);
console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`User info: ${process.env.USER || process.env.USERNAME}`);
console.log('=============================\n');

// Clear Next.js cache only
console.log('\nClearing Next.js cache...');
safeRemoveDir('.next');
safeRemoveDir(path.join('node_modules', '.cache'));

// Create manifest directory if it doesn't exist
console.log('Ensuring middleware manifest directory exists...');
try {
  const manifestDir = path.join('.next', 'server');
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
    console.log(`Created directory: ${manifestDir}`);
  }
  
  // Create an empty middleware manifest if it doesn't exist
  const manifestPath = path.join(manifestDir, 'middleware-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    fs.writeFileSync(manifestPath, JSON.stringify({ middleware: [] }));
    console.log(`Created empty middleware manifest: ${manifestPath}`);
  }
} catch (err) {
  console.warn('Error ensuring middleware directory exists:', err);
}

// Create route files again in case they were deleted
console.log('\nEnsuring route files exist...');
const routeFiles = [
  { 
    path: 'src/app/api/health/route.ts',
    content: `export async function GET() {
  return Response.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
}`
  },
  {
    path: 'src/app/api/debug/route.ts',
    content: `export async function GET() {
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
}`
  },
  {
    path: 'src/app/api/trpc-test/route.ts',
    content: `import { createCallerFactory } from "@/lib/api/trpc";
import { appRouter } from "@/lib/api/root";

export async function GET() {
  try {
    // Create a tRPC caller
    const createCaller = createCallerFactory(appRouter);
    const caller = createCaller({});
    
    // Try to call a simple procedure if one exists, like a health check
    // Adjust this call to use a procedure that actually exists in your router
    const result = await caller.healthCheck();
    
    return Response.json({
      status: 'ok',
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('tRPC test error:', error);
    return Response.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV !== 'production' 
        ? error instanceof Error ? error.stack : undefined
        : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}`
  },
  {
    path: 'src/app/test-debug/page.tsx',
    content: `"use client";

export default function TestDebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="space-y-6">
        <TestCard 
          title="Health Check API" 
          endpoint="/api/health" 
          description="Basic health check endpoint that returns a 200 OK response" 
        />
        
        <TestCard 
          title="Debug API" 
          endpoint="/api/debug" 
          description="Debug information endpoint that returns details about the API" 
        />
        
        <TestCard 
          title="tRPC Test API" 
          endpoint="/api/trpc-test" 
          description="Test endpoint that calls a tRPC procedure directly from the server" 
        />
        
        <TestCard 
          title="Regular tRPC API" 
          endpoint="/api/trpc/healthCheck" 
          description="Standard tRPC endpoint access" 
        />
      </div>
    </div>
  );
}

function TestCard({ title, endpoint, description }: { 
  title: string;
  endpoint: string;
  description: string;
}) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      
      <div className="flex space-x-4">
        <a 
          href={endpoint}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Open API
        </a>
        
        <button
          onClick={async () => {
            try {
              const response = await fetch(endpoint);
              const data = await response.json();
              console.log('API Response:', data);
              alert('Check console for response data');
            } catch (err) {
              console.error('Error calling API:', err);
              alert('Error calling API. Check console for details.');
            }
          }}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Test in Console
        </button>
      </div>
    </div>
  );
}
`
  }
];

for (const file of routeFiles) {
  const dirPath = path.dirname(file.path);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
  
  fs.writeFileSync(file.path, file.content);
  console.log(`Created/updated file: ${file.path}`);
}

// Add a healthCheck procedure to the root router if it doesn't exist
console.log('\nAdding healthCheck procedure to root router if needed...');
try {
  const rootRouterPath = 'src/lib/api/root.ts';
  if (fs.existsSync(rootRouterPath)) {
    let rootContent = fs.readFileSync(rootRouterPath, 'utf8');
    
    if (!rootContent.includes('healthCheck:')) {
      // Find the router definition
      const routerRegex = /export\s+const\s+appRouter\s*=\s*createTRPCRouter\s*\(\s*\{/;
      if (routerRegex.test(rootContent)) {
        rootContent = rootContent.replace(
          routerRegex,
          `export const appRouter = createTRPCRouter({
  healthCheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),`
        );
        
        // Make sure publicProcedure is imported
        if (!rootContent.includes('publicProcedure')) {
          const importRegex = /import\s*\{\s*createTRPCRouter\s*\}/;
          if (importRegex.test(rootContent)) {
            rootContent = rootContent.replace(
              importRegex,
              `import { createTRPCRouter, publicProcedure }`
            );
          }
        }
        
        fs.writeFileSync(rootRouterPath, rootContent);
        console.log(`Updated ${rootRouterPath} with healthCheck procedure`);
      } else {
        console.log(`Could not find router definition in ${rootRouterPath}`);
      }
    } else {
      console.log('healthCheck procedure already exists in root router');
    }
  } else {
    console.log(`Root router file not found: ${rootRouterPath}`);
  }
} catch (err) {
  console.warn('Error updating root router:', err);
}

// Run the build using local node_modules binaries
console.log('\nRunning Next.js build...');
try {
  // First install prisma if needed
  if (!fs.existsSync('node_modules/.bin/prisma')) {
    console.log('Installing prisma...');
    execSync('npm install --save-dev prisma --legacy-peer-deps', { stdio: 'inherit' });
  }
  
  // Run prisma generate using the local binary
  console.log('Running prisma generate...');
  execSync('node_modules/.bin/prisma generate', { stdio: 'inherit' });
  
  // Build the Next.js app
  console.log('Building Next.js app...');
  execSync('node_modules/.bin/next build', { stdio: 'inherit' });
  
  console.log('\nBuild completed successfully');
} catch (err) {
  console.error('Error during build:', err);
  console.log('\nTrying alternative approach with npx...');
  
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    execSync('npx next build', { stdio: 'inherit' });
    console.log('\nBuild with npx completed successfully');
  } catch (npxErr) {
    console.error('Error during npx build:', npxErr);
    process.exit(1);
  }
}

console.log('\nStarting development server...');
try {
  execSync('node_modules/.bin/next dev', { stdio: 'inherit' });
} catch (err) {
  console.error('Error starting development server with node_modules binary:', err);
  console.log('Trying with npx...');
  
  try {
    execSync('npx next dev', { stdio: 'inherit' });
  } catch (npxErr) {
    console.error('Error starting development server with npx:', npxErr);
  }
} 