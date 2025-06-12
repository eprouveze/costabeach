#!/usr/bin/env tsx
/**
 * Test the WhatsApp assistant functionality
 */

import * as dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Import services AFTER loading env vars
import { whatsappAssistant } from '../src/lib/services/whatsappAssistant';
import { whatsappNotificationService } from '../src/lib/services/whatsappNotificationService';

async function testWhatsAppAssistant() {
  console.log('🤖 Testing WhatsApp Assistant...\\n');
  
  // Get test phone number from command line argument
  const testPhoneNumber = process.argv[2] || '+15551234567';
  
  console.log(`📱 Testing with phone number: ${testPhoneNumber}\\n`);
  
  try {
    // Test 1: Welcome message
    console.log('🎉 Test 1: Sending welcome message...');
    await whatsappAssistant.sendWelcomeMessage(testPhoneNumber, 'Test User');
    console.log('✅ Welcome message sent\\n');
    
    // Wait a bit between messages
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Knowledge base queries
    const testQueries = [
      "What is Costa Beach?",
      "How do I access documents?",
      "Building hours",
      "How do I vote in polls?",
      "Maintenance issue",
      "Emergency procedures",
      "Contact management"
    ];
    
    console.log('🧠 Test 2: Testing knowledge base responses...');
    for (const [index, query] of testQueries.entries()) {
      console.log(`   Query ${index + 1}: "${query}"`);
      
      // Simulate incoming message
      await whatsappAssistant.handleIncomingMessage({
        from: testPhoneNumber,
        messageId: `test_${Date.now()}_${index}`,
        text: query,
        timestamp: new Date()
      });
      
      // Wait between queries to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    console.log('✅ Knowledge base tests completed\\n');
    
    // Test 3: Community update
    console.log('📢 Test 3: Sending community update...');
    await whatsappAssistant.sendCommunityUpdate(
      "This is a test community update. The WhatsApp assistant is now active and ready to help residents with questions about documents, polls, maintenance, and general community information.",
      [testPhoneNumber]
    );
    console.log('✅ Community update sent\\n');
    
    // Test 4: Notification service integration
    console.log('🔔 Test 4: Testing notification services...');
    
    // Test document notification
    await whatsappNotificationService.sendDocumentNotification({
      title: "Test Document Upload",
      category: "COMITE_DE_SUIVI" as any,
      language: "ENGLISH" as any,
      uploadedBy: "Test Admin",
      fileSize: 1024 * 1024, // 1MB
      documentUrl: "https://costabeach.com/documents/test-123"
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test poll notification
    await whatsappNotificationService.sendPollNotification({
      title: "Test Community Poll",
      description: "This is a test poll to verify WhatsApp notifications are working correctly.",
      createdBy: "Test Admin",
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      pollUrl: "https://costabeach.com/polls/test-123"
    });
    
    console.log('✅ All notification tests completed\\n');
    
    console.log('🎉 All tests completed successfully!');
    console.log('\\n📱 Check your WhatsApp messages to see the results.');
    console.log('\\n💡 Try sending messages to the WhatsApp number to test the assistant responses.');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
    
    if (error.message.includes('credentials')) {
      console.log('\\n💡 Make sure your WhatsApp API credentials are configured in .env');
    }
    
    if (error.message.includes('phone number')) {
      console.log('\\n💡 Make sure the phone number is verified for WhatsApp Business API');
    }
  }
}

// Additional test functions
async function testSpecificFeature() {
  const feature = process.argv[3];
  const testPhoneNumber = process.argv[2] || '+15551234567';
  
  switch (feature) {
    case 'welcome':
      console.log('🎉 Testing welcome message...');
      await whatsappAssistant.sendWelcomeMessage(testPhoneNumber, 'Test User');
      break;
      
    case 'query':
      const query = process.argv[4] || 'What is Costa Beach?';
      console.log(`❓ Testing query: "${query}"`);
      await whatsappAssistant.handleIncomingMessage({
        from: testPhoneNumber,
        messageId: `test_${Date.now()}`,
        text: query,
        timestamp: new Date()
      });
      break;
      
    case 'emergency':
      console.log('🚨 Testing emergency alert...');
      await whatsappNotificationService.sendEmergencyAlert({
        title: "Test Emergency Alert",
        message: "This is a test of the emergency alert system. Please ignore this message.",
        severity: 'medium',
        alertType: 'other'
      });
      break;
      
    case 'update':
      const message = process.argv[4] || 'Test community update message';
      console.log(`📢 Testing community update: "${message}"`);
      await whatsappAssistant.sendCommunityUpdate(message, [testPhoneNumber]);
      break;
      
    default:
      console.log('❓ Unknown feature. Available features: welcome, query, emergency, update');
      return;
  }
  
  console.log('✅ Feature test completed');
}

// Main execution
async function main() {
  if (process.argv.length < 3) {
    console.log('📱 WhatsApp Assistant Test Suite\\n');
    console.log('Usage:');
    console.log('  npm run whatsapp:test-assistant <phone_number>           # Run all tests');
    console.log('  npm run whatsapp:test-assistant <phone_number> <feature> # Test specific feature\\n');
    console.log('Examples:');
    console.log('  npm run whatsapp:test-assistant +15551234567');
    console.log('  npm run whatsapp:test-assistant +15551234567 welcome');
    console.log('  npm run whatsapp:test-assistant +15551234567 query "How do I access documents?"');
    console.log('  npm run whatsapp:test-assistant +15551234567 emergency');
    console.log('  npm run whatsapp:test-assistant +15551234567 update "Test message"\\n');
    return;
  }
  
  if (process.argv[3]) {
    await testSpecificFeature();
  } else {
    await testWhatsAppAssistant();
  }
}

// Run the tests
main().catch(console.error);