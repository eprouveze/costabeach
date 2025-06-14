#!/usr/bin/env node

/**
 * Prisma Naming Validation Script
 * 
 * This script scans TypeScript files for snake_case usage in Prisma operations
 * and reports violations of the camelCase naming convention.
 * 
 * Usage:
 * node scripts/validate-prisma-naming.js
 * 
 * Or add to package.json scripts:
 * "validate-naming": "node scripts/validate-prisma-naming.js"
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const SCAN_PATTERNS = [
  'src/**/*.ts',
  'src/**/*.tsx', 
  'app/**/*.ts',
  'app/**/*.tsx'
];

const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.next/**',
  '**/prisma/**', // Exclude schema files
  '**/*.d.ts'
];

// Common snake_case patterns in Prisma operations
const PRISMA_SNAKE_CASE_PATTERNS = [
  // Field names
  /\b(file_path|file_type|file_size|is_public|view_count|download_count)\b/g,
  /\b(created_at|updated_at|created_by|original_document_id|is_translation|searchable_text)\b/g,
  /\b(poll_type|is_anonymous|allow_comments|start_date|end_date)\b/g,
  /\b(poll_id|option_text|order_index|option_id)\b/g,
  /\b(user_id|entity_type|entity_id)\b/g,
  /\b(is_admin|building_number|apartment_number|phone_number)\b/g,
  /\b(is_verified_owner|preferred_language|is_verified)\b/g,
  
  // Relation names (these should be camelCase)
  /\bpoll_options\b/g,
  /\bpoll_votes\b/g,
  /\bcreated_by_user\b/g,
];

// Known exceptions (constraint names and model names that are legitimately snake_case)
const ALLOWED_SNAKE_CASE = [
  'poll_id_language', // Unique constraint name
  'user_id_type',     // Unique constraint name
  'document_id',      // Foreign key in constraints
  'provider_providerAccountId', // NextAuth constraint
  
  // Model names (these are legitimate in Prisma operations)
  'poll_options',     // Model name
  'poll_translations', // Model name
  'audit_log',        // Model name
  'document_translations', // Model name
  'document_categories', // Model name
  'document_embeddings', // Model name
  'document_search_index', // Model name
  'document_summaries', // Model name
  'document_versions', // Model name
  'feature_flags',    // Model name
  'notification_preferences', // Model name
  'notification_templates', // Model name
  'performance_metrics', // Model name
  'qa_conversations', // Model name
  'qa_interactions',  // Model name
  'system_settings',  // Model name
  'whatsapp_contacts', // Model name
  'whatsapp_digest_logs', // Model name
  'whatsapp_group_messages', // Model name
  'whatsapp_groups',  // Model name
  'whatsapp_messages', // Model name
];

// Field mapping for helpful error messages
const FIELD_CORRECTIONS = {
  'file_path': 'filePath',
  'file_type': 'fileType', 
  'file_size': 'fileSize',
  'is_public': 'isPublic',
  'view_count': 'viewCount',
  'download_count': 'downloadCount',
  'created_at': 'createdAt',
  'updated_at': 'updatedAt',
  'created_by': 'createdBy',
  'original_document_id': 'originalDocumentId',
  'is_translation': 'isTranslation',
  'searchable_text': 'searchableText',
  'poll_type': 'pollType',
  'is_anonymous': 'isAnonymous',
  'allow_comments': 'allowComments',
  'start_date': 'startDate',
  'end_date': 'endDate',
  'poll_id': 'pollId',
  'option_text': 'optionText',
  'order_index': 'orderIndex',
  'option_id': 'optionId',
  'user_id': 'userId',
  'entity_type': 'entityType',
  'entity_id': 'entityId',
  'is_admin': 'isAdmin',
  'building_number': 'buildingNumber',
  'apartment_number': 'apartmentNumber',
  'phone_number': 'phoneNumber',
  'is_verified_owner': 'isVerifiedOwner',
  'preferred_language': 'preferredLanguage',
  'is_verified': 'isVerified',
  'poll_options': 'options',
  'poll_votes': 'votes',
};

function getAllFiles() {
  let allFiles = [];
  
  for (const pattern of SCAN_PATTERNS) {
    const files = glob.sync(pattern, { 
      ignore: EXCLUDE_PATTERNS,
      absolute: true 
    });
    allFiles = allFiles.concat(files);
  }
  
  // Remove duplicates
  return [...new Set(allFiles)];
}

function isPrismaOperation(line) {
  // Check if line contains Prisma operations
  return /\b(prisma\.|\.findMany|\.findUnique|\.create|\.update|\.delete|\.upsert|\.findFirst|\.count|\.aggregate)\b/.test(line);
}

