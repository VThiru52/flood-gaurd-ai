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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_predictions: {
        Row: {
          confidence: number
          created_at: string
          expires_at: string | null
          id: string
          model_used: string | null
          prediction_data: Json | null
          prediction_type: string
          risk_score: number
          summary: string | null
          zone_id: string | null
        }
        Insert: {
          confidence?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          model_used?: string | null
          prediction_data?: Json | null
          prediction_type: string
          risk_score?: number
          summary?: string | null
          zone_id?: string | null
        }
        Update: {
          confidence?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          model_used?: string | null
          prediction_data?: Json | null
          prediction_type?: string
          risk_score?: number
          summary?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_predictions_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "flood_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      data_ingestion_log: {
        Row: {
          file_key: string
          id: string
          ingested_at: string
          rows_ingested: number | null
          sheet_name: string
          status: string | null
          target_table: string
        }
        Insert: {
          file_key: string
          id?: string
          ingested_at?: string
          rows_ingested?: number | null
          sheet_name: string
          status?: string | null
          target_table: string
        }
        Update: {
          file_key?: string
          id?: string
          ingested_at?: string
          rows_ingested?: number | null
          sheet_name?: string
          status?: string | null
          target_table?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          metadata: Json | null
          parsed_content: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string
          id?: string
          metadata?: Json | null
          parsed_content?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          metadata?: Json | null
          parsed_content?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      drainage_segments: {
        Row: {
          capacity: number
          catchment_area: string | null
          created_at: string
          design_return_period: string | null
          id: string
          length: string | null
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          catchment_area?: string | null
          created_at?: string
          design_return_period?: string | null
          id?: string
          length?: string | null
          name: string
          status: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          catchment_area?: string | null
          created_at?: string
          design_return_period?: string | null
          id?: string
          length?: string | null
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      flood_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_active: boolean
          location: string
          message: string
          resolved_at: string | null
          severity: string
          zone_code: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          location: string
          message: string
          resolved_at?: string | null
          severity: string
          zone_code?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string
          message?: string
          resolved_at?: string | null
          severity?: string
          zone_code?: string | null
        }
        Relationships: []
      }
      flood_zones: {
        Row: {
          created_at: string
          description: string | null
          id: string
          lat: number
          level: number
          lng: number
          name: string
          risk: string
          updated_at: string
          zone_code: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          lat: number
          level?: number
          lng: number
          name: string
          risk: string
          updated_at?: string
          zone_code: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          lat?: number
          level?: number
          lng?: number
          name?: string
          risk?: string
          updated_at?: string
          zone_code?: string
        }
        Relationships: []
      }
      historical_rainfall: {
        Row: {
          created_at: string
          daily_rainfall_mm: number
          day: number
          id: string
          intensity_10min: number | null
          intensity_120min: number | null
          intensity_15min: number | null
          intensity_180min: number | null
          intensity_30min: number | null
          intensity_45min: number | null
          intensity_5min: number | null
          intensity_60min: number | null
          intensity_90min: number | null
          month: number
          year: number
        }
        Insert: {
          created_at?: string
          daily_rainfall_mm?: number
          day: number
          id?: string
          intensity_10min?: number | null
          intensity_120min?: number | null
          intensity_15min?: number | null
          intensity_180min?: number | null
          intensity_30min?: number | null
          intensity_45min?: number | null
          intensity_5min?: number | null
          intensity_60min?: number | null
          intensity_90min?: number | null
          month: number
          year: number
        }
        Update: {
          created_at?: string
          daily_rainfall_mm?: number
          day?: number
          id?: string
          intensity_10min?: number | null
          intensity_120min?: number | null
          intensity_15min?: number | null
          intensity_180min?: number | null
          intensity_30min?: number | null
          intensity_45min?: number | null
          intensity_5min?: number | null
          intensity_60min?: number | null
          intensity_90min?: number | null
          month?: number
          year?: number
        }
        Relationships: []
      }
      idf_records: {
        Row: {
          created_at: string
          duration_min: number
          id: string
          intensity_1y: number | null
          intensity_2y: number | null
          intensity_5y: number | null
          intensity_6m: number | null
        }
        Insert: {
          created_at?: string
          duration_min: number
          id?: string
          intensity_1y?: number | null
          intensity_2y?: number | null
          intensity_5y?: number | null
          intensity_6m?: number | null
        }
        Update: {
          created_at?: string
          duration_min?: number
          id?: string
          intensity_1y?: number | null
          intensity_2y?: number | null
          intensity_5y?: number | null
          intensity_6m?: number | null
        }
        Relationships: []
      }
      population_data: {
        Row: {
          created_at: string
          id: string
          increase: number | null
          method: string | null
          percent_increase: number | null
          population: number
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          increase?: number | null
          method?: string | null
          percent_increase?: number | null
          population?: number
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          increase?: number | null
          method?: string | null
          percent_increase?: number | null
          population?: number
          year?: number
        }
        Relationships: []
      }
      storm_frequency: {
        Row: {
          created_at: string
          duration_10min: number | null
          duration_15min: number | null
          duration_20min: number | null
          duration_25min: number | null
          duration_30min: number | null
          duration_40min: number | null
          duration_50min: number | null
          duration_5min: number | null
          duration_60min: number | null
          duration_75min: number | null
          id: string
          intensity_threshold: number
          return_period: string
        }
        Insert: {
          created_at?: string
          duration_10min?: number | null
          duration_15min?: number | null
          duration_20min?: number | null
          duration_25min?: number | null
          duration_30min?: number | null
          duration_40min?: number | null
          duration_50min?: number | null
          duration_5min?: number | null
          duration_60min?: number | null
          duration_75min?: number | null
          id?: string
          intensity_threshold: number
          return_period: string
        }
        Update: {
          created_at?: string
          duration_10min?: number | null
          duration_15min?: number | null
          duration_20min?: number | null
          duration_25min?: number | null
          duration_30min?: number | null
          duration_40min?: number | null
          duration_50min?: number | null
          duration_5min?: number | null
          duration_60min?: number | null
          duration_75min?: number | null
          id?: string
          intensity_threshold?: number
          return_period?: string
        }
        Relationships: []
      }
      subdivision_population: {
        Row: {
          area_sqkm: number | null
          created_at: string
          density_per_sqkm: number | null
          division: string
          households: number | null
          id: string
          location: string | null
          pop_2025: number | null
          pop_2040: number | null
          pop_2055: number | null
          population: number | null
          sub_division: string
        }
        Insert: {
          area_sqkm?: number | null
          created_at?: string
          density_per_sqkm?: number | null
          division: string
          households?: number | null
          id?: string
          location?: string | null
          pop_2025?: number | null
          pop_2040?: number | null
          pop_2055?: number | null
          population?: number | null
          sub_division: string
        }
        Update: {
          area_sqkm?: number | null
          created_at?: string
          density_per_sqkm?: number | null
          division?: string
          households?: number | null
          id?: string
          location?: string | null
          pop_2025?: number | null
          pop_2040?: number | null
          pop_2055?: number | null
          population?: number | null
          sub_division?: string
        }
        Relationships: []
      }
      ward_projections: {
        Row: {
          base_population: number | null
          created_at: string
          growth_rate: number
          id: string
          projected_2025: number | null
          projected_2040: number | null
          projected_2055: number | null
        }
        Insert: {
          base_population?: number | null
          created_at?: string
          growth_rate?: number
          id?: string
          projected_2025?: number | null
          projected_2040?: number | null
          projected_2055?: number | null
        }
        Update: {
          base_population?: number | null
          created_at?: string
          growth_rate?: number
          id?: string
          projected_2025?: number | null
          projected_2040?: number | null
          projected_2055?: number | null
        }
        Relationships: []
      }
      weather_readings: {
        Row: {
          humidity_pct: number | null
          id: string
          pressure_hpa: number | null
          rainfall_mm_hr: number
          source: string | null
          temperature_c: number | null
          timestamp: string
          wind_direction: string | null
          wind_speed_kmh: number | null
        }
        Insert: {
          humidity_pct?: number | null
          id?: string
          pressure_hpa?: number | null
          rainfall_mm_hr?: number
          source?: string | null
          temperature_c?: number | null
          timestamp?: string
          wind_direction?: string | null
          wind_speed_kmh?: number | null
        }
        Update: {
          humidity_pct?: number | null
          id?: string
          pressure_hpa?: number | null
          rainfall_mm_hr?: number
          source?: string | null
          temperature_c?: number | null
          timestamp?: string
          wind_direction?: string | null
          wind_speed_kmh?: number | null
        }
        Relationships: []
      }
      zone_categories: {
        Row: {
          code: string
          created_at: string
          description: string | null
          flood_relevance: string
          id: string
          name: string
          zone_type: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          flood_relevance: string
          id?: string
          name: string
          zone_type: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          flood_relevance?: string
          id?: string
          name?: string
          zone_type?: string
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
