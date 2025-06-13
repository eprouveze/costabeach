// Poll Translation Service
// Multilingual support for community polls with automatic translation

import { PrismaClient, Language } from '@prisma/client';
import { db } from '@/lib/db';
import { TranslationService } from './translationService';

export interface PollTranslationData {
  pollId: string;
  language: Language;
  question: string;
  description?: string;
}

export interface PollTranslationRequest {
  pollId: string;
  targetLanguages: Language[];
  requestedBy: string;
}

export interface LocalizedPoll {
  id: string;
  question: string;
  description?: string;
  pollType: string;
  status: string;
  isAnonymous: boolean;
  votingDeadline?: Date;
  createdAt: Date;
  options: LocalizedPollOption[];
  language: Language;
}

export interface LocalizedPollOption {
  id: string;
  optionText: string;
  optionOrder: number;
}

export class PollTranslationService {
  private prisma: PrismaClient;
  private translationService: TranslationService;

  constructor() {
    this.prisma = db;
    this.translationService = new TranslationService();
  }

  /**
   * Create a translation for a poll
   */
  async createPollTranslation(data: PollTranslationData) {
    // Check if poll exists
    const poll = await this.prisma.polls.findUnique({
      where: { id: data.pollId },
    });

    if (!poll) {
      throw new Error('Poll not found');
    }

    // Check if translation already exists
    const existingTranslation = await this.prisma.poll_translations.findUnique({
      where: {
        poll_id_language: {
          poll_id: data.pollId,
          language: data.language,
        },
      },
    });

    if (existingTranslation) {
      throw new Error('Translation already exists for this language');
    }

    // Create translation
    const translation = await this.prisma.poll_translations.create({
      data: {
        poll_id: data.pollId,
        language: data.language,
        question: data.question,
        description: data.description,
      },
    });

    return translation;
  }

