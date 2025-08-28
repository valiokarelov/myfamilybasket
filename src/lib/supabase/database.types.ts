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
      households: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          household_id: string | null
          full_name: string
          email: string | null
          role: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          household_id?: string | null
          full_name: string
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string | null
          full_name?: string
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      income_sources: {
        Row: {
          id: string
          household_id: string
          user_id: string
          name: string
          type: string
          is_recurring: boolean
          frequency: string | null
          amount: number | null
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          user_id: string
          name: string
          type: string
          is_recurring?: boolean
          frequency?: string | null
          amount?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          user_id?: string
          name?: string
          type?: string
          is_recurring?: boolean
          frequency?: string | null
          amount?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_sources_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_sources_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      income_entries: {
        Row: {
          id: string
          income_source_id: string
          amount: number
          date: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          income_source_id: string
          amount: number
          date: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          income_source_id?: string
          amount?: number
          date?: string
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_entries_income_source_id_fkey"
            columns: ["income_source_id"]
            isOneToOne: false
            referencedRelation: "income_sources"
            referencedColumns: ["id"]
          }
        ]
      }
      budget_categories: {
        Row: {
          id: string
          household_id: string
          name: string
          type: string
          parent_id: string | null
          monthly_limit: number | null
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          type: string
          parent_id?: string | null
          monthly_limit?: number | null
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          type?: string
          parent_id?: string | null
          monthly_limit?: number | null
          color?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_categories_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      receipts: {
        Row: {
          id: string
          household_id: string
          user_id: string
          store_name: string | null
          total_amount: number
          date: string
          image_url: string | null
          raw_text: string | null
          processed_items: Json | null
          category_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          user_id: string
          store_name?: string | null
          total_amount: number
          date: string
          image_url?: string | null
          raw_text?: string | null
          processed_items?: Json | null
          category_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          user_id?: string
          store_name?: string | null
          total_amount?: number
          date?: string
          image_url?: string | null
          raw_text?: string | null
          processed_items?: Json | null
          category_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      shopping_lists: {
        Row: {
          id: string
          household_id: string
          name: string
          store_name: string | null
          created_by: string | null
          is_completed: boolean
          estimated_total: number | null
          actual_total: number | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          store_name?: string | null
          created_by?: string | null
          is_completed?: boolean
          estimated_total?: number | null
          actual_total?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          store_name?: string | null
          created_by?: string | null
          is_completed?: boolean
          estimated_total?: number | null
          actual_total?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_lists_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          }
        ]
      }
      shopping_items: {
        Row: {
          id: string
          list_id: string
          name: string
          quantity: number
          estimated_price: number | null
          actual_price: number | null
          priority: string
          notes: string | null
          assigned_to: string | null
          is_purchased: boolean
          purchased_by: string | null
          purchased_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          list_id: string
          name: string
          quantity?: number
          estimated_price?: number | null
          actual_price?: number | null
          priority?: string
          notes?: string | null
          assigned_to?: string | null
          is_purchased?: boolean
          purchased_by?: string | null
          purchased_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          name?: string
          quantity?: number
          estimated_price?: number | null
          actual_price?: number | null
          priority?: string
          notes?: string | null
          assigned_to?: string | null
          is_purchased?: boolean
          purchased_by?: string | null
          purchased_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_items_purchased_by_fkey"
            columns: ["purchased_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      service_contacts: {
        Row: {
          id: string
          household_id: string
          name: string
          service_type: string
          phone: string | null
          email: string | null
          address: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          service_type: string
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          service_type?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_contacts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          }
        ]
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