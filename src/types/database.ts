export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          calculations: Json | null
          coordinates: Json | null
          created_at: string | null
          deal_type: string
          id: string
          images: string[] | null
          is_archived: boolean | null
          location: string | null
          name: string
          notes: string | null
          params: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calculations?: Json | null
          coordinates?: Json | null
          created_at?: string | null
          deal_type?: string
          id?: string
          images?: string[] | null
          is_archived?: boolean | null
          location?: string | null
          name: string
          notes?: string | null
          params?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calculations?: Json | null
          coordinates?: Json | null
          created_at?: string | null
          deal_type?: string
          id?: string
          images?: string[] | null
          is_archived?: boolean | null
          location?: string | null
          name?: string
          notes?: string | null
          params?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience types
export type Profile = Tables<'profiles'>
export type Property = Tables<'properties'>
export type PropertyInsert = TablesInsert<'properties'>
export type PropertyUpdate = TablesUpdate<'properties'>
