const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Next.js Reinstallation Script ===');
console.log(`Current working directory: ${process.cwd()}`);

// Remove just the next package
console.log('\nRemoving Next.js package...');
try {
  if (fs.existsSync('node_modules/next')) {
    execSync('rm -rf node_modules/next', { stdio: 'inherit' });
    console.log('Removed node_modules/next directory');
  }
} catch (err) {
  console.error('Error removing Next.js:', err);
}

// Install next explicitly
console.log('\nReinstalling Next.js...');
try {
  execSync('npm install next@latest --legacy-peer-deps --no-save', { stdio: 'inherit' });
  console.log('Next.js reinstalled successfully');
} catch (err) {
  console.error('Error installing Next.js:', err);
  
  try {
    console.log('\nTrying with a specific version...');
    execSync('npm install next@13.5.6 --legacy-peer-deps --no-save', { stdio: 'inherit' });
    console.log('Next.js 13.5.6 installed successfully');
  } catch (nextErr) {
    console.error('Error installing Next.js 13.5.6:', nextErr);
  }
}

// Create a direct run script that doesn't rely on npm scripts
console.log('\nCreating direct run scripts...');

const devScript = `#!/bin/bash
echo "Starting Next.js development server..."
NODE_OPTIONS="--max-old-space-size=4096" ./node_modules/.bin/next dev
`;

const buildScript = `#!/bin/bash
echo "Building Next.js application..."
NODE_OPTIONS="--max-old-space-size=4096" ./node_modules/.bin/next build
`;

try {
  fs.writeFileSync('dev.sh', devScript, { mode: 0o755 });
  fs.writeFileSync('build.sh', buildScript, { mode: 0o755 });
  console.log('Created dev.sh and build.sh scripts');
  console.log('You can now run ./dev.sh to start the development server');
} catch (err) {
  console.error('Error creating scripts:', err);
}

// Check if next command is available
console.log('\nVerifying Next.js installation...');
try {
  if (fs.existsSync('node_modules/.bin/next')) {
    console.log('Next.js binary found at node_modules/.bin/next');
  } else {
    console.log('Next.js binary NOT found! Installation may have failed.');
  }
  
  // Check for global next installation
  try {
    execSync('which next', { stdio: 'pipe' });
    console.log('Global next command is available');
  } catch (e) {
    console.log('Global next command is NOT available');
  }
} catch (err) {
  console.error('Error during verification:', err);
}

console.log('\nScript completed. If you still have issues:');
console.log('1. Try running: ./dev.sh');
console.log('2. Try running: npx next dev');
console.log('3. Consider moving the project to a local drive if possible'); 