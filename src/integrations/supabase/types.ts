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
      cities: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      education_levels: {
        Row: {
          code: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          code: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          code?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      partner_locations: {
        Row: {
          address: string
          city_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          operating_hours: string | null
        }
        Insert: {
          address: string
          city_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          operating_hours?: string | null
        }
        Update: {
          address?: string
          city_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          operating_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_locations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          admin_notes: string | null
          city: string
          created_at: string
          detailed_location: string | null
          email: string | null
          id: string
          package_id: string
          preferred_schedule: string | null
          status: Database["public"]["Enums"]["registration_status"]
          student_name: string
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          admin_notes?: string | null
          city: string
          created_at?: string
          detailed_location?: string | null
          email?: string | null
          id?: string
          package_id: string
          preferred_schedule?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          student_name: string
          updated_at?: string
          whatsapp_number: string
        }
        Update: {
          admin_notes?: string | null
          city?: string
          created_at?: string
          detailed_location?: string | null
          email?: string | null
          id?: string
          package_id?: string
          preferred_schedule?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          student_name?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "tutoring_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          current_students: number
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          max_students: number | null
          package_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          current_students?: number
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          max_students?: number | null
          package_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          current_students?: number
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          max_students?: number | null
          package_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "tutoring_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          rating: number
          role: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          rating?: number
          role?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          rating?: number
          role?: string | null
        }
        Relationships: []
      }
      tutoring_packages: {
        Row: {
          city_id: string
          created_at: string
          description: string | null
          group_quota: number | null
          id: string
          is_active: boolean
          level_id: string
          location_id: string | null
          mode: Database["public"]["Enums"]["learning_mode"]
          name: string
          place: Database["public"]["Enums"]["learning_place"] | null
          price: number
          session_duration: number
          subject_id: string
          system: Database["public"]["Enums"]["learning_system"]
          total_sessions: number
          updated_at: string
        }
        Insert: {
          city_id: string
          created_at?: string
          description?: string | null
          group_quota?: number | null
          id?: string
          is_active?: boolean
          level_id: string
          location_id?: string | null
          mode: Database["public"]["Enums"]["learning_mode"]
          name: string
          place?: Database["public"]["Enums"]["learning_place"] | null
          price: number
          session_duration?: number
          subject_id: string
          system: Database["public"]["Enums"]["learning_system"]
          total_sessions?: number
          updated_at?: string
        }
        Update: {
          city_id?: string
          created_at?: string
          description?: string | null
          group_quota?: number | null
          id?: string
          is_active?: boolean
          level_id?: string
          location_id?: string | null
          mode?: Database["public"]["Enums"]["learning_mode"]
          name?: string
          place?: Database["public"]["Enums"]["learning_place"] | null
          price?: number
          session_duration?: number
          subject_id?: string
          system?: Database["public"]["Enums"]["learning_system"]
          total_sessions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutoring_packages_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutoring_packages_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "education_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutoring_packages_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "partner_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutoring_packages_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin"
      learning_mode: "online" | "offline"
      learning_place: "student_home" | "partner_cafe"
      learning_system: "private" | "group"
      registration_status: "new" | "contacted" | "active" | "completed"
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
    Enums: {
      app_role: ["admin"],
      learning_mode: ["online", "offline"],
      learning_place: ["student_home", "partner_cafe"],
      learning_system: ["private", "group"],
      registration_status: ["new", "contacted", "active", "completed"],
    },
  },
} as const
