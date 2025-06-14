#!/usr/bin/env node

/**
 * Translation Configuration Checker
 * 
 * This script checks if the translation service is properly configured
 * and provides helpful instructions for setting it up.
 */

require('dotenv').config({ path: '.env.local' });

function checkTranslationConfig() {
  console.log('🔍 Checking Translation Service Configuration...\n');

  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  // Check if API key exists
  if (!apiKey) {
    console.log('❌ ANTHROPIC_API_KEY is not set');
    console.log('   The environment variable is missing from your .env.local file.\n');
    showSetupInstructions();
    return false;
  }

  // Check if API key is placeholder
  if (apiKey === 'sk-ant-your-anthropic-api-key' || apiKey.includes('your-anthropic-api-key')) {
    console.log('❌ ANTHROPIC_API_KEY is set to placeholder value');
    console.log(`   Current value: ${apiKey}\n`);
    showSetupInstructions();
    return false;
  }

  // Check API key format
  if (!apiKey.startsWith('sk-ant-')) {
    console.log('❌ ANTHROPIC_API_KEY has invalid format');
    console.log(`   Current value: ${apiKey.substring(0, 20)}...`);
    console.log('   API keys should start with "sk-ant-"\n');
    showSetupInstructions();
    return false;
  }

  // API key looks valid
  console.log('✅ ANTHROPIC_API_KEY is configured');
  console.log(`   Key: ${apiKey.substring(0, 20)}...\n`);

  // Test API connection (optional, requires actual API call)
  console.log('💡 To test the API connection, run the translation worker:');
  console.log('   npm run translation:worker:once\n');

  return true;
}

function showSetupInstructions() {
  console.log('📋 Setup Instructions:');
  console.log('');
  console.log('1. Get an Anthropic API key:');
  console.log('   • Visit: https://console.anthropic.com/');
  console.log('   • Sign up or log in to your account');
  console.log('   • Go to "API Keys" section');
  console.log('   • Create a new API key');
  console.log('');
  console.log('2. Add the API key to your .env.local file:');
  console.log('   • Open .env.local in your project root');
  console.log('   • Find the line: #ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key');
  console.log('   • Uncomment and replace with your real API key:');
  console.log('     ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here');
  console.log('');
  console.log('3. Restart your development server:');
  console.log('   npm run dev');
  console.log('');
  console.log('⚠️  Important Notes:');
  console.log('   • Keep your API key secret - never commit it to version control');
  console.log('   • The .env.local file is already in .gitignore');
  console.log('   • Translation features will not work without a valid API key');
  console.log('');
}

function showCurrentStatus() {
  console.log('📊 Current Translation Service Status:');
  console.log('');
  
  // Check if translation jobs exist
  const { execSync } = require('child_process');
  try {
    const result = execSync('npx prisma studio --browser none 2>/dev/null', { 
      timeout: 1000,
      stdio: 'ignore' 
    });
    console.log('✅ Database connection: OK');
  } catch (error) {
    console.log('⚠️  Database connection: Could not verify');
  }

  // Show current env vars (without revealing secrets)
  console.log('');
  console.log('Environment Variables:');
  console.log(`   ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'Set' : 'Not set'}`);
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
}

// Main execution
console.log('Costa Beach Translation Service Configuration Checker');
console.log('====================================================\n');

showCurrentStatus();
const isConfigured = checkTranslationConfig();

if (isConfigured) {
  console.log('🎉 Translation service is properly configured!');
  console.log('   You can now use document translation features.');
} else {
  console.log('❌ Translation service requires configuration.');
  console.log('   Document translation features will not work until this is fixed.');
}

console.log('\n📚 For more information, see: docs/i18n-automation.md');

process.exit(isConfigured ? 0 : 1);