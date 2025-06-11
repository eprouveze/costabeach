import { WhatsAppGroupsService } from '../whatsappGroupsService';
import { db } from '@/lib/db';

// Mock dependencies
jest.mock('@/lib/db');
jest.mock('whatsapp-web.js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    sendMessage: jest.fn().mockResolvedValue({ id: 'mock-message-id' }),
    getChats: jest.fn().mockResolvedValue([]),
    getChatById: jest.fn().mockResolvedValue({ name: 'Test Group' }),
    on: jest.fn(),
    destroy: jest.fn().mockResolvedValue(undefined),
  })),
  LocalAuth: jest.fn(),
  MessageMedia: {
    fromUrl: jest.fn().mockResolvedValue({ mimetype: 'application/pdf' }),
  },
}));

const mockDb = {
  whatsAppGroup: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  whatsAppGroupMessage: {
    create: jest.fn(),
    findMany: jest.fn(),
    aggregate: jest.fn(),
  },
};

(db as jest.Mocked<typeof db>) = mockDb as any;

describe('WhatsAppGroupsService', () => {
  let service: WhatsAppGroupsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WhatsAppGroupsService();
  });

  describe('Group Management', () => {
    it('should create a new WhatsApp group configuration', async () => {
      const groupData = {
        name: 'Costa Beach - Documents 📄',
        whatsapp_group_id: '120363025246125016@g.us',
        category: 'documents' as const,
        description: 'Document notifications and updates',
        language: 'french' as const,
        is_active: true,
      };

      const mockResult = { id: 'group-123', ...groupData };
      mockDb.whatsAppGroup.create.mockResolvedValueOnce(mockResult);

      const result = await service.createGroup(groupData);

      expect(mockDb.whatsAppGroup.create).toHaveBeenCalledWith({
        data: groupData,
      });
      expect(result).toEqual(mockResult);
    });

    it('should get all active groups', async () => {
      const mockGroups = [
        { 
          id: 'group-1', 
          name: 'Costa Beach - Documents 📄',
          category: 'documents',
          is_active: true 
        },
        { 
          id: 'group-2', 
          name: 'Costa Beach - Polls 🗳️',
          category: 'polls',
          is_active: true 
        },
      ];

      mockSupabase.select.mockResolvedValueOnce({
        data: mockGroups,
        error: null,
      });

      const result = await service.getActiveGroups();

      expect(mockSupabase.from).toHaveBeenCalledWith('whatsapp_groups');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
      expect(result).toEqual(mockGroups);
    });

    it('should get group by category', async () => {
      const mockGroup = {
        id: 'group-1',
        name: 'Costa Beach - Documents 📄',
        whatsapp_group_id: '120363025246125016@g.us',
        category: 'documents',
        is_active: true,
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockGroup,
        error: null,
      });

      const result = await service.getGroupByCategory('documents');

      expect(mockSupabase.from).toHaveBeenCalledWith('whatsapp_groups');
      expect(mockSupabase.eq).toHaveBeenCalledWith('category', 'documents');
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
      expect(result).toEqual(mockGroup);
    });

    it('should update group configuration', async () => {
      const groupId = 'group-123';
      const updates = {
        description: 'Updated description',
        is_active: false,
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: groupId, ...updates },
        error: null,
      });

      const result = await service.updateGroup(groupId, updates);

      expect(mockSupabase.from).toHaveBeenCalledWith('whatsapp_groups');
      expect(mockSupabase.update).toHaveBeenCalledWith(updates);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', groupId);
      expect(result).toEqual({ id: groupId, ...updates });
    });
  });

  describe('Message Sending', () => {
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

    it('should send document notification to appropriate group', async () => {
      const documentData = {
        title: 'Pool Maintenance Schedule',
        category: 'documents',
        language: 'french',
        url: 'https://example.com/document.pdf',
      };

      // Mock getting group by category
      const mockGroup = {
        id: 'group-1',
        whatsapp_group_id: '120363025246125016@g.us',
        category: 'documents',
        language: 'french',
        is_active: true,
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockGroup,
        error: null,
      });

      const result = await service.sendDocumentNotification(documentData);

      expect(result).toEqual({
        success: true,
        messageId: 'mock-message-id',
        groupId: mockGroup.whatsapp_group_id,
        sentAt: expect.any(Date),
      });
    });

    it('should send poll notification to polls group', async () => {
      const pollData = {
        question: 'Should we install new playground equipment?',
        endDate: '2024-12-31',
        language: 'french',
      };

      // Mock getting polls group
      const mockGroup = {
        id: 'group-2',
        whatsapp_group_id: '120363025246125017@g.us',
        category: 'polls',
        language: 'french',
        is_active: true,
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockGroup,
        error: null,
      });

      const result = await service.sendPollNotification(pollData);

      expect(result).toEqual({
        success: true,
        messageId: 'mock-message-id',
        groupId: mockGroup.whatsapp_group_id,
        sentAt: expect.any(Date),
      });
    });

    it('should handle errors when group is not found', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Group not found' },
      });

      const result = await service.sendDocumentNotification({
        title: 'Test Document',
        category: 'documents',
        language: 'french',
        url: 'https://example.com/test.pdf',
      });

      expect(result).toEqual({
        success: false,
        error: 'Group not found for category: documents',
      });
    });
  });

  describe('Message Logging', () => {
    it('should log sent messages to database', async () => {
      const messageData = {
        group_id: 'group-123',
        message_type: 'document_notification' as const,
        content: 'New document: Building Regulations',
        whatsapp_message_id: 'msg-456',
        status: 'sent' as const,
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'log-789', ...messageData },
        error: null,
      });

      const result = await service.logMessage(messageData);

      expect(mockSupabase.from).toHaveBeenCalledWith('whatsapp_group_messages');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        ...messageData,
        sent_at: expect.any(String),
      });
      expect(result).toEqual({ id: 'log-789', ...messageData });
    });

    it('should get message history for a group', async () => {
      const groupId = 'group-123';
      const mockMessages = [
        {
          id: 'msg-1',
          content: 'Document notification',
          message_type: 'document_notification',
          sent_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 'msg-2',
          content: 'Poll notification',
          message_type: 'poll_notification',
          sent_at: '2024-01-14T15:00:00Z',
        },
      ];

      mockSupabase.select.mockResolvedValueOnce({
        data: mockMessages,
        error: null,
      });

      const result = await service.getGroupMessageHistory(groupId, 10);

      expect(mockSupabase.from).toHaveBeenCalledWith('whatsapp_group_messages');
      expect(mockSupabase.eq).toHaveBeenCalledWith('group_id', groupId);
      expect(mockSupabase.order).toHaveBeenCalledWith('sent_at', { ascending: false });
      expect(result).toEqual(mockMessages);
    });
  });

  describe('Client Management', () => {
    it('should initialize WhatsApp client', async () => {
      const result = await service.initializeClient();
      expect(result).toBe(true);
    });

    it('should handle client initialization errors', async () => {
      const mockClient = service['client'] as any;
      mockClient.initialize.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await service.initializeClient();
      expect(result).toBe(false);
    });

    it('should check if client is ready', () => {
      // Initially not ready
      expect(service.isClientReady()).toBe(false);
      
      // Set as ready
      service['clientReady'] = true;
      expect(service.isClientReady()).toBe(true);
    });

    it('should destroy client properly', async () => {
      await service.destroy();
      const mockClient = service['client'] as any;
      expect(mockClient.destroy).toHaveBeenCalled();
    });
  });

  describe('Analytics', () => {
    it('should get group analytics', async () => {
      const groupId = 'group-123';
      const mockAnalytics = [
        { message_type: 'document_notification', count: '5' },
        { message_type: 'poll_notification', count: '3' },
      ];

      // Mock the RPC call for analytics
      mockSupabase.select.mockResolvedValueOnce({
        data: mockAnalytics,
        error: null,
      });

      const result = await service.getGroupAnalytics(groupId, 30);

      expect(result).toEqual({
        totalMessages: 8,
        messageTypes: {
          document_notification: 5,
          poll_notification: 3,
        },
      });
    });

    it('should get overall WhatsApp analytics', async () => {
      const mockOverallStats = [
        { total_groups: '4', active_groups: '3', total_messages: '25' },
      ];

      mockSupabase.select.mockResolvedValueOnce({
        data: mockOverallStats,
        error: null,
      });

      const result = await service.getOverallAnalytics();

      expect(result).toEqual({
        totalGroups: 4,
        activeGroups: 3,
        totalMessages: 25,
      });
    });
  });
});