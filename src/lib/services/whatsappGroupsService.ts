import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';

export interface WhatsAppGroup {
  id?: string;
  name: string;
  whatsapp_group_id: string;
  category: 'documents' | 'polls' | 'emergency' | 'general';
  description?: string;
  language: 'french' | 'arabic';
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface MessageResult {
  success: boolean;
  messageId?: string;
  groupId?: string;
  sentAt?: Date;
  error?: string;
}

export class WhatsAppGroupsService {
  private client: Client;
  private clientReady: boolean = false;

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'costabeach-whatsapp'
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      },
    });
  }

  async initializeClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.on('ready', () => {
        this.clientReady = true;
        resolve();
      });

      this.client.on('auth_failure', (message) => {
        reject(new Error(`Authentication failed: ${message}`));
      });

      this.client.on('disconnected', (reason) => {
        this.clientReady = false;
        console.log('Client disconnected:', reason);
      });

      this.client.initialize().catch(reject);
    });
  }

  async sendGroupMessage(groupId: string, message: string): Promise<MessageResult> {
    try {
      if (!this.clientReady) {
        throw new Error('WhatsApp client is not ready');
      }

      const response = await this.client.sendMessage(groupId, message);
      
      return {
        success: true,
        messageId: response.id._serialized,
        groupId,
        sentAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async destroy(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.clientReady = false;
    }
  }
}