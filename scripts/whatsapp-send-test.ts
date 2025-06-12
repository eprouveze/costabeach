#!/usr/bin/env tsx
/**
 * Test sending a WhatsApp message
 */

import * as dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Import client factory AFTER loading env vars
import { getWhatsAppClient } from '../src/lib/whatsapp/client';

async function testSendMessage() {
  console.log('📱 Testing WhatsApp message sending...\n');
  
  // Get test phone number from command line argument
  const testPhoneNumber = process.argv[2];
  
  if (!testPhoneNumber) {
    console.log('❌ Please provide a test phone number:');
    console.log('npm run whatsapp:send +1234567890');
    console.log('\n💡 Use a verified phone number that can receive test messages');
    console.log('Format: +[country_code][phone_number] (e.g., +14155552671)');
    return;
  }
  
  try {
    // Get client instance
    const whatsappClient = getWhatsAppClient();
    
    // Initialize client
    await whatsappClient.initialize();
    
    console.log(`📞 Sending test message to: ${testPhoneNumber}`);
    
    // Test simple text message
    const messageText = `🏖️ Hello from Costa Beach! 

This is a test message from the community platform.

📝 Features available:
• Document notifications
• Community polls  
• Important announcements

Time: ${new Date().toLocaleString()}`;

    console.log('\n📤 Sending message...');
    const messageId = await whatsappClient.sendTextMessage(testPhoneNumber, messageText);
    
    console.log('✅ Message sent successfully!');
    console.log(`📧 Message ID: ${messageId}`);
    console.log('\n💡 Check the recipient phone to confirm delivery');
    
    console.log('\n🧪 Additional tests available:');
    console.log('• Document message: whatsappClient.sendDocumentMessage()');
    console.log('• Image message: whatsappClient.sendImageMessage()');
    console.log('• Template message: whatsappClient.sendTemplateMessage()');
    
  } catch (error: any) {
    console.error('❌ Message sending failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('template')) {
      console.log('\n💡 Template messages require pre-approved templates');
      console.log('Use regular text messages for testing first');
    }
    
    if (error.message.includes('recipient')) {
      console.log('\n💡 Make sure the phone number:');
      console.log('• Is in international format (+1234567890)');
      console.log('• Is verified to receive test messages');
      console.log('• Has WhatsApp installed');
    }
  }
}

// Start the test
testSendMessage().catch(console.error);