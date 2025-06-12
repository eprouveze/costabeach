#!/usr/bin/env tsx
/**
 * Test Meta WhatsApp Business API
 */

import { whatsappClient } from '../src/lib/whatsapp/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testMetaWhatsAppAPI() {
  console.log('🔄 Testing Meta WhatsApp Business API...\n');
  
  try {
    // Check environment variables
    const requiredEnvVars = [
      'WHATSAPP_ACCESS_TOKEN',
      'WHATSAPP_PHONE_NUMBER_ID',
      'WHATSAPP_WEBHOOK_SECRET'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('❌ Missing required environment variables:');
      missingVars.forEach(varName => {
        console.log(`  - ${varName}`);
      });
      console.log('\n💡 Setup instructions:');
      console.log('1. Go to https://developers.facebook.com/apps/');
      console.log('2. Create a new app or select existing app');
      console.log('3. Add WhatsApp Business API product');
      console.log('4. Get your access token and phone number ID');
      console.log('5. Set up webhook verification token');
      console.log('\n📝 Add to your .env file:');
      console.log('WHATSAPP_ACCESS_TOKEN=your_access_token_here');
      console.log('WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here');
      console.log('WHATSAPP_WEBHOOK_SECRET=your_webhook_secret_here');
      console.log('WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here');
      return;
    }
    
    // Initialize client
    console.log('📱 Initializing WhatsApp Business API client...');
    await whatsappClient.initialize();
    
    if (whatsappClient.isConnectedToWhatsApp()) {
      console.log('✅ WhatsApp Business API client ready!');
      
      console.log('\n📋 Available features:');
      console.log('• Send text messages');
      console.log('• Send template messages');
      console.log('• Send document messages');
      console.log('• Send image messages');
      console.log('• Broadcast to multiple numbers');
      console.log('• Parse incoming webhooks');
      
      console.log('\n💰 Pricing (2025 updates):');
      console.log('• Service conversations: FREE');
      console.log('• Utility templates (24h window): FREE');
      console.log('• Template messages: ~$0.005-0.04 each');
      console.log('• For Costa Beach: ~$5-15/month total');
      
      console.log('\n🧪 To test sending messages:');
      console.log('const result = await whatsappClient.sendTextMessage("1234567890", "Hello from Costa Beach!");');
      
      // Get templates
      console.log('\n📄 Fetching message templates...');
      try {
        const templates = await whatsappClient.getMessageTemplates();
        console.log(`Found ${templates.length} templates`);
        if (templates.length > 0) {
          console.log('Template names:', templates.map(t => t.name).join(', '));
        }
      } catch (error) {
        console.log('⚠️ Could not fetch templates (need WHATSAPP_BUSINESS_ACCOUNT_ID)');
      }
      
      console.log('\n✅ Meta WhatsApp Business API test successful!');
      
    } else {
      console.log('❌ WhatsApp Business API client not properly configured');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Start the test
testMetaWhatsAppAPI().catch(console.error);