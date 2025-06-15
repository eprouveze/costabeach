export enum DocumentCategory {
  COMITE_DE_SUIVI = 'comiteDeSuivi',
  SOCIETE_DE_GESTION = 'societeDeGestion',
  LEGAL = 'legal',
  GENERAL = 'general',
  FINANCE = 'finance'
}

export enum Language {
  FRENCH = 'french',
  ARABIC = 'arabic',
  ENGLISH = 'english'
}

export enum TranslationQuality {
  ORIGINAL = 'original',
  MACHINE = 'machine', 
  HUMAN = 'human',
  HYBRID = 'hybrid'
}

export enum TranslationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed', 
  FAILED = 'failed'
}

export enum Permission {
  // User Management
  MANAGE_USERS = 'manageUsers',
  VIEW_USERS = 'viewUsers',
  APPROVE_REGISTRATIONS = 'approveRegistrations',
  
  // Document Management - General
  MANAGE_DOCUMENTS = 'manageDocuments',
  VIEW_DOCUMENTS = 'viewDocuments',
  
  // Document Management - Category Specific
  MANAGE_COMITE_DOCUMENTS = 'manageComiteDocuments',
  MANAGE_SOCIETE_DOCUMENTS = 'manageSocieteDocuments',
  MANAGE_LEGAL_DOCUMENTS = 'manageLegalDocuments',
  MANAGE_FINANCE_DOCUMENTS = 'manageFinanceDocuments',
  MANAGE_GENERAL_DOCUMENTS = 'manageGeneralDocuments',
  
  // System Administration
  MANAGE_SETTINGS = 'manageSettings',
  VIEW_AUDIT_LOGS = 'viewAuditLogs',
  MANAGE_NOTIFICATIONS = 'manageNotifications',
  
  // WhatsApp Management
  MANAGE_WHATSAPP = 'manageWhatsapp',
  SEND_WHATSAPP_MESSAGES = 'sendWhatsappMessages'
}

export interface Document {
  id: string;
  title: string;
  description?: string | null;
  filePath: string;
  fileSize: number;
  fileType: string;
  category: DocumentCategory;
  language: Language;
  sourceLanguage?: Language | null;
  translationQuality?: TranslationQuality;
  translationStatus?: TranslationStatus;
  contentExtractable?: boolean;
  originalDocumentId?: string | null;
  isTranslation?: boolean;
  translatedDocumentId?: string | null;
  translatedDocument?: Document | null;
  translations?: Document[];
  availableLanguages?: Language[];
  isTranslated: boolean;
  isPublished: boolean;
  viewCount: number;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author?: { id: string; name?: string | null };
}

export interface DocumentWithTranslations {
  original: Document & { isOriginal: true };
  translations: {
    [Language.FRENCH]: Document | null;
    [Language.ENGLISH]: Document | null;
    [Language.ARABIC]: Document | null;
  };
  translationStatus: {
    [Language.FRENCH]: TranslationStatus;
    [Language.ENGLISH]: TranslationStatus;
    [Language.ARABIC]: TranslationStatus;
  };
}

export interface DocumentTranslationJob {
  id: string;
  documentId: string;
  targetLanguage: Language;
  status: TranslationStatus;
  errorMessage?: string | null;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  CONTENT_EDITOR = "contentEditor",
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  role: UserRole;
  isAdmin: boolean;
  buildingNumber?: string | null;
  apartmentNumber?: string | null;
  phoneNumber?: string | null;
  isVerifiedOwner: boolean;
  permissions?: Permission[];
  preferredLanguage: Language;
  createdAt: Date;
  updatedAt: Date;
}

// Type for tRPC context user (matches NextAuth session user structure)
export interface AppUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: UserRole;
  isAdmin?: boolean;
}
