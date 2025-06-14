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
  translatedDocumentId?: string | null;
  translatedDocument?: Document | null;
  translations?: Document[];
  isTranslated: boolean;
  isPublished: boolean;
  viewCount: number;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author?: { id: string; name?: string | null };
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
