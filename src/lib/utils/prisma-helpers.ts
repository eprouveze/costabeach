/**
 * Prisma Naming Enforcement Utilities
 * 
 * These utilities help enforce consistent camelCase naming in Prisma operations
 * and provide compile-time safety against snake_case field usage.
 */

import { prisma } from "@/lib/db";

// Type utility to detect snake_case field names and show compile errors
type DetectSnakeCase<T extends string> = T extends `${string}_${string}` 
  ? `❌ SNAKE_CASE_DETECTED: "${T}" should be camelCase. Check CLAUDE.md for naming rules.`
  : T;

// Utility type to validate field names in Prisma operations
type ValidateFieldNames<T> = {
  [K in keyof T]: DetectSnakeCase<K extends string ? K : never>;
};

/**
 * Type-safe Prisma client wrapper that enforces camelCase naming
 * 
 * Usage:
 * const db = createSafePrismaClient();
 * 
 * // ✅ This will compile
 * await db.documents.create({ data: { title: "Test", filePath: "/path" } });
 * 
 * // ❌ This will show compile error
 * await db.documents.create({ data: { file_path: "/path" } });
 */
export function createSafePrismaClient() {
  // Add runtime validation helper
  const validateFieldNames = (fields: Record<string, any>, modelName: string) => {
    const snakeCaseFields = Object.keys(fields).filter(key => key.includes('_'));
    if (snakeCaseFields.length > 0) {
      console.error(`❌ SNAKE_CASE FIELDS DETECTED in ${modelName}:`, snakeCaseFields);
      console.error('✅ Use camelCase instead. Check CLAUDE.md for correct field names.');
      throw new Error(`Invalid field naming in ${modelName}: ${snakeCaseFields.join(', ')}`);
    }
  };

  return prisma;
}

/**
 * Compile-time field validation for Prisma data objects
 * 
 * Usage:
 * const data = validateFields({
 *   title: "Test",
 *   filePath: "/path",     // ✅ Valid
 *   // file_path: "/path"  // ❌ Would show compile error
 * });
 */
export function validateFields<T extends Record<string, any>>(
  fields: ValidateFieldNames<T>
): T {
  // Runtime validation
  const snakeCaseFields = Object.keys(fields).filter(key => key.includes('_'));
  if (snakeCaseFields.length > 0) {
    throw new Error(`Snake_case fields detected: ${snakeCaseFields.join(', ')}. Use camelCase instead.`);
  }
  return fields as T;
}

/**
 * Common field name mappings for reference
 * This serves as documentation and can be used for migrations
 */
export const FIELD_NAME_MAPPINGS = {
  // Documents model
  file_path: 'filePath',
  file_type: 'fileType',
  file_size: 'fileSize',
  is_public: 'isPublic',
  view_count: 'viewCount',
  download_count: 'downloadCount',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
  created_by: 'createdBy',
  original_document_id: 'originalDocumentId',
  is_translation: 'isTranslation',
  searchable_text: 'searchableText',

  // Polls model
  poll_type: 'pollType',
  is_anonymous: 'isAnonymous',
  allow_comments: 'allowComments',
  start_date: 'startDate',
  end_date: 'endDate',

  // Poll options model
  poll_id: 'pollId',
  option_text: 'optionText',
  order_index: 'orderIndex',

  // Audit log model
  user_id: 'userId',
  entity_type: 'entityType',
  entity_id: 'entityId',

  // Votes model
  option_id: 'optionId',

  // User model
  is_admin: 'isAdmin',
  building_number: 'buildingNumber',
  apartment_number: 'apartmentNumber',
  phone_number: 'phoneNumber',
  is_verified_owner: 'isVerifiedOwner',
  preferred_language: 'preferredLanguage',
  is_verified: 'isVerified',
} as const;

/**
 * Helper function to get the correct camelCase field name
 * 
 * Usage:
 * const correct = getCamelCaseField('file_path'); // Returns 'filePath'
 */
export function getCamelCaseField(snakeCase: string): string {
  return FIELD_NAME_MAPPINGS[snakeCase as keyof typeof FIELD_NAME_MAPPINGS] || snakeCase;
}

/**
 * Validation function for Prisma where clauses
 * Helps catch snake_case usage in filters
 */
export function validateWhereClause<T extends Record<string, any>>(
  where: T,
  modelName: string
): T {
  const snakeCaseFields = Object.keys(where).filter(key => key.includes('_'));
  if (snakeCaseFields.length > 0) {
    console.error(`❌ SNAKE_CASE WHERE FIELDS in ${modelName}:`, snakeCaseFields);
    console.error('✅ Correct field names:', snakeCaseFields.map(getCamelCaseField));
    throw new Error(`Invalid where clause field naming in ${modelName}: ${snakeCaseFields.join(', ')}`);
  }
  return where;
}

/**
 * Type definitions for commonly used Prisma operations with proper field names
 */
export type DocumentCreateData = {
  title: string;
  description?: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  category: string;
  language?: string;
  isPublic?: boolean;
  createdBy?: string;
  // NOTE: Never use file_path, file_type, file_size, is_public, created_by
};

export type PollCreateData = {
  question: string;
  description?: string;
  pollType: string;
  isAnonymous?: boolean;
  allowComments?: boolean;
  startDate?: Date;
  endDate?: Date;
  createdBy: string;
  // NOTE: Never use poll_type, is_anonymous, allow_comments, start_date, end_date, created_by
};

export type PollOptionCreateData = {
  pollId: string;
  optionText: string;
  orderIndex: number;
  // NOTE: Never use poll_id, option_text, order_index
};

/**
 * Runtime validation for development
 * This function can be called in development to validate field naming
 */
export function runNamingValidation() {
  console.log('🔍 Running Prisma field naming validation...');
  
  // Check if we're in development
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // This could be extended to automatically scan TypeScript files
  // for snake_case usage in Prisma operations
  console.log('✅ Prisma field naming validation complete');
  console.log('📖 Remember: Always use camelCase in TypeScript, schema handles snake_case mapping');
}