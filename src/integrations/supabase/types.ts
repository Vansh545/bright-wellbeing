export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string
          id: string
          is_encrypted: boolean | null
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_encrypted?: boolean | null
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_encrypted?: boolean | null
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      health_conditions: {
        Row: {
          created_at: string
          diagnosed_date: string | null
          id: string
          last_checkup: string | null
          name: string
          notes: string | null
          severity: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          diagnosed_date?: string | null
          id?: string
          last_checkup?: string | null
          name: string
          notes?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          diagnosed_date?: string | null
          id?: string
          last_checkup?: string | null
          name?: string
          notes?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          condition: string | null
          created_at: string
          dosage: string | null
          frequency: string | null
          id: string
          instructions: string | null
          is_active: boolean | null
          name: string
          started_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          condition?: string | null
          created_at?: string
          dosage?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name: string
          started_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          condition?: string | null
          created_at?: string
          dosage?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name?: string
          started_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_videos: {
        Row: {
          category: string
          id: string
          saved_at: string
          user_id: string
          video_channel: string | null
          video_duration: string | null
          video_id: string
          video_thumbnail: string | null
          video_title: string
          video_url: string | null
        }
        Insert: {
          category?: string
          id?: string
          saved_at?: string
          user_id: string
          video_channel?: string | null
          video_duration?: string | null
          video_id: string
          video_thumbnail?: string | null
          video_title: string
          video_url?: string | null
        }
        Update: {
          category?: string
          id?: string
          saved_at?: string
          user_id?: string
          video_channel?: string | null
          video_duration?: string | null
          video_id?: string
          video_thumbnail?: string | null
          video_title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      symptoms: {
        Row: {
          created_at: string
          id: string
          logged_at: string
          name: string
          notes: string | null
          severity: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          logged_at?: string
          name: string
          notes?: string | null
          severity?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          logged_at?: string
          name?: string
          notes?: string | null
          severity?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_video_history: {
        Row: {
          category: string
          completed: boolean | null
          id: string
          user_id: string
          video_channel: string | null
          video_duration: string | null
          video_id: string
          video_thumbnail: string | null
          video_title: string | null
          watch_duration_seconds: number | null
          watched_at: string
        }
        Insert: {
          category?: string
          completed?: boolean | null
          id?: string
          user_id: string
          video_channel?: string | null
          video_duration?: string | null
          video_id: string
          video_thumbnail?: string | null
          video_title?: string | null
          watch_duration_seconds?: number | null
          watched_at?: string
        }
        Update: {
          category?: string
          completed?: boolean | null
          id?: string
          user_id?: string
          video_channel?: string | null
          video_duration?: string | null
          video_id?: string
          video_thumbnail?: string | null
          video_title?: string | null
          watch_duration_seconds?: number | null
          watched_at?: string
        }
        Relationships: []
      }
      user_video_preferences: {
        Row: {
          avoided_topics: string[] | null
          id: string
          interests: string[] | null
          last_updated: string
          preferred_categories: string[] | null
          preferred_difficulty: string | null
          preferred_duration: string | null
          user_id: string
        }
        Insert: {
          avoided_topics?: string[] | null
          id?: string
          interests?: string[] | null
          last_updated?: string
          preferred_categories?: string[] | null
          preferred_difficulty?: string | null
          preferred_duration?: string | null
          user_id: string
        }
        Update: {
          avoided_topics?: string[] | null
          id?: string
          interests?: string[] | null
          last_updated?: string
          preferred_categories?: string[] | null
          preferred_difficulty?: string | null
          preferred_duration?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vital_signs: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          recorded_at: string
          type: string
          unit: string | null
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          recorded_at?: string
          type: string
          unit?: string | null
          user_id: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          recorded_at?: string
          type?: string
          unit?: string | null
          user_id?: string
          value?: string
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
