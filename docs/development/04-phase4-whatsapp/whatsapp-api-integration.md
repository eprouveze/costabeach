# WhatsApp Business API Integration

## 🎯 Overview

Phase 4 introduces comprehensive WhatsApp Business API integration, enabling direct communication with property owners through WhatsApp. This includes automated digests, document notifications, and an AI-powered Q&A assistant accessible via WhatsApp.

## 📱 WhatsApp Integration Architecture

### Core Components

```typescript
// WhatsApp service client
whatsapp_contacts    # Phone number verification and management
whatsapp_messages    # Message history and templates
whatsapp_digest_logs # Automated digest delivery tracking
qa_conversations     # Q&A assistant conversations
```

### Environment Configuration

**Update**: `.env.local`
```bash
# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
WHATSAPP_WEBHOOK_SECRET=your_webhook_secret

# WhatsApp Template Management
WHATSAPP_TEMPLATE_NAMESPACE=your_template_namespace

# Rate Limiting
WHATSAPP_RATE_LIMIT_PER_MINUTE=80
WHATSAPP_RATE_LIMIT_PER_HOUR=1000
```

## 🔧 WhatsApp Service Implementation

### Core WhatsApp Client

**Create**: `src/lib/whatsapp/client.ts`
```typescript
import axios from 'axios';
import { createHash, createHmac } from 'crypto';

interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'document' | 'image';
  text?: { body: string };
  template?: {
    name: string;
    language: { code: string };
    components?: Array<{
      type: string;
      parameters: Array<{ type: string; text: string }>;
    }>;
  };
  document?: {
    link: string;
    caption?: string;
    filename?: string;
  };
}

class WhatsAppClient {
  private accessToken: string;
  private phoneNumberId: string;
  private businessAccountId: string;
  private baseUrl = 'https://graph.facebook.com/v17.0';

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!;
  }

  async sendMessage(message: WhatsAppMessage): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        message,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.messages[0].id;
    } catch (error) {
      console.error('WhatsApp message send failed:', error);
      throw new Error(`Failed to send WhatsApp message: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async sendTextMessage(to: string, text: string): Promise<string> {
    return this.sendMessage({
      to,
      type: 'text',
      text: { body: text },
    });
  }

  async sendTemplateMessage(
    to: string, 
    templateName: string, 
    languageCode: string = 'en',
    parameters: Array<{ type: string; text: string }> = []
  ): Promise<string> {
    const message: WhatsAppMessage = {
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
      },
    };

    if (parameters.length > 0) {
      message.template!.components = [{
        type: 'body',
        parameters,
      }];
    }

    return this.sendMessage(message);
  }

  async sendDocumentMessage(
    to: string, 
    documentUrl: string, 
    filename: string, 
    caption?: string
  ): Promise<string> {
    return this.sendMessage({
      to,
      type: 'document',
      document: {
        link: documentUrl,
        filename,
        caption,
      },
    });
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = createHmac('sha256', process.env.WHATSAPP_WEBHOOK_SECRET!)
      .update(payload)
      .digest('hex');
    
    return `sha256=${expectedSignature}` === signature;
  }

  // Parse incoming webhook
  parseWebhook(body: any): Array<{
    from: string;
    messageId: string;
    text?: string;
    type: string;
    timestamp: number;
  }> {
    const messages = [];
    
    if (body.entry) {
      for (const entry of body.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === 'messages' && change.value.messages) {
              for (const message of change.value.messages) {
                messages.push({
                  from: message.from,
                  messageId: message.id,
                  text: message.text?.body,
                  type: message.type,
                  timestamp: message.timestamp,
                });
              }
            }
          }
        }
      }
    }
    
    return messages;
  }

  // Get message templates
  async getMessageTemplates(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.businessAccountId}/message_templates`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch message templates:', error);
      return [];
    }
  }

  // Create message template
  async createMessageTemplate(template: {
    name: string;
    category: string;
    language: string;
    components: any[];
  }): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.businessAccountId}/message_templates`,
        template,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.id;
    } catch (error) {
      console.error('Failed to create message template:', error);
      throw error;
    }
  }
}

export const whatsappClient = new WhatsAppClient();
```

### Message Templates

**Create**: `src/lib/whatsapp/templates.ts`
```typescript
import { whatsappClient } from './client';

