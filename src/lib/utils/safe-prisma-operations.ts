/**
 * Safe Prisma Operations
 * 
 * Pre-built, validated Prisma operations that enforce camelCase naming
 * and provide helpful error messages for common database operations.
 */

import { db } from '@/lib/db';
import { validateWhereClause } from './prisma-helpers';
import type { DocumentCategory, Language, PollType, PollStatus } from '@prisma/client';

// Type-safe document operations
export const documentOperations = {
  /**
   * Create a new document with validated field names
   */
  async create(data: {
    title: string;
    description?: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    category: DocumentCategory;
    language?: Language;
    isPublic?: boolean;
    createdBy?: string;
  }) {
    // Runtime validation to catch any snake_case usage
    const snakeCaseFields = Object.keys(data).filter(key => key.includes('_'));
    if (snakeCaseFields.length > 0) {
      throw new Error(`❌ Snake_case fields detected: ${snakeCaseFields.join(', ')}. Use camelCase instead.`);
    }

    return db.documents.create({ data });
  },

  /**
   * Find documents with validated where clause
   */
  async findMany(where: {
    category?: DocumentCategory;
    language?: Language;
    isPublic?: boolean;
    createdBy?: string;
    title?: { contains: string };
  } = {}) {
    validateWhereClause(where, 'documents');
    
    return db.documents.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  /**
   * Update document with field validation
   */
  async update(id: string, data: {
    title?: string;
    description?: string;
    category?: DocumentCategory;
    isPublic?: boolean;
  }) {
    const snakeCaseFields = Object.keys(data).filter(key => key.includes('_'));
    if (snakeCaseFields.length > 0) {
      throw new Error(`❌ Snake_case fields detected: ${snakeCaseFields.join(', ')}. Use camelCase instead.`);
    }

    return db.documents.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }
};

// Type-safe poll operations
export const pollOperations = {
  /**
   * Create a new poll with validated field names
   */
  async create(data: {
    question: string;
    description?: string;
    pollType: PollType;
    isAnonymous?: boolean;
    allowComments?: boolean;
    startDate?: Date;
    endDate?: Date;
    createdBy: string;
  }) {
    const snakeCaseFields = Object.keys(data).filter(key => key.includes('_'));
    if (snakeCaseFields.length > 0) {
      throw new Error(`❌ Snake_case fields detected: ${snakeCaseFields.join(', ')}. Use camelCase instead.`);
    }

    return db.polls.create({ data });
  },

  /**
   * Find polls with validated where clause and proper relations
   */
  async findMany(where: {
    status?: PollStatus;
    createdBy?: string;
    pollType?: PollType;
    isAnonymous?: boolean;
  } = {}) {
    validateWhereClause(where, 'polls');
    
    return db.polls.findMany({
      where,
      include: {
        options: {
          orderBy: { orderIndex: 'asc' }
        },
        votes: true,
        creator: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  /**
   * Create poll options with validation
   */
  async createOptions(pollId: string, options: string[]) {
    const optionData = options.map((text, index) => ({
      pollId,
      optionText: text,
      orderIndex: index
    }));

    return db.poll_options.createMany({
      data: optionData
    });
  }
};

// Type-safe user operations
export const userOperations = {
  /**
   * Find users with validated where clause
   */
  async findMany(where: {
    isAdmin?: boolean;
    isVerifiedOwner?: boolean;
    buildingNumber?: string;
    preferredLanguage?: string;
  } = {}) {
    validateWhereClause(where, 'users');
    
    return db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isVerifiedOwner: true,
        buildingNumber: true,
        apartmentNumber: true,
        preferredLanguage: true,
        permissions: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  /**
   * Update user with field validation
   */
  async update(id: string, data: {
    name?: string;
    isAdmin?: boolean;
    isVerifiedOwner?: boolean;
    buildingNumber?: string;
    apartmentNumber?: string;
    phoneNumber?: string;
    preferredLanguage?: string;
    permissions?: string[];
  }) {
    const snakeCaseFields = Object.keys(data).filter(key => key.includes('_'));
    if (snakeCaseFields.length > 0) {
      throw new Error(`❌ Snake_case fields detected: ${snakeCaseFields.join(', ')}. Use camelCase instead.`);
    }

    return db.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }
};

// Type-safe audit log operations
export const auditOperations = {
  /**
   * Create audit log entry with validated fields
   */
  async create(data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: any;
  }) {
    const snakeCaseFields = Object.keys(data).filter(key => key.includes('_'));
    if (snakeCaseFields.length > 0) {
      throw new Error(`❌ Snake_case fields detected: ${snakeCaseFields.join(', ')}. Use camelCase instead.`);
    }

    return db.audit_log.create({ data });
  },

  /**
   * Find audit logs with validation
   */
  async findMany(where: {
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
  } = {}) {
    validateWhereClause(where, 'audit_log');
    
    return db.audit_log.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
};

/**
 * Utility function to validate any Prisma data object
 */
export function validatePrismaData(data: Record<string, any>, modelName: string) {
  const snakeCaseFields = Object.keys(data).filter(key => key.includes('_'));
  if (snakeCaseFields.length > 0) {
    console.error(`❌ SNAKE_CASE DETECTED in ${modelName}:`, snakeCaseFields);
    console.error('✅ See CLAUDE.md for correct camelCase field names');
    throw new Error(`Invalid field naming in ${modelName}: ${snakeCaseFields.join(', ')}`);
  }
  return true;
}

/**
 * Helper to get all available field names for a model (for debugging)
 */
export const modelFieldNames = {
  documents: [
    'id', 'title', 'description', 'filePath', 'fileType', 'fileSize',
    'category', 'language', 'isPublic', 'viewCount', 'downloadCount',
    'createdAt', 'updatedAt', 'createdBy', 'originalDocumentId',
    'isTranslation', 'searchableText'
  ],
  polls: [
    'id', 'question', 'description', 'pollType', 'status', 'isAnonymous',
    'allowComments', 'startDate', 'endDate', 'createdBy', 'createdAt', 'updatedAt'
  ],
  poll_options: [
    'id', 'pollId', 'optionText', 'orderIndex', 'createdAt'
  ],
  votes: [
    'id', 'pollId', 'optionId', 'userId', 'comment', 'createdAt'
  ],
  users: [
    'id', 'name', 'email', 'emailVerified', 'image', 'role', 'isAdmin',
    'buildingNumber', 'apartmentNumber', 'phoneNumber', 'isVerifiedOwner',
    'permissions', 'preferredLanguage', 'createdAt', 'updatedAt', 'isVerified'
  ],
  audit_log: [
    'id', 'userId', 'action', 'entityType', 'entityId', 'details', 'createdAt'
  ]
} as const;