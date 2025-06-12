import { NextRequest, NextResponse } from 'next/server';
import { whatsappClient } from '@/lib/whatsapp/client';
import { createSupabaseClient } from '@/lib/supabase/server';
import { inngest } from '@/lib/inngest';

// GET: Webhook verification
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified');
    return new NextResponse(challenge);
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// POST: Handle incoming messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    
    if (!signature || !whatsappClient.verifyWebhookSignature(body, signature)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const webhookData = JSON.parse(body);
    const messages = whatsappClient.parseWebhook(webhookData);

    for (const message of messages) {
      // Process each incoming message
      await processIncomingMessage(message);
    }

    return new NextResponse('OK');
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function processIncomingMessage(message: {
  from: string;
  messageId: string;
  text?: string;
  type: string;
  timestamp: number;
}) {
  const supabase = createSupabaseClient();

  try {
    // Find user by phone number
    const { data: contact } = await supabase
      .from('whatsapp_contacts')
      .select(`
        id, user_id, phone_number, status,
        user:user_id(id, name, language)
      `)
      .eq('phone_number', message.from)
      .eq('status', 'opted_in')
      .single();

    if (!contact) {
      // Send welcome message for unknown contacts
      await whatsappClient.sendTextMessage(
        message.from,
        "Welcome to Costabeach! To access our services, please register at https://costabeach.com/owner-register"
      );
      return;
    }

    // Log incoming message
    await supabase
      .from('whatsapp_messages')
      .insert({
        contact_id: contact.id,
        direction: 'inbound',
        message_type: message.type,
        content: message.text || '',
        whatsapp_id: message.messageId,
        status: 'received',
        sent_at: new Date(message.timestamp * 1000).toISOString(),
      });

    // Process text messages for Q&A
    if (message.type === 'text' && message.text) {
      await inngest.send({
        name: 'whatsapp.process-qa',
        data: {
          contactId: contact.id,
          userId: contact.user_id,
          question: message.text,
          messageId: message.messageId,
          language: contact.user.language || 'en',
        },
      });
    }
  } catch (error) {
    console.error('Error processing incoming message:', error);
    
    // Send error message to user
    await whatsappClient.sendTextMessage(
      message.from,
      "Sorry, I'm experiencing technical difficulties. Please try again later."
    );
  }
}