export const messageTemplates = {
  // Verification code template
  verification_code: {
    name: 'verification_code',
    getMessage: (code: string, language: string = 'en') => {
      const messages = {
        en: `Your Costabeach verification code is: ${code}. This code will expire in 10 minutes.`,
        fr: `Votre code de vérification Costabeach est: ${code}. Ce code expire dans 10 minutes.`,
        ar: `رمز التحقق الخاص بك في كوستا بيتش هو: ${code}. ينتهي صلاحية هذا الرمز خلال 10 دقائق.`,
      };
      return messages[language] || messages.en;
    },
  },

  // Weekly digest template
  weekly_digest: {
    name: 'weekly_digest',
    getMessage: (data: {
      newDocuments: number;
      newPolls: number;
      weekRange: string;
    }, language: string = 'en') => {
      const messages = {
        en: `📋 Weekly Costabeach Update (${data.weekRange})\n\n📄 ${data.newDocuments} new documents\n🗳️ ${data.newPolls} new polls\n\nView details: {{dashboard_link}}`,
        fr: `📋 Mise à jour hebdomadaire Costabeach (${data.weekRange})\n\n📄 ${data.newDocuments} nouveaux documents\n🗳️ ${data.newPolls} nouveaux sondages\n\nVoir les détails: {{dashboard_link}}`,
        ar: `📋 تحديث كوستا بيتش الأسبوعي (${data.weekRange})\n\n📄 ${data.newDocuments} وثائق جديدة\n🗳️ ${data.newPolls} استطلاعات جديدة\n\nعرض التفاصيل: {{dashboard_link}}`,
      };
      return messages[language] || messages.en;
    },
  },

  // Document notification template
  document_notification: {
    name: 'document_notification',
    getMessage: (data: {
      documentTitle: string;
      category: string;
    }, language: string = 'en') => {
      const messages = {
        en: `📄 New document available: "${data.documentTitle}"\nCategory: ${data.category}\n\nView document: {{document_link}}`,
        fr: `📄 Nouveau document disponible: "${data.documentTitle}"\nCatégorie: ${data.category}\n\nVoir le document: {{document_link}}`,
        ar: `📄 وثيقة جديدة متاحة: "${data.documentTitle}"\nالفئة: ${data.category}\n\nعرض الوثيقة: {{document_link}}`,
      };
      return messages[language] || messages.en;
    },
  },

  // Poll notification template
  poll_notification: {
    name: 'poll_notification',
    getMessage: (data: {
      question: string;
      endDate?: string;
    }, language: string = 'en') => {
      const endDateText = data.endDate 
        ? (language === 'ar' ? `ينتهي في: ${data.endDate}` : 
           language === 'fr' ? `Se termine le: ${data.endDate}` : 
           `Ends: ${data.endDate}`)
        : '';
      
      const messages = {
        en: `🗳️ New poll: "${data.question}"\n${endDateText}\n\nVote now: {{poll_link}}`,
        fr: `🗳️ Nouveau sondage: "${data.question}"\n${endDateText}\n\nVotez maintenant: {{poll_link}}`,
        ar: `🗳️ استطلاع جديد: "${data.question}"\n${endDateText}\n\nصوت الآن: {{poll_link}}`,
      };
      return messages[language] || messages.en;
    },
  },

  // Q&A assistant welcome
  qa_welcome: {
    name: 'qa_welcome',
    getMessage: (language: string = 'en') => {
      const messages = {
        en: `🤖 Welcome to Costabeach Assistant!\n\nI can help you find information about:\n• HOA documents\n• Building regulations\n• Community announcements\n• Meeting minutes\n\nJust ask me any question!`,
        fr: `🤖 Bienvenue dans l'Assistant Costabeach!\n\nJe peux vous aider à trouver des informations sur:\n• Documents de copropriété\n• Règlements du bâtiment\n• Annonces communautaires\n• Procès-verbaux de réunions\n\nPosez-moi simplement une question!`,
        ar: `🤖 مرحباً بك في مساعد كوستا بيتش!\n\nيمكنني مساعدتك في العثور على معلومات حول:\n• وثائق اتحاد الملاك\n• لوائح البناء\n• إعلانات المجتمع\n• محاضر الاجتماعات\n\nفقط اسألني أي سؤال!`,
      };
      return messages[language] || messages.en;
    },
  },
};