function isInStringLiteral(line, index) {
  // Simple check if the snake_case occurrence is inside a string literal
  const beforeIndex = line.substring(0, index);
  const singleQuotes = (beforeIndex.match(/'/g) || []).length;
  const doubleQuotes = (beforeIndex.match(/"/g) || []).length;
  const templateLiterals = (beforeIndex.match(/`/g) || []).length;
  
  return (singleQuotes % 2 === 1) || (doubleQuotes % 2 === 1) || (templateLiterals % 2 === 1);
}

function isInComment(line, index) {
  // Check if the occurrence is inside a comment
  const beforeIndex = line.substring(0, index);
  
  // Single-line comment
  if (beforeIndex.includes('//')) {
    return true;
  }
  
  // Multi-line comment (basic check)
  if (beforeIndex.includes('/*') && !beforeIndex.includes('*/')) {
    return true;
  }
  
  // JSDoc comment
  if (beforeIndex.includes('*') && line.trim().startsWith('*')) {
    return true;
  }
  
  return false;
}

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations = [];
  
  lines.forEach((line, lineNumber) => {
    // Skip empty lines and pure comments
    if (line.trim().length === 0 || line.trim().startsWith('//') || line.trim().startsWith('*')) {
      return;
    }
    
    // Skip interface/type declarations only
    if (/^\s*(interface|type)\s+/.test(line)) {
      return;
    }
    
    // Only scan lines that are likely Prisma operations or object literals in Prisma contexts
    const isPrismaRelated = /\b(prisma\.|\.findMany|\.findUnique|\.create|\.update|\.delete|\.upsert|\.findFirst|\.count|\.aggregate|where:|data:|orderBy:|include:)\b/.test(line);
    if (!isPrismaRelated) {
      return;
    }
    
    // Check for snake_case patterns
    for (const pattern of PRISMA_SNAKE_CASE_PATTERNS) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const snakeField = match[0];
        
        // Skip if it's an allowed exception
        if (ALLOWED_SNAKE_CASE.includes(snakeField)) {
          continue;
        }
        
        // Skip if it's inside a string literal (might be SQL or error message)
        if (isInStringLiteral(line, match.index)) {
          continue;
        }
        
        // Skip if it's inside a comment
        if (isInComment(line, match.index)) {
          continue;
        }
        
        violations.push({
          file: path.relative(process.cwd(), filePath),
          line: lineNumber + 1,
          column: match.index + 1,
          found: snakeField,
          suggestion: FIELD_CORRECTIONS[snakeField] || 'unknown',
          context: line.trim()
        });
      }
      
      // Reset regex lastIndex for next iteration
      pattern.lastIndex = 0;
    }
  });
  
  return violations;
}

function formatViolations(violations) {
  if (violations.length === 0) {
    console.log('✅ No Prisma naming violations found!');
    console.log('🎉 All field names follow camelCase convention.');
    return;
  }
  
  console.log(`❌ Found ${violations.length} Prisma naming violations:\n`);
  
  // Group by file
  const groupedViolations = violations.reduce((acc, violation) => {
    if (!acc[violation.file]) {
      acc[violation.file] = [];
    }
    acc[violation.file].push(violation);
    return acc;
  }, {});
  
  for (const [file, fileViolations] of Object.entries(groupedViolations)) {
    console.log(`📁 ${file}:`);
    
    fileViolations.forEach(violation => {
      console.log(`  ❌ Line ${violation.line}:${violation.column}`);
      console.log(`     Found: "${violation.found}"`);
      console.log(`     Use instead: "${violation.suggestion}"`);
      console.log(`     Context: ${violation.context}`);
      console.log();
    });
  }
  
  console.log('💡 Quick fixes:');
  const uniqueCorrections = [...new Set(violations.map(v => `${v.found} → ${v.suggestion}`))];
  uniqueCorrections.forEach(correction => {
    console.log(`   ${correction}`);
  });
  
  console.log('\n📖 See CLAUDE.md for complete naming guidelines.');
}

function main() {
  console.log('🔍 Scanning for Prisma naming violations...\n');
  
  const files = getAllFiles();
  console.log(`📊 Scanning ${files.length} TypeScript files...`);
  
  const allViolations = [];
  
  files.forEach(file => {
    const violations = validateFile(file);
    allViolations.push(...violations);
  });
  
  formatViolations(allViolations);
  
  // Exit with error code if violations found (for CI/CD)
  if (allViolations.length > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateFile, formatViolations };