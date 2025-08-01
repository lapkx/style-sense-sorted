export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      clothing_items: {
        Row: {
          brand: string | null
          care_instructions: string | null
          category: string
          color: string | null
          created_at: string
          id: string
          image_url: string
          last_washed: string | null
          name: string
          needs_washing: boolean | null
          notes: string | null
          occasions: string[] | null
          seasons: string[] | null
          temperature_range: string | null
          updated_at: string
          user_id: string
          wash_frequency_days: number | null
          weather_conditions: string[] | null
        }
        Insert: {
          brand?: string | null
          care_instructions?: string | null
          category: string
          color?: string | null
          created_at?: string
          id?: string
          image_url: string
          last_washed?: string | null
          name: string
          needs_washing?: boolean | null
          notes?: string | null
          occasions?: string[] | null
          seasons?: string[] | null
          temperature_range?: string | null
          updated_at?: string
          user_id: string
          wash_frequency_days?: number | null
          weather_conditions?: string[] | null
        }
        Update: {
          brand?: string | null
          care_instructions?: string | null
          category?: string
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string
          last_washed?: string | null
          name?: string
          needs_washing?: boolean | null
          notes?: string | null
          occasions?: string[] | null
          seasons?: string[] | null
          temperature_range?: string | null
          updated_at?: string
          user_id?: string
          wash_frequency_days?: number | null
          weather_conditions?: string[] | null
        }
        Relationships: []
      }
      clothing_usage: {
        Row: {
          clothing_item_id: string | null
          created_at: string
          id: string
          last_worn: string | null
          total_wears: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          clothing_item_id?: string | null
          created_at?: string
          id?: string
          last_worn?: string | null
          total_wears?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          clothing_item_id?: string | null
          created_at?: string
          id?: string
          last_worn?: string | null
          total_wears?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clothing_usage_clothing_item_id_fkey"
            columns: ["clothing_item_id"]
            isOneToOne: false
            referencedRelation: "clothing_items"
            referencedColumns: ["id"]
          },
        ]
      }
      laundry_schedule: {
        Row: {
          clothing_item_ids: string[]
          created_at: string
          id: string
          notes: string | null
          scheduled_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clothing_item_ids?: string[]
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clothing_item_ids?: string[]
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      outfit_history: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          outfit_id: string | null
          updated_at: string
          user_id: string
          worn_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          outfit_id?: string | null
          updated_at?: string
          user_id: string
          worn_date: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          outfit_id?: string | null
          updated_at?: string
          user_id?: string
          worn_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "outfit_history_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "weekly_outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      outfit_ratings: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          outfit_id: string | null
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          outfit_id?: string | null
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          outfit_id?: string | null
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outfit_ratings_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "weekly_outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      weekly_outfits: {
        Row: {
          clothing_item_ids: string[]
          created_at: string
          date: string
          id: string
          is_ai_generated: boolean | null
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          clothing_item_ids: string[]
          created_at?: string
          date: string
          id?: string
          is_ai_generated?: boolean | null
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          clothing_item_ids?: string[]
          created_at?: string
          date?: string
          id?: string
          is_ai_generated?: boolean | null
          notes?: string | null
          updated_at?: string
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
