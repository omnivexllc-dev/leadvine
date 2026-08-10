export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string;
          id: string;
          parts: Json;
          role: string;
          thread_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          parts: Json;
          role: string;
          thread_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          parts?: Json;
          role?: string;
          thread_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "chat_threads";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_threads: {
        Row: {
          created_at: string;
          id: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          title?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      lead_lists: {
        Row: {
          created_at: string;
          id: string;
          last_run_at: string | null;
          location: string | null;
          name: string;
          query: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          last_run_at?: string | null;
          location?: string | null;
          name: string;
          query?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          last_run_at?: string | null;
          location?: string | null;
          name?: string;
          query?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          address: string | null;
          category: string | null;
          city: string | null;
          created_at: string;
          email: string | null;
          estimated_contract_value: number | null;
          has_website: boolean;
          id: string;
          last_scanned_at: string | null;
          latitude: number | null;
          list_id: string | null;
          longitude: number | null;
          maps_url: string | null;
          metadata: Json | null;
          name: string;
          next_followup_at: string | null;
          notes: string | null;
          opportunity_label: string | null;
          opportunity_score: number | null;
          phone: string | null;
          pipeline_status: string | null;
          place_id: string | null;
          rating: number | null;
          seo_score: number | null;
          site_score: number | null;
          star_rating: number | null;
          status: string | null;
          types: string[] | null;
          updated_at: string | null;
          user_id: string;
          user_ratings_total: number | null;
          website: string | null;
        };
        Insert: {
          address?: string | null;
          category?: string | null;
          city?: string | null;
          created_at?: string;
          email?: string | null;
          estimated_contract_value?: number | null;
          has_website?: boolean;
          id?: string;
          last_scanned_at?: string | null;
          latitude?: number | null;
          list_id?: string | null;
          longitude?: number | null;
          maps_url?: string | null;
          metadata?: Json | null;
          name: string;
          next_followup_at?: string | null;
          notes?: string | null;
          opportunity_label?: string | null;
          opportunity_score?: number | null;
          phone?: string | null;
          pipeline_status?: string | null;
          place_id?: string | null;
          rating?: number | null;
          seo_score?: number | null;
          site_score?: number | null;
          star_rating?: number | null;
          status?: string | null;
          types?: string[] | null;
          updated_at?: string | null;
          user_id: string;
          user_ratings_total?: number | null;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          category?: string | null;
          city?: string | null;
          created_at?: string;
          email?: string | null;
          estimated_contract_value?: number | null;
          has_website?: boolean;
          id?: string;
          last_scanned_at?: string | null;
          latitude?: number | null;
          list_id?: string | null;
          longitude?: number | null;
          maps_url?: string | null;
          metadata?: Json | null;
          name?: string;
          next_followup_at?: string | null;
          notes?: string | null;
          opportunity_label?: string | null;
          opportunity_score?: number | null;
          phone?: string | null;
          pipeline_status?: string | null;
          place_id?: string | null;
          rating?: number | null;
          seo_score?: number | null;
          site_score?: number | null;
          star_rating?: number | null;
          status?: string | null;
          types?: string[] | null;
          updated_at?: string | null;
          user_id?: string;
          user_ratings_total?: number | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "leads_list_id_fkey";
            columns: ["list_id"];
            isOneToOne: false;
            referencedRelation: "lead_lists";
            referencedColumns: ["id"];
          },
        ];
      };
      scan_results: {
        Row: {
          accessibility_score: number | null;
          audit_details: Json | null;
          batch_id: string | null;
          created_at: string;
          design_score: number | null;
          domain_intel: Json | null;
          error_message: string | null;
          id: string;
          lead_id: string | null;
          opportunity_analysis: Json | null;
          overall_score: number | null;
          performance_score: number | null;
          scan_type: string;
          screenshot_url: string | null;
          seo_score: number | null;
          status: string;
          tech_stack: Json | null;
          updated_at: string;
          url: string;
          user_id: string;
        };
        Insert: {
          accessibility_score?: number | null;
          audit_details?: Json | null;
          batch_id?: string | null;
          created_at?: string;
          design_score?: number | null;
          domain_intel?: Json | null;
          error_message?: string | null;
          id?: string;
          lead_id?: string | null;
          opportunity_analysis?: Json | null;
          overall_score?: number | null;
          performance_score?: number | null;
          scan_type?: string;
          screenshot_url?: string | null;
          seo_score?: number | null;
          status?: string;
          tech_stack?: Json | null;
          updated_at?: string;
          url: string;
          user_id: string;
        };
        Update: {
          accessibility_score?: number | null;
          audit_details?: Json | null;
          batch_id?: string | null;
          created_at?: string;
          design_score?: number | null;
          domain_intel?: Json | null;
          error_message?: string | null;
          id?: string;
          lead_id?: string | null;
          opportunity_analysis?: Json | null;
          overall_score?: number | null;
          performance_score?: number | null;
          scan_type?: string;
          screenshot_url?: string | null;
          seo_score?: number | null;
          status?: string;
          tech_stack?: Json | null;
          updated_at?: string;
          url?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scan_results_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scan_results_batch_id_fkey";
            columns: ["batch_id"];
            isOneToOne: false;
            referencedRelation: "scan_batches";
            referencedColumns: ["id"];
          },
        ];
      };
      campaigns: {
        Row: {
          body_template: string | null;
          clicked_count: number;
          created_at: string;
          id: string;
          meetings_booked: number;
          name: string;
          opened_count: number;
          replied_count: number;
          sent_count: number;
          settings: Json | null;
          status: string;
          subject_template: string | null;
          target_query: string | null;
          total_prospects: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body_template?: string | null;
          clicked_count?: number;
          created_at?: string;
          id?: string;
          meetings_booked?: number;
          name: string;
          opened_count?: number;
          replied_count?: number;
          sent_count?: number;
          settings?: Json | null;
          status?: string;
          subject_template?: string | null;
          target_query?: string | null;
          total_prospects?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          body_template?: string | null;
          clicked_count?: number;
          created_at?: string;
          id?: string;
          meetings_booked?: number;
          name?: string;
          opened_count?: number;
          replied_count?: number;
          sent_count?: number;
          settings?: Json | null;
          status?: string;
          subject_template?: string | null;
          target_query?: string | null;
          total_prospects?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      campaign_steps: {
        Row: {
          campaign_id: string;
          created_at: string;
          delay_days: number;
          id: string;
          step_number: number;
          subject: string | null;
          template_body: string | null;
          title: string;
          type: string;
        };
        Insert: {
          campaign_id: string;
          created_at?: string;
          delay_days?: number;
          id?: string;
          step_number: number;
          subject?: string | null;
          template_body?: string | null;
          title: string;
          type?: string;
        };
        Update: {
          campaign_id?: string;
          created_at?: string;
          delay_days?: number;
          id?: string;
          step_number?: number;
          subject?: string | null;
          template_body?: string | null;
          title?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_steps_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
        ];
      };
      campaign_prospects: {
        Row: {
          campaign_id: string;
          created_at: string;
          current_step: number;
          id: string;
          last_contacted_at: string | null;
          lead_id: string;
          metadata: Json | null;
          next_scheduled_at: string | null;
          status: string;
        };
        Insert: {
          campaign_id: string;
          created_at?: string;
          current_step?: number;
          id?: string;
          last_contacted_at?: string | null;
          lead_id: string;
          metadata?: Json | null;
          next_scheduled_at?: string | null;
          status?: string;
        };
        Update: {
          campaign_id?: string;
          created_at?: string;
          current_step?: number;
          id?: string;
          last_contacted_at?: string | null;
          lead_id?: string;
          metadata?: Json | null;
          next_scheduled_at?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_prospects_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_prospects_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      scan_batches: {
        Row: {
          completed: number;
          created_at: string;
          cursor: number;
          failed: number;
          finished_at: string | null;
          force_rescan: boolean;
          id: string;
          lead_ids: string[];
          list_id: string | null;
          name: string;
          rescan_days: number;
          skipped: number;
          status: string;
          total: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed?: number;
          created_at?: string;
          cursor?: number;
          failed?: number;
          finished_at?: string | null;
          force_rescan?: boolean;
          id?: string;
          lead_ids?: string[];
          list_id?: string | null;
          name?: string;
          rescan_days?: number;
          skipped?: number;
          status?: string;
          total?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed?: number;
          created_at?: string;
          cursor?: number;
          failed?: number;
          finished_at?: string | null;
          force_rescan?: boolean;
          id?: string;
          lead_ids?: string[];
          list_id?: string | null;
          name?: string;
          rescan_days?: number;
          skipped?: number;
          status?: string;
          total?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scan_batches_list_id_fkey";
            columns: ["list_id"];
            isOneToOne: false;
            referencedRelation: "lead_lists";
            referencedColumns: ["id"];
          },
        ];
      };
      seo_reports: {
        Row: {
          created_at: string;
          data: Json | null;
          description: string | null;
          id: string;
          recommendations: Json | null;
          score: number | null;
          title: string | null;
          url: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          data?: Json | null;
          description?: string | null;
          id?: string;
          recommendations?: Json | null;
          score?: number | null;
          title?: string | null;
          url: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          data?: Json | null;
          description?: string | null;
          id?: string;
          recommendations?: Json | null;
          score?: number | null;
          title?: string | null;
          url?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      site_audits: {
        Row: {
          created_at: string;
          error: string | null;
          id: string;
          needs_redesign: boolean | null;
          score: number | null;
          screenshot_url: string | null;
          signals: Json | null;
          url: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          error?: string | null;
          id?: string;
          needs_redesign?: boolean | null;
          score?: number | null;
          screenshot_url?: string | null;
          signals?: Json | null;
          url: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          error?: string | null;
          id?: string;
          needs_redesign?: boolean | null;
          score?: number | null;
          screenshot_url?: string | null;
          signals?: Json | null;
          url?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
