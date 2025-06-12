#!/usr/bin/env tsx
/**
 * Debug Meta WhatsApp Business API connection
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function debugWhatsAppAPI() {
  console.log('🔍 Debugging WhatsApp Business API connection...\n');
  
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
  const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  
  console.log('📋 Environment variables check:');
  console.log(`WHATSAPP_PHONE_NUMBER_ID: ${phoneNumberId ? '✅ Set' : '❌ Missing'}`);
  console.log(`WHATSAPP_ACCESS_TOKEN: ${accessToken ? '✅ Set' : '❌ Missing'}`);
  console.log(`WHATSAPP_WEBHOOK_SECRET: ${webhookSecret ? '✅ Set' : '❌ Missing'}`);
  console.log(`WHATSAPP_BUSINESS_ACCOUNT_ID: ${businessAccountId ? '✅ Set' : '❌ Missing'}\n`);
  
  if (!phoneNumberId || !accessToken) {
    console.log('❌ Missing required credentials');
    return;
  }
  
  // Test 1: Check phone number
  console.log('🔍 Test 1: Checking phone number info...');
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${phoneNumberId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        timeout: 10000,
      }
    );
    console.log('✅ Phone number verified:', response.data.display_phone_number);
    console.log('📱 Phone details:', response.data);
  } catch (error: any) {
    console.log('❌ Phone number check failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data?.error || error.message);
  }
  
  console.log('\n🔍 Test 2: Checking business account...');
  if (businessAccountId) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${businessAccountId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          timeout: 10000,
        }
      );
      console.log('✅ Business account verified:', response.data.name);
    } catch (error: any) {
      console.log('❌ Business account check failed:');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data?.error || error.message);
    }
  }
  
  console.log('\n🔍 Test 3: Checking message templates...');
  if (businessAccountId) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${businessAccountId}/message_templates`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          timeout: 10000,
        }
      );
      console.log(`✅ Found ${response.data.data.length} message templates`);
      if (response.data.data.length > 0) {
        console.log('Templates:', response.data.data.map((t: any) => t.name).join(', '));
      }
    } catch (error: any) {
      console.log('❌ Templates check failed:');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data?.error || error.message);
    }
  }
  
  console.log('\n💡 Next steps:');
  console.log('1. If phone number check failed: Verify WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID');
  console.log('2. If templates check failed: Add WHATSAPP_BUSINESS_ACCOUNT_ID');
  console.log('3. Ready to send test message: Use a verified recipient phone number');
  console.log('\n📞 To send a test message:');
  console.log('const result = await whatsappClient.sendTextMessage("1234567890", "Hello from Costa Beach!");');
}

// Start the debug
debugWhatsAppAPI().catch(console.error);