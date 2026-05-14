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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          last_login_date: string | null
          login_streak: number
          name: string | null
          points: number
          referral_code: string
          referred_by: string | null
          total_earned: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          last_login_date?: string | null
          login_streak?: number
          name?: string | null
          points?: number
          referral_code: string
          referred_by?: string | null
          total_earned?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          last_login_date?: string | null
          login_streak?: number
          name?: string | null
          points?: number
          referral_code?: string
          referred_by?: string | null
          total_earned?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tap_dash_scores: {
        Row: {
          combo_max: number
          created_at: string
          duration_ms: number
          hits: number
          id: string
          score: number
          user_id: string
        }
        Insert: {
          combo_max?: number
          created_at?: string
          duration_ms?: number
          hits?: number
          id?: string
          score: number
          user_id: string
        }
        Update: {
          combo_max?: number
          created_at?: string
          duration_ms?: number
          hits?: number
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          created_at: string
          id: string
          meta: Json | null
          points: number
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meta?: Json | null
          points: number
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meta?: Json | null
          points?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_consent: {
        Row: {
          accepted_at: string
          ads_personalized: boolean
          analytics: boolean
          region: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          ads_personalized?: boolean
          analytics?: boolean
          region?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          ads_personalized?: boolean
          analytics?: boolean
          region?: string | null
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          admin_notes: string | null
          amount_btc: number | null
          created_at: string
          gift_card_brand: string | null
          id: string
          points: number
          recipient_email: string | null
          status: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          admin_notes?: string | null
          amount_btc?: number | null
          created_at?: string
          gift_card_brand?: string | null
          id?: string
          points: number
          recipient_email?: string | null
          status?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          admin_notes?: string | null
          amount_btc?: number | null
          created_at?: string
          gift_card_brand?: string | null
          id?: string
          points?: number
          recipient_email?: string | null
          status?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _last_tx_at: { Args: { p_type: string; p_user: string }; Returns: string }
      award_points: {
        Args: { p_meta?: Json; p_points: number; p_type: string }
        Returns: {
          created_at: string
          email: string | null
          id: string
          last_login_date: string | null
          login_streak: number
          name: string | null
          points: number
          referral_code: string
          referred_by: string | null
          total_earned: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_spin_reward: { Args: never; Returns: Json }
      claim_tapdash_reward: {
        Args: {
          p_combo_max: number
          p_duration_ms: number
          p_hits: number
          p_score: number
        }
        Returns: Json
      }
      claim_trivia_reward: {
        Args: never
        Returns: {
          created_at: string
          email: string | null
          id: string
          last_login_date: string | null
          login_streak: number
          name: string | null
          points: number
          referral_code: string
          referred_by: string | null
          total_earned: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_video_reward: {
        Args: never
        Returns: {
          created_at: string
          email: string | null
          id: string
          last_login_date: string | null
          login_streak: number
          name: string | null
          points: number
          referral_code: string
          referred_by: string | null
          total_earned: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      daily_checkin: {
        Args: never
        Returns: {
          created_at: string
          email: string | null
          id: string
          last_login_date: string | null
          login_streak: number
          name: string | null
          points: number
          referral_code: string
          referred_by: string | null
          total_earned: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_my_account: { Args: never; Returns: undefined }
      gen_referral_code: { Args: never; Returns: string }
      request_withdrawal: {
        Args: { p_brand: string; p_email: string; p_points: number }
        Returns: {
          admin_notes: string | null
          amount_btc: number | null
          created_at: string
          gift_card_brand: string | null
          id: string
          points: number
          recipient_email: string | null
          status: string
          user_id: string
          wallet_address: string
        }
        SetofOptions: {
          from: "*"
          to: "withdrawals"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      tap_dash_weekly_leaderboard: {
        Args: never
        Returns: {
          best_score: number
          name: string
          rounds: number
          user_id: string
        }[]
      }
      trivia_daily_seed: { Args: never; Returns: number }
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
