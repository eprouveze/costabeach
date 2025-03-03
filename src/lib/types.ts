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
  MANAGE_USERS = 'manageUsers',
  MANAGE_DOCUMENTS = 'manageDocuments',
  MANAGE_COMITE_DOCUMENTS = 'manageComiteDocuments',
  MANAGE_SOCIETE_DOCUMENTS = 'manageSocieteDocuments',
  MANAGE_LEGAL_DOCUMENTS = 'manageLegalDocuments',
  APPROVE_REGISTRATIONS = 'approveRegistrations'
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
  author?: User;
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  role: 'user' | 'admin' | 'contentEditor';
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
