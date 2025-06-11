// Poll Translations API Tests
// Following TDD methodology and existing test patterns

import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { PollTranslationService } from '@/lib/services/pollTranslationService';
import { getCurrentUser } from '@/lib/auth';

// Mock dependencies
jest.mock('@/lib/services/pollTranslationService');
jest.mock('@/lib/auth');

describe('/api/polls/[id]/translations', () => {
  let mockTranslationService: jest.Mocked<PollTranslationService>;
  let mockGetCurrentUser: jest.MockedFunction<typeof getCurrentUser>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock translation service
    mockTranslationService = {
      getPollTranslations: jest.fn(),
      getAvailableLanguages: jest.fn(),
      getTranslationCompleteness: jest.fn(),
      createPollTranslation: jest.fn(),
      requestPollTranslation: jest.fn(),
    } as any;
    
    (PollTranslationService as jest.Mock).mockImplementation(() => mockTranslationService);
    
    // Mock auth
    mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
  });

  describe('GET /api/polls/[id]/translations', () => {
    it('should return translations for authenticated user', async () => {
      // Mock authenticated user
      mockGetCurrentUser.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        role: 'user',
      });

      // Mock service responses
      const mockTranslations = [
        {
          id: 'trans-1',
          poll_id: 'poll-123',
          language: 'arabic',
          question: 'Arabic question',
          created_at: new Date(),
        },
      ];

      const mockLanguages = ['french', 'arabic'];
      const mockCompleteness = {
        total_languages: 2,
        available_languages: 2,
        percentage: 100,
        missing_languages: [],
      };

      mockTranslationService.getPollTranslations.mockResolvedValue(mockTranslations);
      mockTranslationService.getAvailableLanguages.mockResolvedValue(mockLanguages);
      mockTranslationService.getTranslationCompleteness.mockResolvedValue(mockCompleteness);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/polls/poll-123/translations');
      
      // Call endpoint
      const response = await GET(request, { params: { id: 'poll-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        translations: mockTranslations,
        available_languages: mockLanguages,
        completeness: mockCompleteness,
      });
      expect(mockTranslationService.getPollTranslations).toHaveBeenCalledWith('poll-123');
      expect(mockTranslationService.getAvailableLanguages).toHaveBeenCalledWith('poll-123');
      expect(mockTranslationService.getTranslationCompleteness).toHaveBeenCalledWith('poll-123');
    });

    it('should return 401 for unauthenticated user', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/polls/poll-123/translations');
      const response = await GET(request, { params: { id: 'poll-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should handle service errors', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        role: 'user',
      });

      mockTranslationService.getPollTranslations.mockRejectedValue(new Error('Service error'));

      const request = new NextRequest('http://localhost:3000/api/polls/poll-123/translations');
      const response = await GET(request, { params: { id: 'poll-123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST /api/polls/[id]/translations', () => {
    it('should create manual translation for admin user', async () => {
      // Mock admin user
      mockGetCurrentUser.mockResolvedValue({
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      });

      const requestBody = {
        language: 'arabic',
        question: 'Arabic question',
        description: 'Arabic description',
      };

      const mockTranslation = {
        id: 'trans-123',
        poll_id: 'poll-123',
        language: 'arabic',
        question: 'Arabic question',
        description: 'Arabic description',
        created_at: new Date(),
      };

      mockTranslationService.createPollTranslation.mockResolvedValue(mockTranslation);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/polls/poll-123/translations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      // Call endpoint
      const response = await POST(request, { params: { id: 'poll-123' } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.translation).toEqual(mockTranslation);
      expect(mockTranslationService.createPollTranslation).toHaveBeenCalledWith({
        poll_id: 'poll-123',
        language: 'arabic',
        question: 'Arabic question',
        description: 'Arabic description',
      });
    });

    it('should request automatic translation for admin user', async () => {
      // Mock admin user
      mockGetCurrentUser.mockResolvedValue({
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      });

      const requestBody = {
        target_languages: ['arabic'],
      };

      const mockResults = [
        {
          language: 'arabic',
          status: 'created',
          translation: {
            id: 'trans-123',
            poll_id: 'poll-123',
            language: 'arabic',
            question: 'Translated question',
          },
        },
      ];

      mockTranslationService.requestPollTranslation.mockResolvedValue(mockResults);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/polls/poll-123/translations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      // Call endpoint
      const response = await POST(request, { params: { id: 'poll-123' } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.results).toEqual(mockResults);
      expect(mockTranslationService.requestPollTranslation).toHaveBeenCalledWith({
        poll_id: 'poll-123',
        target_languages: ['arabic'],
        requested_by: 'admin-123',
      });
    });

    it('should return 401 for unauthenticated user', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/polls/poll-123/translations', {
        method: 'POST',
        body: JSON.stringify({ language: 'arabic', question: 'Question' }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await POST(request, { params: { id: 'poll-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 403 for regular user', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
        role: 'user',
      });

      const request = new NextRequest('http://localhost:3000/api/polls/poll-123/translations', {
        method: 'POST',
        body: JSON.stringify({ language: 'arabic', question: 'Question' }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await POST(request, { params: { id: 'poll-123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Insufficient permissions');
    });

    it('should return 400 for invalid manual translation data', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      });

      const request = new NextRequest('http://localhost:3000/api/polls/poll-123/translations', {
        method: 'POST',
        body: JSON.stringify({ language: 'invalid', question: 'Question' }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await POST(request, { params: { id: 'poll-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid translation data. Required: language, question');
    });

    it('should return 400 for invalid translation request data', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      });

      const request = new NextRequest('http://localhost:3000/api/polls/poll-123/translations', {
        method: 'POST',
        body: JSON.stringify({ target_languages: ['invalid'] }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await POST(request, { params: { id: 'poll-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid translation request. Required: target_languages array');
    });

    it('should handle poll not found error', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      });

      mockTranslationService.createPollTranslation.mockRejectedValue(new Error('Poll not found'));

      const request = new NextRequest('http://localhost:3000/api/polls/poll-123/translations', {
        method: 'POST',
        body: JSON.stringify({ language: 'arabic', question: 'Question' }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await POST(request, { params: { id: 'poll-123' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Poll not found');
    });

    it('should handle translation already exists error', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      });

      mockTranslationService.createPollTranslation.mockRejectedValue(new Error('Translation already exists'));

      const request = new NextRequest('http://localhost:3000/api/polls/poll-123/translations', {
        method: 'POST',
        body: JSON.stringify({ language: 'arabic', question: 'Question' }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await POST(request, { params: { id: 'poll-123' } });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Translation already exists for this language');
    });
  });
});