  /**
   * Get poll in a specific language with fallback
   */
  async getLocalizedPoll(pollId: string, language: Language): Promise<LocalizedPoll | null> {
    // Get the original poll
    const poll = await this.prisma.polls.findUnique({
      where: { id: pollId },
      include: {
        options: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!poll) {
      return null;
    }

    // Try to get translation
    const translation = await this.prisma.poll_translations.findUnique({
      where: {
        pollId_language: {
          pollId: pollId,
          language: language,
        },
      },
    });

    // Return localized version if translation exists
    const localizedPoll: LocalizedPoll = {
      id: poll.id,
      question: translation?.question || poll.question,
      description: translation?.description || poll.description || undefined,
      pollType: poll.pollType,
      status: poll.status,
      isAnonymous: poll.isAnonymous,
      voting_deadline: poll.endDate || undefined,
      createdAt: poll.createdAt,
      language: translation ? language : 'french', // Default language
      options: poll.options.map(option => ({
        id: option.id,
        optionText: option.optionText, // Would need option translations too
        option_order: option.orderIndex,
      })),
    };

    return localizedPoll;
  }

  /**
   * Request automatic translation for a poll
   */
  async requestPollTranslation(request: PollTranslationRequest) {
    // Get the poll
    const poll = await this.prisma.polls.findUnique({
      where: { id: request.poll_id },
      include: {
        options: true,
      },
    });

    if (!poll) {
      throw new Error('Poll not found');
    }

    const results = [];

    // Request translation for each target language
    for (const targetLanguage of request.target_languages) {
      try {
        // Check if translation already exists
        const existingTranslation = await this.prisma.poll_translations.findUnique({
          where: {
            pollId_language: {
              pollId: request.poll_id,
              language: targetLanguage,
            },
          },
        });

        if (existingTranslation) {
          results.push({
            language: targetLanguage,
            status: 'already_exists',
            translation: existingTranslation,
          });
          continue;
        }

        // TODO: Implement text translation for polls
        const questionTranslation = poll.question;

        // Translate description if it exists
        let descriptionTranslation = null;
        if (poll.description) {
          // TODO: Implement text translation for polls
          descriptionTranslation = poll.description;
        }

        // Create the translation
        const translation = await this.createPollTranslation({
          pollId: request.poll_id,
          language: targetLanguage,
          question: questionTranslation,
          description: descriptionTranslation || undefined,
        });

        results.push({
          language: targetLanguage,
          status: 'created',
          translation,
        });
      } catch (error) {
        results.push({
          language: targetLanguage,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Get all available translations for a poll
   */
  async getPollTranslations(pollId: string) {
    const translations = await this.prisma.poll_translations.findMany({
      where: { pollId: pollId },
      orderBy: { createdAt: 'asc' },
    });

    return translations;
  }

  /**
   * Update a poll translation
   */
  async updatePollTranslation(
    pollId: string,
    language: Language,
    updates: Partial<Pick<PollTranslationData, 'question' | 'description'>>
  ) {
    // Check if translation exists
    const existingTranslation = await this.prisma.poll_translations.findUnique({
      where: {
        pollId_language: {
          pollId: pollId,
          language: language,
        },
      },
    });

    if (!existingTranslation) {
      throw new Error('Translation not found');
    }

    // Update translation
    const updatedTranslation = await this.prisma.poll_translations.update({
      where: {
        pollId_language: {
          pollId: pollId,
          language: language,
        },
      },
      data: updates,
    });

    return updatedTranslation;
  }

  /**
   * Delete a poll translation
   */
  async deletePollTranslation(pollId: string, language: Language) {
    // Check if translation exists
    const existingTranslation = await this.prisma.poll_translations.findUnique({
      where: {
        pollId_language: {
          pollId: pollId,
          language: language,
        },
      },
    });

    if (!existingTranslation) {
      throw new Error('Translation not found');
    }

    // Delete translation
    await this.prisma.poll_translations.delete({
      where: {
        pollId_language: {
          pollId: pollId,
          language: language,
        },
      },
    });

    return { success: true };
  }

  /**
   * Get polls in user's preferred language with fallback
   */
  async getLocalizedPolls(language: Language, status?: string) {
    // Get all polls with their translations
    const polls = await this.prisma.polls.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        options: {
          orderBy: { orderIndex: 'asc' },
        },
        translations: {
          where: { language },
        },
        _count: {
          select: { votes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to localized format
    const localizedPolls: LocalizedPoll[] = polls.map(poll => {
      const translation = poll.translations[0]; // Should only be one per language

      return {
        id: poll.id,
        question: translation?.question || poll.question,
        description: translation?.description || poll.description || undefined,
        pollType: poll.pollType,
        status: poll.status,
        isAnonymous: poll.isAnonymous,
        voting_deadline: poll.endDate || undefined,
        createdAt: poll.createdAt,
        language: translation ? language : 'french',
        options: poll.options.map(option => ({
          id: option.id,
          optionText: option.optionText,
          option_order: option.orderIndex,
        })),
      };
    });

    return localizedPolls;
  }

  /**
   * Get available languages for a poll
   */
  async getAvailableLanguages(pollId: string): Promise<Language[]> {
    const translations = await this.prisma.poll_translations.findMany({
      where: { pollId: pollId },
      select: { language: true },
    });

    const languages = translations.map(t => t.language);
    
    // Always include the original language (assuming French)
    if (!languages.includes('french')) {
      languages.unshift('french');
    }

    return languages;
  }

  /**
   * Check if poll has translation in specific language
   */
  async hasTranslation(pollId: string, language: Language): Promise<boolean> {
    const translation = await this.prisma.poll_translations.findUnique({
      where: {
        pollId_language: {
          pollId: pollId,
          language: language,
        },
      },
    });

    return !!translation;
  }

  /**
   * Get translation completion percentage for a poll
   */
  async getTranslationCompleteness(pollId: string) {
    const supportedLanguages: Language[] = ['french', 'arabic'];
    const availableLanguages = await this.getAvailableLanguages(pollId);
    
    const completeness = (availableLanguages.length / supportedLanguages.length) * 100;
    
    return {
      total_languages: supportedLanguages.length,
      available_languages: availableLanguages.length,
      percentage: Math.round(completeness),
      missing_languages: supportedLanguages.filter(lang => !availableLanguages.includes(lang)),
    };
  }
}