// Template management functions
export async function ensureTemplatesExist() {
  try {
    const existingTemplates = await whatsappClient.getMessageTemplates();
    const existingNames = existingTemplates.map(t => t.name);
    
    for (const [templateKey, template] of Object.entries(messageTemplates)) {
      if (!existingNames.includes(template.name)) {
        console.log(`Creating WhatsApp template: ${template.name}`);
        
        // Create template for each language
        const languages = ['en', 'fr', 'ar'];
        for (const lang of languages) {
          await whatsappClient.createMessageTemplate({
            name: `${template.name}_${lang}`,
            category: 'UTILITY',
            language: lang,
            components: [
              {
                type: 'BODY',
                text: template.getMessage({}, lang),
              },
            ],
          });
        }
      }
    }
  } catch (error) {
    console.error('Failed to ensure WhatsApp templates exist:', error);
  }
}
```

## 🔄 WhatsApp Webhook Handler

### Webhook API Route

**Create**: `app/api/whatsapp/webhook/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { whatsappClient } from '@/lib/whatsapp/client';
import { createSupabaseClient } from '@/lib/supabase';
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
```

## 🤖 Q&A Assistant Integration

### Q&A Processing Job

**Create**: `src/lib/inngest/whatsapp-qa-job.ts`
```typescript
import { inngest } from './client';
import { createSupabaseClient } from '@/lib/supabase';
import { whatsappClient } from '@/lib/whatsapp/client';
import { openai } from '@/lib/ai-clients';

export const processWhatsAppQAJob = inngest.createFunction(
  { id: 'whatsapp.process-qa' },
  { event: 'whatsapp.process-qa' },
  async ({ event, step }) => {
    const { contactId, userId, question, messageId, language } = event.data;
    const supabase = createSupabaseClient();

    // Step 1: Get or create conversation
    const conversation = await step.run('get-conversation', async () => {
      // Check for recent conversation (within last hour)
      const { data: recentConversation } = await supabase
        .from('qa_conversations')
        .select('id')
        .eq('whatsapp_contact_id', contactId)
        .gte('last_activity', new Date(Date.now() - 3600000).toISOString())
        .single();

      if (recentConversation) {
        // Update last activity
        await supabase
          .from('qa_conversations')
          .update({ last_activity: new Date().toISOString() })
          .eq('id', recentConversation.id);
        
        return recentConversation;
      }

      // Create new conversation
      const { data: newConversation } = await supabase
        .from('qa_conversations')
        .insert({
          user_id: userId,
          whatsapp_contact_id: contactId,
          session_id: `whatsapp_${Date.now()}`,
          language,
        })
        .select()
        .single();

      return newConversation;
    });

    // Step 2: Generate answer using AI
    const answer = await step.run('generate-answer', async () => {
      try {
        // Get recent conversation history
        const { data: recentInteractions } = await supabase
          .from('qa_interactions')
          .select('question, answer')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(3);

        // Search for relevant documents
        const questionEmbedding = await generateEmbedding(question);
        
        const { data: relevantChunks } = await supabase.rpc(
          'match_documents',
          {
            query_embedding: questionEmbedding,
            match_threshold: 0.7,
            match_count: 5,
          }
        );

        // Filter by user permissions
        const accessibleDocuments = await filterDocumentsByPermissions(
          relevantChunks?.map(chunk => chunk.document_id) || [],
          userId
        );

        const contextChunks = relevantChunks?.filter(chunk =>
          accessibleDocuments.includes(chunk.document_id)
        ) || [];

        // Generate answer
        const response = await generateWhatsAppAnswer({
          question,
          context: contextChunks,
          language,
          conversationHistory: recentInteractions || [],
        });

        return response;
      } catch (error) {
        console.error('Q&A generation failed:', error);
        return {
          answer: getDefaultErrorMessage(language),
          sources: [],
          confidence: 0.1,
        };
      }
    });

    // Step 3: Save interaction
    await step.run('save-interaction', async () => {
      await supabase
        .from('qa_interactions')
        .insert({
          conversation_id: conversation.id,
          question,
          answer: answer.answer,
          sources_used: answer.sources,
          confidence_score: answer.confidence,
          response_time_ms: Date.now() - event.timestamp,
        });
    });

    // Step 4: Send answer via WhatsApp
    await step.run('send-answer', async () => {
      const { data: contact } = await supabase
        .from('whatsapp_contacts')
        .select('phone_number')
        .eq('id', contactId)
        .single();

      if (contact) {
        const messageId = await whatsappClient.sendTextMessage(
          contact.phone_number,
          answer.answer
        );

        // Log outbound message
        await supabase
          .from('whatsapp_messages')
          .insert({
            contact_id: contactId,
            direction: 'outbound',
            message_type: 'text',
            content: answer.answer,
            whatsapp_id: messageId,
            status: 'sent',
            sent_at: new Date().toISOString(),
          });
      }
    });

    return {
      success: true,
      conversationId: conversation.id,
      confidence: answer.confidence,
    };
  }
);

