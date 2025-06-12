#!/usr/bin/env tsx
/**
 * Simple WhatsApp Test using our client implementation
 */

import { whatsappClient } from '../src/lib/whatsapp/client';

async function testWhatsAppClient() {
  console.log('🔄 Testing WhatsApp Client...\n');
  
  try {
    // Test client initialization
    console.log('📱 Initializing WhatsApp client...');
    await whatsappClient.initialize();
    
    console.log('✅ WhatsApp client initialized successfully!');
    console.log('📱 Scan the QR code with your WhatsApp when it appears');
    console.log('\nSteps:');
    console.log('1. Open WhatsApp on your phone');
    console.log('2. Go to Settings > Linked Devices');
    console.log('3. Tap "Link a Device"');
    console.log('4. Scan the QR code that appears\n');
    
    // Wait for connection
    let attempts = 0;
    while (!whatsappClient.isConnectedToWhatsApp() && attempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
      if (attempts % 5 === 0) {
        console.log(`⏳ Waiting for connection... (${attempts}s)`);
      }
    }
    
    if (whatsappClient.isConnectedToWhatsApp()) {
      console.log('✅ WhatsApp connected successfully!');
      
      // Test getting groups
      console.log('\n🔍 Getting WhatsApp groups...');
      const groups = await whatsappClient.getGroups();
      console.log(`📱 Found ${groups.length} groups:`);
      groups.forEach(group => {
        console.log(`  - ${group.name} (${group.participants} members)`);
      });
      
      console.log('\n💡 Next steps:');
      console.log('1. Create a test group with "Costa Beach Test" in the name');
      console.log('2. Add the connected WhatsApp number to the group');
      console.log('3. The system can then send notifications to the group');
      
    } else {
      console.log('❌ Connection timeout after 60 seconds');
      console.log('💡 Make sure to scan the QR code when it appears');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Start the test
testWhatsAppClient().catch(console.error);