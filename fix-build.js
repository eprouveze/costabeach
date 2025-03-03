const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Clear caches
console.log('Clearing Next.js caches...');
try {
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('Removed .next directory');
  }
  
  const nodeModulesCachePath = path.join('node_modules', '.cache');
  if (fs.existsSync(nodeModulesCachePath)) {
    fs.rmSync(nodeModulesCachePath, { recursive: true, force: true });
    console.log('Removed node_modules/.cache directory');
  }
} catch (err) {
  console.error('Error clearing caches:', err);
}

// Run npm install to ensure dependencies are up to date
console.log('\nRunning npm install to ensure dependencies are correct...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (err) {
  console.error('Error during npm install:', err);
  process.exit(1);
}

// Build the application
console.log('\nBuilding the application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\nBuild completed successfully');
} catch (err) {
  console.error('Error during build:', err);
  process.exit(1);
}

console.log('\nStarting development server...');
try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (err) {
  console.error('Error starting development server:', err);
} 