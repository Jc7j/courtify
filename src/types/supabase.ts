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
      admins: {
        Row: {
          id: string
          company_id: string
          user_id: string
          role: 'user' | 'admin' | 'super_admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          role?: 'user' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          role?: 'user' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          branding: Json | null
          pricing: Json
          cancellation_policy: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          branding?: Json | null
          pricing?: Json
          cancellation_policy?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          branding?: Json | null
          pricing?: Json
          cancellation_policy?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add other table definitions as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { company_uuid: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'user' | 'admin' | 'super_admin'
      booking_status: 'pending' | 'confirmed' | 'canceled' | 'completed'
      booking_type: 'group' | 'private'
      payment_status: 'pending' | 'succeeded' | 'failed' | 'refunded'
      court_status: 'available' | 'maintenance' | 'closed'
    }
  }
} 
