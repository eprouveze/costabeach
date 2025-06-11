#!/usr/bin/env tsx
/**
 * Quick WhatsApp Test - Minimal setup for immediate testing
 */

import { WhatsAppGroupsService } from '../src/lib/services/whatsappGroupsService';
import qrcode from 'qrcode-terminal';

async function quickTest() {
  console.log('🔄 Starting quick WhatsApp test...\n');
  
  const service = new WhatsAppGroupsService();
  const client = (service as any).client;

  // Set up QR code display
  client.on('qr', (qr: string) => {
    console.log('📱 Scan this QR code with WhatsApp:');
    qrcode.generate(qr, { small: true });
  });

  // When ready, test message formatting
  client.on('ready', async () => {
    console.log('✅ Connected to WhatsApp!\n');
    
    // Test message formatting
    console.log('🎨 Testing message formatting...\n');
    
    const docMessage = (service as any).formatDocumentMessage({
      title: 'Quick Test Document',
      category: 'test',
      language: 'french',
      url: 'https://example.com/test.pdf'
    }, 'french');
    
    console.log('📄 Sample document message:');
    console.log('---');
    console.log(docMessage);
    console.log('---\n');
    
    console.log('✅ Message formatting works!');
    console.log('💡 To send to groups, get group IDs first with npm run whatsapp:test');
    
    await service.destroy();
    process.exit(0);
  });

  try {
    await service.initializeClient();
  } catch (error) {
    console.error('❌ Failed to start:', error);
    process.exit(1);
  }
}

quickTest().catch(console.error);