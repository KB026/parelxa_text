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
      agent_interactions: {
        Row: {
          action_type: string
          agent_id: number
          created_at: string | null
          id: string
          user_id: string | null
          traffic_source: string | null
          visitor_location: string | null
          search_keyword: string | null
        }
        Insert: {
          action_type: string
          agent_id: number
          created_at?: string | null
          id?: string
          user_id?: string | null
          traffic_source?: string | null
          visitor_location?: string | null
          search_keyword?: string | null
        }
        Update: {
          action_type?: string
          agent_id?: number
          created_at?: string | null
          id?: string
          user_id?: string | null
          traffic_source?: string | null
          visitor_location?: string | null
          search_keyword?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_interactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          admin_feedback: string | null
          ai_score: number | null
          ai_scores: Json | null
          approval_status: string | null
          category: string | null
          city: string | null
          company_blurb: string | null
          company_gstin: string | null
          company_linkedin: string | null
          company_name: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          deleted_at: string | null
          demo_url: string | null
          description: string | null
          discovered_date: string | null
          features: string[] | null
          founded_year: number | null
          founder_linkedin: string | null
          founders: string | null
          free_trial: string | null
          has_india_pricing: boolean | null
          id: number
          industries: string[] | null
          inr_price: string | null
          is_featured: boolean | null
          is_deleted: boolean | null
          is_maker_claimed: boolean | null
          is_pinned_trending: boolean | null
          is_verified: boolean | null
          listing_expires_at: string | null
          logo_url: string | null
          name: string
          one_liner: string | null
          price_range: string | null
          pricing: string | null
          pricing_model: string | null
          rating: number | null
          quality_notes: string | null
          quality_score: number | null
          raw_industry: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviews: number | null
          reviews_count: number | null
          score_authenticity: number | null
          score_business: number | null
          score_category: number | null
          score_cost: number | null
          score_reasoning: Json | null
          score_reviews: number | null
          score_total: number | null
          screenshots: string[] | null
          slug: string | null
          source_name: string | null
          source_url: string | null
          sub_category: string | null
          subscription_id: string | null
          subscription_status: string | null
          summary: string | null
          tags: string[] | null
          team_size: string | null
          total_saves: number | null
          total_views: number | null
          trending_score: number | null
          updated_at: string | null
          use_cases: string | null
          user_email: string | null
          user_id: string | null
          video_url: string | null
          website: string | null
        }
        Insert: {
          admin_feedback?: string | null
          ai_score?: number | null
          ai_scores?: Json | null
          approval_status?: string | null
          category?: string | null
          city?: string | null
          company_blurb?: string | null
          company_gstin?: string | null
          company_linkedin?: string | null
          company_name?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          deleted_at?: string | null
          demo_url?: string | null
          description?: string | null
          discovered_date?: string | null
          features?: string[] | null
          founded_year?: number | null
          founder_linkedin?: string | null
          founders?: string | null
          free_trial?: string | null
          has_india_pricing?: boolean | null
          id?: number
          industries?: string[] | null
          inr_price?: string | null
          is_featured?: boolean | null
          is_deleted?: boolean | null
          is_maker_claimed?: boolean | null
          is_pinned_trending?: boolean | null
          is_verified?: boolean | null
          listing_expires_at?: string | null
          logo_url?: string | null
          name: string
          one_liner?: string | null
          price_range?: string | null
          pricing?: string | null
          pricing_model?: string | null
          rating?: number | null
          quality_notes?: string | null
          quality_score?: number | null
          raw_industry?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviews?: number | null
          reviews_count?: number | null
          score_authenticity?: number | null
          score_business?: number | null
          score_category?: number | null
          score_cost?: number | null
          score_reasoning?: Json | null
          score_reviews?: number | null
          score_total?: number | null
          screenshots?: string[] | null
          slug?: string | null
          source_name?: string | null
          source_url?: string | null
          sub_category?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          summary?: string | null
          tags?: string[] | null
          team_size?: string | null
          total_saves?: number | null
          total_views?: number | null
          trending_score?: number | null
          updated_at?: string | null
          use_cases?: string | null
          user_email?: string | null
          user_id?: string | null
          video_url?: string | null
          website?: string | null
        }
        Update: {
          admin_feedback?: string | null
          ai_score?: number | null
          ai_scores?: Json | null
          approval_status?: string | null
          category?: string | null
          city?: string | null
          company_blurb?: string | null
          company_gstin?: string | null
          company_linkedin?: string | null
          company_name?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          deleted_at?: string | null
          demo_url?: string | null
          description?: string | null
          discovered_date?: string | null
          features?: string[] | null
          founded_year?: number | null
          founder_linkedin?: string | null
          founders?: string | null
          free_trial?: string | null
          has_india_pricing?: boolean | null
          id?: number
          industries?: string[] | null
          inr_price?: string | null
          is_featured?: boolean | null
          is_deleted?: boolean | null
          is_maker_claimed?: boolean | null
          is_pinned_trending?: boolean | null
          is_verified?: boolean | null
          listing_expires_at?: string | null
          logo_url?: string | null
          name?: string
          one_liner?: string | null
          price_range?: string | null
          pricing?: string | null
          pricing_model?: string | null
          rating?: number | null
          quality_notes?: string | null
          quality_score?: number | null
          raw_industry?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviews?: number | null
          reviews_count?: number | null
          score_authenticity?: number | null
          score_business?: number | null
          score_category?: number | null
          score_cost?: number | null
          score_reasoning?: Json | null
          score_reviews?: number | null
          score_total?: number | null
          screenshots?: string[] | null
          slug?: string | null
          source_name?: string | null
          source_url?: string | null
          sub_category?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          summary?: string | null
          tags?: string[] | null
          team_size?: string | null
          total_saves?: number | null
          total_views?: number | null
          trending_score?: number | null
          updated_at?: string | null
          use_cases?: string | null
          user_email?: string | null
          user_id?: string | null
          video_url?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["name"]
          },
        ]
      }
      categories: {
        Row: {
          color: string
          description: string | null
          icon: string
          id: number
          name: string
        }
        Insert: {
          color: string
          description?: string | null
          icon: string
          id?: number
          name: string
        }
        Update: {
          color?: string
          description?: string | null
          icon?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      external_reviews: {
        Row: {
          agent_id: number | null
          created_at: string | null
          id: number
          last_fetched_at: string | null
          platform: string | null
          rating: number | null
          reviews_count: number | null
          snippet: string | null
          source: string
          source_url: string | null
          status: string | null
          url: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          agent_id?: number | null
          created_at?: string | null
          id?: number
          last_fetched_at?: string | null
          platform?: string | null
          rating?: number | null
          reviews_count?: number | null
          snippet?: string | null
          source?: string
          source_url?: string | null
          status?: string | null
          url?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          agent_id?: number | null
          created_at?: string | null
          id?: number
          last_fetched_at?: string | null
          platform?: string | null
          rating?: number | null
          reviews_count?: number | null
          snippet?: string | null
          source?: string
          source_url?: string | null
          status?: string | null
          url?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_reviews_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_claims: {
        Row: {
          agent_id: number | null
          created_at: string | null
          id: number
          note: string | null
          role: string
          status: string | null
          updated_at: string | null
          user_id: string | null
          verification_token: string | null
          work_email: string
        }
        Insert: {
          agent_id?: number | null
          created_at?: string | null
          id?: number
          note?: string | null
          role: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_token?: string | null
          work_email: string
        }
        Update: {
          agent_id?: number | null
          created_at?: string | null
          id?: number
          note?: string | null
          role?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_token?: string | null
          work_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_claims_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_reports: {
        Row: {
          created_at: string | null
          details: string | null
          id: number
          reason: string
          reporter_id: string | null
          status: string | null
          target_id: number
          target_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          id?: number
          reason: string
          reporter_id?: string | null
          status?: string | null
          target_id: number
          target_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          details?: string | null
          id?: number
          reason?: string
          reporter_id?: string | null
          status?: string | null
          target_id?: number
          target_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          industry: string | null
          is_admin: boolean | null
          is_suspended: boolean | null
          phone: string | null
          role: string | null
          updated_at: string | null
          welcome_email_sent: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          industry?: string | null
          is_admin?: boolean | null
          is_suspended?: boolean | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          welcome_email_sent?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          is_admin?: boolean | null
          is_suspended?: boolean | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          welcome_email_sent?: boolean | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          agent_id: number | null
          amount: number
          clicks: number | null
          created_at: string | null
          currency: string | null
          end_date: string
          id: string
          impressions: number | null
          plan: string
          start_date: string | null
          status: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          agent_id?: number | null
          amount: number
          clicks?: number | null
          created_at?: string | null
          currency?: string | null
          end_date: string
          id?: string
          impressions?: number | null
          plan: string
          start_date?: string | null
          status?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          agent_id?: number | null
          amount?: number
          clicks?: number | null
          created_at?: string | null
          currency?: string | null
          end_date?: string
          id?: string
          impressions?: number | null
          plan?: string
          start_date?: string | null
          status?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      review_responses: {
        Row: {
          content: string
          created_at: string | null
          review_id: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          review_id: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          review_id?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_votes: {
        Row: {
          created_at: string | null
          review_id: string
          user_id: string
          vote_type: string | null
        }
        Insert: {
          created_at?: string | null
          review_id: string
          user_id: string
          vote_type?: string | null
        }
        Update: {
          created_at?: string | null
          review_id?: string
          user_id?: string
          vote_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          agent_id: number
          approval_status: string | null
          content: string
          created_at: string | null
          id: string
          is_reported: boolean | null
          rating_ease_use: number | null
          rating_overall: number | null
          rating_relevance: number | null
          rating_support: number | null
          rating_value: number | null
          recommend: boolean | null
          updated_at: string | null
          use_case: string | null
          user_id: string
        }
        Insert: {
          agent_id: number
          approval_status?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_reported?: boolean | null
          rating_ease_use?: number | null
          rating_overall?: number | null
          rating_relevance?: number | null
          rating_support?: number | null
          rating_value?: number | null
          recommend?: boolean | null
          updated_at?: string | null
          use_case?: string | null
          user_id: string
        }
        Update: {
          agent_id?: number
          approval_status?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_reported?: boolean | null
          rating_ease_use?: number | null
          rating_overall?: number | null
          rating_relevance?: number | null
          rating_support?: number | null
          rating_value?: number | null
          recommend?: boolean | null
          updated_at?: string | null
          use_case?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_tools: {
        Row: {
          agent_id: number
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          agent_id: number
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          agent_id?: number
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_tools_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      search_logs: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          query: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          query: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          query?: string
          user_id?: string | null
        }
        Relationships: []
      }
      search_queries: {
        Row: {
          created_at: string | null
          id: string
          is_ai_powered: boolean | null
          query: string
          recommendation_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_ai_powered?: boolean | null
          query: string
          recommendation_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_ai_powered?: boolean | null
          query?: string
          recommendation_count?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: number
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          id?: number
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          id?: number
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      tools: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          status: string | null
          tagline: string | null
          website_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          status?: string | null
          tagline?: string | null
          website_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          status?: string | null
          tagline?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          agent_id: number | null
          amount: number
          created_at: string | null
          currency: string | null
          gateway: string | null
          gateway_order_id: string | null
          gateway_payment_id: string | null
          id: string
          renewal_date: string | null
          status: string | null
          subscription_id: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: number | null
          amount: number
          created_at?: string | null
          currency?: string | null
          gateway?: string | null
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          id?: string
          renewal_date?: string | null
          status?: string | null
          subscription_id?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: number | null
          amount?: number
          created_at?: string | null
          currency?: string | null
          gateway?: string | null
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          id?: string
          renewal_date?: string | null
          status?: string | null
          subscription_id?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          agent_id: number | null
          company_name: string
          company_website: string
          created_at: string | null
          gst_number: string
          id: number
          press_mentions: string | null
          product_demo_url: string
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          work_email: string
        }
        Insert: {
          agent_id?: number | null
          company_name: string
          company_website: string
          created_at?: string | null
          gst_number: string
          id?: number
          press_mentions?: string | null
          product_demo_url: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          work_email: string
        }
        Update: {
          agent_id?: number | null
          company_name?: string
          company_website?: string
          created_at?: string | null
          gst_number?: string
          id?: number
          press_mentions?: string | null
          product_demo_url?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          work_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_promotion: {
        Args: {
          p_agent_id: number
          p_amount: number
          p_payment_id: string
          p_plan: string
        }
        Returns: Json
      }
      calculate_weekly_trending_scores: { Args: never; Returns: undefined }
      increment_clicks: { Args: { promotion_id: string }; Returns: undefined }
      increment_impressions: {
        Args: { promotion_ids: string[] }
        Returns: undefined
      }
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
