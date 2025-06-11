import { WhatsAppGroupsService } from '../whatsappGroupsService';

// Mock whatsapp-web.js
jest.mock('whatsapp-web.js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    sendMessage: jest.fn().mockResolvedValue({ id: 'mock-message-id' }),
    on: jest.fn(),
    destroy: jest.fn().mockResolvedValue(undefined),
  })),
  LocalAuth: jest.fn(),
}));

// Mock database
jest.mock('@/lib/db', () => ({
  db: {
    whatsAppGroup: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    whatsAppGroupMessage: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('WhatsAppGroupsService', () => {
  let service: WhatsAppGroupsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WhatsAppGroupsService();
  });

  describe('Client Management', () => {
    it('should initialize WhatsApp client', async () => {
      const result = await service.initializeClient();
      expect(result).toBe(true);
    });

    it('should check if client is ready', () => {
      // Initially not ready
      expect(service.isClientReady()).toBe(false);
      
      // Set as ready (accessing private property for testing)
      (service as any).clientReady = true;
      expect(service.isClientReady()).toBe(true);
    });

    it('should destroy client properly', async () => {
      await service.destroy();
      const mockClient = (service as any).client;
      expect(mockClient.destroy).toHaveBeenCalled();
    });
  });

  describe('Message Sending', () => {
    beforeEach(() => {
      // Set client as ready
      (service as any).clientReady = true;
    });

    it('should send text message to group', async () => {
      const groupId = '120363025246125016@g.us';
      const message = 'New document uploaded: Building Regulations 2024';

      const result = await service.sendGroupMessage(groupId, message);

      expect(result).toEqual({
        success: true,
        messageId: 'mock-message-id',
        groupId,
        sentAt: expect.any(Date),
      });
    });

    it('should handle client not ready error', async () => {
      // Set client as not ready
      (service as any).clientReady = false;
      
      const result = await service.sendGroupMessage('test-group', 'test message');

      expect(result).toEqual({
        success: false,
        error: 'WhatsApp client is not ready',
      });
    });
  });

  describe('Message Formatting', () => {
    it('should format document notification message in French', () => {
      const docData = {
        title: 'Pool Maintenance Schedule',
        category: 'documents',
        language: 'french',
        url: 'https://example.com/document.pdf',
      };

      // Access private method for testing
      const message = (service as any).formatDocumentMessage(docData, 'french');

      expect(message).toContain('📄 *Nouveau document disponible*');
      expect(message).toContain('*Pool Maintenance Schedule*');
      expect(message).toContain('documents');
      expect(message).toContain('https://example.com/document.pdf');
      expect(message).toContain('_Costa Beach HOA_');
    });

    it('should format document notification message in Arabic', () => {
      const docData = {
        title: 'Pool Maintenance Schedule',
        category: 'documents',
        language: 'arabic',
        url: 'https://example.com/document.pdf',
      };

      // Access private method for testing
      const message = (service as any).formatDocumentMessage(docData, 'arabic');

      expect(message).toContain('📄 *وثيقة جديدة متاحة*');
      expect(message).toContain('*Pool Maintenance Schedule*');
      expect(message).toContain('_اتحاد ملاك كوستا بيتش_');
    });

    it('should format poll notification message', () => {
      const pollData = {
        question: 'Should we install new playground equipment?',
        endDate: '2024-12-31',
        language: 'french',
      };

      // Access private method for testing
      const message = (service as any).formatPollMessage(pollData, 'french');

      expect(message).toContain('🗳️ *Nouveau sondage*');
      expect(message).toContain('*Should we install new playground equipment?*');
      expect(message).toContain('Se termine le: 2024-12-31');
      expect(message).toContain('_Costa Beach HOA_');
    });

    it('should format emergency message', () => {
      const emergencyText = 'Water main break in Building A. Please avoid the area.';
      
      // Access private method for testing
      const message = (service as any).formatEmergencyMessage(emergencyText, 'french');

      expect(message).toContain('🚨 *URGENT - Costa Beach*');
      expect(message).toContain('Water main break in Building A. Please avoid the area.');
    });
  });
});