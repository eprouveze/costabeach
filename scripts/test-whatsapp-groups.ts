#!/usr/bin/env tsx
/**
 * WhatsApp Groups Local Testing Script
 * 
 * This script helps you:
 * 1. Initialize WhatsApp client locally
 * 2. Get group IDs from your test groups
 * 3. Test messaging functionality
 * 4. Validate multilingual support
 */

import { WhatsAppGroupsService } from '../src/lib/services/whatsappGroupsService';
import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

interface TestGroup {
  name: string;
  id?: string;
  category: 'documents' | 'polls' | 'emergency' | 'general';
}

class WhatsAppTester {
  private service: WhatsAppGroupsService;
  private client: Client;
  private testGroups: TestGroup[] = [
    { name: 'Costa Beach Test - Documents', category: 'documents' },
    { name: 'Costa Beach Test - Polls', category: 'polls' },
    { name: 'Costa Beach Test - Emergency', category: 'emergency' },
    { name: 'Costa Beach Test - General', category: 'general' },
  ];

  constructor() {
    this.service = new WhatsAppGroupsService();
    this.client = (this.service as any).client;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('qr', (qr) => {
      console.log('\n🔗 WhatsApp QR Code:');
      console.log('📱 Scan this QR code with your WhatsApp mobile app\n');
      qrcode.generate(qr, { small: true });
      console.log('\nSteps:');
      console.log('1. Open WhatsApp on your phone');
      console.log('2. Go to Settings > Linked Devices');
      console.log('3. Tap "Link a Device"');
      console.log('4. Scan the QR code above');
    });

    this.client.on('ready', () => {
      console.log('\n✅ WhatsApp client is ready!');
      console.log('🚀 Starting test sequence...\n');
      this.runTests();
    });

    this.client.on('auth_failure', (msg) => {
      console.error('❌ WhatsApp authentication failed:', msg);
    });

    this.client.on('disconnected', (reason) => {
      console.log('⚠️ WhatsApp client disconnected:', reason);
    });
  }

  async start(): Promise<void> {
    console.log('🔄 Initializing WhatsApp client...');
    console.log('📦 This may take a moment on first run\n');
    
    try {
      await this.service.initializeClient();
    } catch (error) {
      console.error('❌ Failed to initialize:', error);
      process.exit(1);
    }
  }

  private async runTests(): Promise<void> {
    try {
      console.log('📋 Running WhatsApp Groups Test Suite\n');

      // Test 1: Discover existing groups
      await this.discoverGroups();

      // Test 2: Test message formatting
      await this.testMessageFormatting();

      // Test 3: Test sending (if groups are available)
      await this.testGroupMessaging();

      console.log('\n✅ All tests completed!');
      console.log('📝 Next steps:');
      console.log('  1. Create test groups if not found');
      console.log('  2. Update group IDs in the service');
      console.log('  3. Test document/poll notifications');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Test failed:', error);
      process.exit(1);
    }
  }

  private async discoverGroups(): Promise<void> {
    console.log('🔍 Discovering WhatsApp groups...');
    
    try {
      const chats = await this.client.getChats();
      const groups = chats.filter(chat => chat.isGroup);

      console.log(`📱 Found ${groups.length} groups:`);
      
      groups.forEach((group, index) => {
        console.log(`  ${index + 1}. ${group.name}`);
        console.log(`     ID: ${group.id._serialized}`);
        console.log(`     Participants: ${(group as any).participants?.length || 'N/A'}`);
        console.log('');

        // Check if this matches our test groups
        const testGroup = this.testGroups.find(tg => 
          group.name.toLowerCase().includes(tg.category) ||
          group.name.toLowerCase().includes('costa beach')
        );

        if (testGroup && !testGroup.id) {
          testGroup.id = group.id._serialized;
          console.log(`✅ Mapped "${group.name}" to ${testGroup.category} category`);
        }
      });

      if (groups.length === 0) {
        console.log('⚠️ No groups found. You need to:');
        console.log('  1. Create test groups in WhatsApp');
        console.log('  2. Add the connected phone number to the groups');
        console.log('  3. Run this script again');
      }
    } catch (error) {
      console.error('❌ Failed to discover groups:', error);
    }
  }

  private async testMessageFormatting(): Promise<void> {
    console.log('🎨 Testing message formatting...');

    // Test document notification
    const docMessage = (this.service as any).formatDocumentMessage({
      title: 'Test Document - Pool Rules',
      category: 'general',
      language: 'french',
      url: 'https://costabeach.com/documents/pool-rules.pdf'
    }, 'french');

    console.log('📄 Document notification (French):');
    console.log('---');
    console.log(docMessage);
    console.log('---\n');

    // Test poll notification
    const pollMessage = (this.service as any).formatPollMessage({
      question: 'Should we extend pool hours during summer?',
      endDate: '2024-07-31',
      language: 'french',
      pollUrl: 'https://costabeach.com/polls/summer-hours'
    }, 'french');

    console.log('🗳️ Poll notification (French):');
    console.log('---');
    console.log(pollMessage);
    console.log('---\n');

    // Test Arabic message
    const arabicMessage = (this.service as any).formatDocumentMessage({
      title: 'قوانين المسبح الجديدة',
      category: 'general',
      language: 'arabic',
      url: 'https://costabeach.com/documents/pool-rules-ar.pdf'
    }, 'arabic');

    console.log('📄 Document notification (Arabic):');
    console.log('---');
    console.log(arabicMessage);
    console.log('---\n');

    // Test emergency message
    const emergencyMessage = (this.service as any).formatEmergencyMessage(
      'Water outage in Building A. Expected restoration: 6 PM today.',
      'french'
    );

    console.log('🚨 Emergency notification:');
    console.log('---');
    console.log(emergencyMessage);
    console.log('---\n');
  }

  private async testGroupMessaging(): Promise<void> {
    console.log('💬 Testing group messaging...');

    const testGroup = this.testGroups.find(group => group.id);
    
    if (!testGroup?.id) {
      console.log('⚠️ No test groups available for messaging test');
      console.log('💡 Create a test group and add the connected number to test messaging');
      return;
    }

    console.log(`📤 Sending test message to: ${testGroup.name}`);
    
    const testMessage = `🧪 *Test Message from Costa Beach HOA System*\n\n` +
      `✅ WhatsApp integration is working!\n` +
      `📅 Sent: ${new Date().toLocaleString()}\n` +
      `🔧 Environment: Local Development\n\n` +
      `_This is an automated test message_`;

    try {
      const result = await this.service.sendGroupMessage(testGroup.id, testMessage);
      
      if (result.success) {
        console.log('✅ Test message sent successfully!');
        console.log(`📬 Message ID: ${result.messageId}`);
      } else {
        console.log('❌ Failed to send test message:', result.error);
      }
    } catch (error) {
      console.log('❌ Error sending test message:', error);
    }
  }

  async stop(): Promise<void> {
    console.log('\n🛑 Stopping WhatsApp client...');
    await this.service.destroy();
  }
}

// Main execution
async function main() {
  const tester = new WhatsAppTester();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n⚠️ Received interrupt signal...');
    await tester.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n⚠️ Received terminate signal...');
    await tester.stop();
    process.exit(0);
  });

  try {
    await tester.start();
  } catch (error) {
    console.error('❌ Failed to start WhatsApp tester:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { WhatsAppTester };