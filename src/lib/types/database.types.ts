import { DocumentCategory, Language, Permission } from '@/lib/types'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string
          title: string
          description: string | null
          file_path: string
          file_size: number
          file_type: string
          category: DocumentCategory
          language: Language
          translated_document_id: string | null
          is_translated: boolean
          is_published: boolean
          view_count: number
          download_count: number
          created_at: string
          updated_at: string
          author_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          file_path: string
          file_size: number
          file_type: string
          category: DocumentCategory
          language: Language
          translated_document_id?: string | null
          is_translated?: boolean
          is_published?: boolean
          view_count?: number
          download_count?: number
          created_at?: string
          updated_at?: string
          author_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          file_path?: string
          file_size?: number
          file_type?: string
          category?: DocumentCategory
          language?: Language
          translated_document_id?: string | null
          is_translated?: boolean
          is_published?: boolean
          view_count?: number
          download_count?: number
          created_at?: string
          updated_at?: string
          author_id?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          email_verified: string | null
          image: string | null
          role: 'user' | 'admin' | 'contentEditor'
          is_admin: boolean
          building_number: string | null
          apartment_number: string | null
          phone_number: string | null
          is_verified_owner: boolean
          permissions: Permission[] | null
          preferred_language: Language
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          email?: string | null
          email_verified?: string | null
          image?: string | null
          role?: 'user' | 'admin' | 'contentEditor'
          is_admin?: boolean
          building_number?: string | null
          apartment_number?: string | null
          phone_number?: string | null
          is_verified_owner?: boolean
          permissions?: Permission[] | null
          preferred_language?: Language
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          email_verified?: string | null
          image?: string | null
          role?: 'user' | 'admin' | 'contentEditor'
          is_admin?: boolean
          building_number?: string | null
          apartment_number?: string | null
          phone_number?: string | null
          is_verified_owner?: boolean
          permissions?: Permission[] | null
          preferred_language?: Language
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 