async function generateWhatsAppAnswer({
  question,
  context,
  language,
  conversationHistory,
}: {
  question: string;
  context: any[];
  language: string;
  conversationHistory: any[];
}): Promise<{
  answer: string;
  sources: string[];
  confidence: number;
}> {
  const languageNames = {
    en: 'English',
    fr: 'French',
    ar: 'Arabic',
  };

  const contextText = context
    .map(chunk => `Document: ${chunk.document_title}\n${chunk.content}`)
    .join('\n\n');

  const conversationContext = conversationHistory
    .map(interaction => `Q: ${interaction.question}\nA: ${interaction.answer}`)
    .join('\n\n');

  const prompt = `You are a helpful assistant for Costabeach, a residential community in Morocco. Answer questions about HOA documents, regulations, and community information.

Context from documents:
${contextText}

Previous conversation:
${conversationContext}

Current question: ${question}

Instructions:
1. Answer in ${languageNames[language]} only
2. Be concise but helpful (max 160 characters for WhatsApp)
3. If you don't have enough information, say so politely
4. Include relevant document references when applicable
5. Be friendly and professional

Answer:`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
    temperature: 0.3,
  });

  const answer = response.choices[0].message.content || getDefaultErrorMessage(language);
  const sources = context.map(chunk => chunk.document_id);
  const confidence = context.length > 0 ? 0.8 : 0.3;

  return { answer, sources, confidence };
}

function getDefaultErrorMessage(language: string): string {
  const messages = {
    en: "I'm sorry, I don't have enough information to answer that question. Please contact the HOA office for assistance.",
    fr: "Je suis désolé, je n'ai pas assez d'informations pour répondre à cette question. Veuillez contacter le bureau de la copropriété pour obtenir de l'aide.",
    ar: "أعتذر، ليس لدي معلومات كافية للإجابة على هذا السؤال. يرجى الاتصال بمكتب اتحاد الملاك للحصول على المساعدة.",
  };
  return messages[language] || messages.en;
}
```

## 📊 WhatsApp Analytics and Management

### Admin WhatsApp Dashboard

**Create**: `src/components/admin/WhatsAppDashboard.tsx`
```typescript
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Badge } from './Badge';
import { MessageSquare, Users, TrendingUp, Clock } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export const WhatsAppDashboard: React.FC = () => {
  const { data: analytics } = trpc.whatsapp.getAnalytics.useQuery({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      to: new Date(),
    },
  });

  const { data: recentMessages } = trpc.whatsapp.getRecentMessages.useQuery({
    limit: 10,
  });

  if (!analytics) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contacts</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeContacts}</div>
            <p className="text-xs text-gray-600">
              {analytics.optInRate}% opt-in rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.messagesSent}</div>
            <p className="text-xs text-gray-600">
              {analytics.deliveryRate}% delivery rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Q&A Sessions</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.qaInteractions}</div>
            <p className="text-xs text-gray-600">
              {analytics.avgResponseTime}s avg response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.engagementRate}%</div>
            <p className="text-xs text-gray-600">
              Message read rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Recent WhatsApp Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMessages?.map((message) => (
              <div key={message.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant={message.direction === 'inbound' ? 'secondary' : 'default'}>
                      {message.direction}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {message.contact?.user?.name || message.contact?.phone_number}
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-gray-700">{message.content}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(message.sent_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

## 🎯 Success Criteria

### Integration Requirements ✅
- [ ] WhatsApp Business API successfully connected and verified
- [ ] Message templates created and approved
- [ ] Webhook endpoint handling incoming messages
- [ ] Phone number verification and opt-in flow
- [ ] Message delivery and read receipt tracking

### Q&A Assistant Requirements ✅
- [ ] Real-time message processing and response
- [ ] AI-powered document search and answer generation
- [ ] Multilingual support (FR/AR/EN)
- [ ] Conversation context and history management
- [ ] Response time <10 seconds for typical queries

### Notification System Requirements ✅
- [ ] Automated weekly/daily digest delivery
- [ ] Document upload notifications
- [ ] Poll creation and reminder notifications
- [ ] Emergency announcement broadcasting
- [ ] Delivery status tracking and analytics

### Performance Requirements ✅
- [ ] Message delivery: <5 seconds
- [ ] Q&A response: <10 seconds
- [ ] Webhook processing: <1 second
- [ ] Concurrent message handling: 50+ messages/minute
- [ ] 99% uptime for critical notifications

### Compliance Requirements ✅
- [ ] GDPR-compliant opt-in/opt-out mechanisms
- [ ] Message content logging and audit trails
- [ ] Rate limiting compliance with WhatsApp policies
- [ ] User data protection and privacy controls
- [ ] Emergency communication capabilities

---

This WhatsApp Business API integration provides a comprehensive communication channel that enhances community engagement while maintaining privacy, compliance, and excellent user experience across all supported languages.