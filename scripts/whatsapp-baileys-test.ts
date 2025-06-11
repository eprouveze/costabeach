#!/usr/bin/env tsx
/**
 * WhatsApp Test using Baileys library
 * More stable alternative to whatsapp-web.js
 */

import { 
  default as makeWASocket, 
  DisconnectReason, 
  useMultiFileAuthState 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import path from 'path';

async function testWhatsAppConnection() {
  console.log('🔄 Starting WhatsApp connection test...\n');
  
  // Use auth state from local directory
  const authDir = path.join(process.cwd(), '.wwebjs_auth', 'baileys');
  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // We'll handle QR display
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log('📱 Scan this QR code with WhatsApp:\n');
      qrcode.generate(qr, { small: true });
      console.log('\nSteps:');
      console.log('1. Open WhatsApp on your phone');
      console.log('2. Go to Settings > Linked Devices');
      console.log('3. Tap "Link a Device"');
      console.log('4. Scan the QR code above\n');
    }
    
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('❌ Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
      
      if (shouldReconnect) {
        console.log('🔄 Attempting to reconnect...');
        setTimeout(() => testWhatsAppConnection(), 3000);
      } else {
        console.log('🛑 Logged out. Please restart the script.');
        process.exit(1);
      }
    } else if (connection === 'open') {
      console.log('✅ Connected to WhatsApp successfully!\n');
      testFeatures(sock);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n⚠️ Shutting down...');
    sock.end(undefined);
    process.exit(0);
  });
}

async function testFeatures(sock: any) {
  try {
    console.log('🧪 Testing WhatsApp features...\n');
    
    // Get user info
    const userInfo = sock.user;
    console.log(`👤 Connected as: ${userInfo?.name || userInfo?.id || 'Unknown'}`);
    
    // Test message formatting
    testMessageFormatting();
    
    // List chats to find groups
    console.log('\n🔍 Looking for groups...');
    
    // Note: In a real implementation, you would:
    // 1. Get chats: await sock.groupFetchAllParticipating()
    // 2. Filter for groups with "Costa Beach" in the name
    // 3. Send test messages to those groups
    
    console.log('✅ Connection test successful!');
    console.log('\n💡 Next steps:');
    console.log('1. Create a test group with "Costa Beach Test" in the name');
    console.log('2. Add the connected WhatsApp number to the group');
    console.log('3. The system can then send notifications to the group');
    
    console.log('\n📝 To send a test message, run the full integration test');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

function testMessageFormatting() {
  console.log('\n🎨 Testing message formatting...\n');
  
  // Test document notification
  const docMessage = formatDocumentMessage({
    title: 'Monthly Meeting Minutes - November 2024',
    category: 'meeting_minutes',
    language: 'french',
    url: 'https://costabeach.com/documents/meeting-nov-2024.pdf'
  }, 'french');
  
  console.log('📄 Document notification (French):');
  console.log('---');
  console.log(docMessage);
  console.log('---\n');
  
  // Test poll notification
  const pollMessage = formatPollMessage({
    question: 'Should we extend pool hours during summer?',
    endDate: '2024-07-31',
    language: 'french',
    pollUrl: 'https://costabeach.com/polls/summer-hours'
  }, 'french');
  
  console.log('🗳️ Poll notification (French):');
  console.log('---');
  console.log(pollMessage);
  console.log('---\n');
  
  // Test Arabic
  const arabicMessage = formatDocumentMessage({
    title: 'قوانين المسبح الجديدة',
    category: 'general',
    language: 'arabic',
    url: 'https://costabeach.com/documents/pool-rules-ar.pdf'
  }, 'arabic');
  
  console.log('📄 Document notification (Arabic):');
  console.log('---');
  console.log(arabicMessage);
  console.log('---\n');
  
  // Test emergency
  const emergencyMessage = formatEmergencyMessage(
    'Water outage in Building A. Expected restoration: 6 PM today.',
    'french'
  );
  
  console.log('🚨 Emergency notification:');
  console.log('---');
  console.log(emergencyMessage);
  console.log('---\n');
}

// Message formatting functions (copied from service)
function formatDocumentMessage(doc: any, language: string): string {
  const messages = {
    french: `📄 *Nouveau document disponible*\n\n*${doc.title}*\nCatégorie: ${doc.category}\n\n🔗 Accéder au document: ${doc.url}\n\n_Costa Beach HOA_`,
    arabic: `📄 *وثيقة جديدة متاحة*\n\n*${doc.title}*\nالفئة: ${doc.category}\n\n🔗 الوصول إلى الوثيقة: ${doc.url}\n\n_اتحاد ملاك كوستا بيتش_`,
    english: `📄 *New document available*\n\n*${doc.title}*\nCategory: ${doc.category}\n\n🔗 Access document: ${doc.url}\n\n_Costa Beach HOA_`,
  };
  return messages[language as keyof typeof messages] || messages.french;
}

function formatPollMessage(poll: any, language: string): string {
  const endDateText = poll.endDate ? 
    (language === 'arabic' ? `\nينتهي في: ${poll.endDate}` :
     language === 'french' ? `\nSe termine le: ${poll.endDate}` :
     `\nEnds: ${poll.endDate}`) : '';

  const messages = {
    french: `🗳️ *Nouveau sondage*\n\n*${poll.question}*${endDateText}\n\n🔗 Participez: ${poll.pollUrl || 'Voir le tableau de bord'}\n\n_Costa Beach HOA_`,
    arabic: `🗳️ *استطلاع جديد*\n\n*${poll.question}*${endDateText}\n\n🔗 شارك: ${poll.pollUrl || 'انظر لوحة القيادة'}\n\n_اتحاد ملاك كوستا بيتش_`,
    english: `🗳️ *New poll*\n\n*${poll.question}*${endDateText}\n\n🔗 Vote now: ${poll.pollUrl || 'See dashboard'}\n\n_Costa Beach HOA_`,
  };
  return messages[language as keyof typeof messages] || messages.french;
}

function formatEmergencyMessage(message: string, language: string): string {
  const prefixes = {
    french: '🚨 *URGENT - Costa Beach*\n\n',
    arabic: '🚨 *عاجل - كوستا بيتش*\n\n',
    english: '🚨 *URGENT - Costa Beach*\n\n',
  };
  return (prefixes[language as keyof typeof prefixes] || prefixes.french) + message;
}

// Start the test
testWhatsAppConnection().catch(console.error);