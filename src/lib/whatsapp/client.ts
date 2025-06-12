import axios from 'axios';

// Direct API implementation using axios
// More reliable than package wrappers

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
  image?: {
    link: string;
    caption?: string;
  };
}

class WhatsAppClient {
  private phoneNumberId: string;
  private accessToken: string;
  private webhookSecret: string;
  private baseUrl: string;

  constructor() {
    // Load environment variables explicitly
    if (typeof process !== 'undefined' && process.env) {
      this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
      this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
      this.webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET || '';
    } else {
      throw new Error('Environment variables not available');
    }
    
    if (!this.phoneNumberId || !this.accessToken) {
      throw new Error('Missing required WhatsApp credentials in environment variables');
    }
    
    this.baseUrl = `https://graph.facebook.com/v18.0`;
    
    console.log('📱 WhatsApp client initialized with:');
    console.log(`   Phone Number ID: ${this.phoneNumberId}`);
    console.log(`   Access Token: ${this.accessToken.substring(0, 10)}...`);
  }

  async initialize(): Promise<void> {
    console.log('✅ WhatsApp Business API client initialized');
    // Test connection by getting phone number info
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );
      console.log(`📱 Connected to phone number: ${response.data.display_phone_number}`);
    } catch (error) {
      console.warn('⚠️ Could not verify phone number (check credentials)');
    }
  }

  async sendMessage(message: WhatsAppMessage): Promise<string> {
    try {
      let messageData: any;
      
      switch (message.type) {
        case 'text':
          messageData = {
            messaging_product: 'whatsapp',
            to: message.to,
            type: 'text',
            text: message.text
          };
          break;
        case 'template':
          messageData = {
            messaging_product: 'whatsapp',
            to: message.to,
            type: 'template',
            template: message.template
          };
          break;
        case 'document':
          messageData = {
            messaging_product: 'whatsapp',
            to: message.to,
            type: 'document',
            document: message.document
          };
          break;
        case 'image':
          messageData = {
            messaging_product: 'whatsapp',
            to: message.to,
            type: 'image',
            image: message.image
          };
          break;
        default:
          throw new Error(`Unsupported message type: ${message.type}`);
      }

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.messages[0].id;
    } catch (error: any) {
      console.error('WhatsApp message send failed:', error);
      throw new Error(`Failed to send WhatsApp message: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async sendTextMessage(to: string, text: string): Promise<string> {
    return this.sendMessage({
      to,
      type: 'text',
      text: { body: text }
    });
  }

  async sendTemplateMessage(
    to: string, 
    templateName: string, 
    languageCode: string = 'en',
    parameters: Array<{ type: string; text: string }> = []
  ): Promise<string> {
    const templateData: any = {
      name: templateName,
      language: { code: languageCode },
    };

    if (parameters.length > 0) {
      templateData.components = [{
        type: 'body',
        parameters,
      }];
    }

    return this.sendMessage({
      to,
      type: 'template',
      template: templateData
    });
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
      }
    });
  }

  async sendImageMessage(
    to: string, 
    imageUrl: string, 
    caption?: string
  ): Promise<string> {
    return this.sendMessage({
      to,
      type: 'image',
      image: {
        link: imageUrl,
        caption,
      }
    });
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
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

  // Connection status for API
  isConnectedToWhatsApp(): boolean {
    return !!this.accessToken && !!this.phoneNumberId;
  }

  // Broadcast message to multiple phone numbers
  async broadcastToNumbers(phoneNumbers: string[], text: string): Promise<string[]> {
    const results: string[] = [];
    
    for (const phoneNumber of phoneNumbers) {
      try {
        const messageId = await this.sendTextMessage(phoneNumber, text);
        results.push(`${phoneNumber}: ${messageId}`);
      } catch (error) {
        console.error(`Failed to send to ${phoneNumber}:`, error);
        results.push(`${phoneNumber}: FAILED`);
      }
    }

    return results;
  }

  // Get message templates
  async getMessageTemplates(): Promise<any[]> {
    try {
      // Note: This would use the Graph API directly
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`,
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
}

// Export factory function instead of instance
export function createWhatsAppClient(): WhatsAppClient {
  return new WhatsAppClient();
}

// Export singleton instance (lazy-loaded)
let _whatsappClientInstance: WhatsAppClient | null = null;
export function getWhatsAppClient(): WhatsAppClient {
  if (!_whatsappClientInstance) {
    _whatsappClientInstance = new WhatsAppClient();
  }
  return _whatsappClientInstance;
}