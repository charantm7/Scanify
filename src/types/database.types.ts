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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categories: {
        Row: {
          cover_image: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          hotel_id: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          hotel_id: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          hotel_id?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_tables: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          is_active: boolean
          label: string | null
          table_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          is_active?: boolean
          label?: string | null
          table_number: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          is_active?: boolean
          label?: string | null
          table_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_tables_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          address: string | null
          close_time: string | null
          cover_image_url: string | null
          created_at: string
          cuisine_type: string[] | null
          currency: string
          deleted_at: string | null
          description: string | null
          google_maps_url: string | null
          id: string
          is_active: boolean
          is_open: boolean | null
          logo_url: string | null
          name: string
          open_time: string | null
          owner_id: string
          phone: string | null
          pincode: string | null
          rating: number | null
          restaurant_type: string[] | null
          review_count: number | null
          service_type: string[] | null
          slug: string | null
          theme_color: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          close_time?: string | null
          cover_image_url?: string | null
          created_at?: string
          cuisine_type?: string[] | null
          currency?: string
          deleted_at?: string | null
          description?: string | null
          google_maps_url?: string | null
          id?: string
          is_active?: boolean
          is_open?: boolean | null
          logo_url?: string | null
          name: string
          open_time?: string | null
          owner_id: string
          phone?: string | null
          pincode?: string | null
          rating?: number | null
          restaurant_type?: string[] | null
          review_count?: number | null
          service_type?: string[] | null
          slug?: string | null
          theme_color?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          close_time?: string | null
          cover_image_url?: string | null
          created_at?: string
          cuisine_type?: string[] | null
          currency?: string
          deleted_at?: string | null
          description?: string | null
          google_maps_url?: string | null
          id?: string
          is_active?: boolean
          is_open?: boolean | null
          logo_url?: string | null
          name?: string
          open_time?: string | null
          owner_id?: string
          phone?: string | null
          pincode?: string | null
          rating?: number | null
          restaurant_type?: string[] | null
          review_count?: number | null
          service_type?: string[] | null
          slug?: string | null
          theme_color?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      menu_customizations: {
        Row: {
          accent_color: string
          background_color: string
          base_font_size: number
          border_radius: number
          category_style: Database["public"]["Enums"]["category_style"]
          created_at: string
          font_family: Database["public"]["Enums"]["font_family"]
          heading_weight: number
          hotel_id: string
          id: string
          menu_layout: Database["public"]["Enums"]["menu_layout"]
          muted_color: string
          primary_color: string
          shadow_intensity: Database["public"]["Enums"]["shadow_intensity"]
          show_address: boolean
          show_categories: boolean
          show_cover_image: boolean
          show_descriptions: boolean
          show_dietary_badge: boolean
          show_item_images: boolean
          show_logo: boolean
          show_ratings: boolean
          show_scanify_badge: boolean
          show_search: boolean
          show_serving_size: boolean
          show_spice_level: boolean
          show_tags: boolean
          surface_color: string
          text_color: string
          updated_at: string
        }
        Insert: {
          accent_color?: string
          background_color?: string
          base_font_size?: number
          border_radius?: number
          category_style?: Database["public"]["Enums"]["category_style"]
          created_at?: string
          font_family?: Database["public"]["Enums"]["font_family"]
          heading_weight?: number
          hotel_id: string
          id?: string
          menu_layout?: Database["public"]["Enums"]["menu_layout"]
          muted_color?: string
          primary_color?: string
          shadow_intensity?: Database["public"]["Enums"]["shadow_intensity"]
          show_address?: boolean
          show_categories?: boolean
          show_cover_image?: boolean
          show_descriptions?: boolean
          show_dietary_badge?: boolean
          show_item_images?: boolean
          show_logo?: boolean
          show_ratings?: boolean
          show_scanify_badge?: boolean
          show_search?: boolean
          show_serving_size?: boolean
          show_spice_level?: boolean
          show_tags?: boolean
          surface_color?: string
          text_color?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string
          background_color?: string
          base_font_size?: number
          border_radius?: number
          category_style?: Database["public"]["Enums"]["category_style"]
          created_at?: string
          font_family?: Database["public"]["Enums"]["font_family"]
          heading_weight?: number
          hotel_id?: string
          id?: string
          menu_layout?: Database["public"]["Enums"]["menu_layout"]
          muted_color?: string
          primary_color?: string
          shadow_intensity?: Database["public"]["Enums"]["shadow_intensity"]
          show_address?: boolean
          show_categories?: boolean
          show_cover_image?: boolean
          show_descriptions?: boolean
          show_dietary_badge?: boolean
          show_item_images?: boolean
          show_logo?: boolean
          show_ratings?: boolean
          show_scanify_badge?: boolean
          show_search?: boolean
          show_serving_size?: boolean
          show_spice_level?: boolean
          show_tags?: boolean
          surface_color?: string
          text_color?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_customizations_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: true
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_images: {
        Row: {
          alt_text: string | null
          created_at: string
          hotel_id: string
          id: string
          is_primary: boolean
          item_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          hotel_id: string
          id?: string
          is_primary?: boolean
          item_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          hotel_id?: string
          id?: string
          is_primary?: boolean
          item_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_images_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_images_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergens: string[] | null
          calories: number | null
          category_id: string
          created_at: string
          deleted_at: string | null
          description: string | null
          dietary_type: string | null
          hotel_id: string
          id: string
          image_url: string | null
          ingredients: string[] | null
          is_available: boolean
          name: string
          preparation_time: number | null
          price: number
          serving_size: string | null
          sort_order: number
          spice_level: string | null
          tags: string[] | null
          updated_at: string
          variants: string[] | null
        }
        Insert: {
          allergens?: string[] | null
          calories?: number | null
          category_id: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          dietary_type?: string | null
          hotel_id: string
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_available?: boolean
          name: string
          preparation_time?: number | null
          price?: number
          serving_size?: string | null
          sort_order?: number
          spice_level?: string | null
          tags?: string[] | null
          updated_at?: string
          variants?: string[] | null
        }
        Update: {
          allergens?: string[] | null
          calories?: number | null
          category_id?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          dietary_type?: string | null
          hotel_id?: string
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_available?: boolean
          name?: string
          preparation_time?: number | null
          price?: number
          serving_size?: string | null
          sort_order?: number
          spice_level?: string | null
          tags?: string[] | null
          updated_at?: string
          variants?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_scans: {
        Row: {
          city: string | null
          country_code: string | null
          event_type: string
          hotel_id: string
          id: string
          item_id: string | null
          metadata: Json | null
          qr_code_id: string | null
          referrer: string | null
          scanned_at: string
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          city?: string | null
          country_code?: string | null
          event_type?: string
          hotel_id: string
          id?: string
          item_id?: string | null
          metadata?: Json | null
          qr_code_id?: string | null
          referrer?: string | null
          scanned_at?: string
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          city?: string | null
          country_code?: string | null
          event_type?: string
          hotel_id?: string
          id?: string
          item_id?: string | null
          metadata?: Json | null
          qr_code_id?: string | null
          referrer?: string | null
          scanned_at?: string
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_scans_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_scans_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_scans_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_themes: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_public: boolean
          name: string
          thumbnail_url: string | null
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_public?: boolean
          name: string
          thumbnail_url?: string | null
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_name: string
          item_price: number
          menu_item_id: string | null
          order_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          item_price: number
          menu_item_id?: string | null
          order_id: string
          quantity: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          item_price?: number
          menu_item_id?: string | null
          order_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_payments: {
        Row: {
          amount: number
          created_at: string
          hotel_id: string
          id: string
          order_id: string
          provider: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          hotel_id: string
          id?: string
          order_id: string
          provider?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          hotel_id?: string
          id?: string
          order_id?: string
          provider?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_payments_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          hotel_id: string
          id: string
          notes: string | null
          source: string | null
          status: Database["public"]["Enums"]["order_status"]
          table_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          hotel_id: string
          id?: string
          notes?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          table_id: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          hotel_id?: string
          id?: string
          notes?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          table_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "hotel_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_limits: {
        Row: {
          advanced_category_management: boolean
          advanced_customization: boolean
          analytics_level: Database["public"]["Enums"]["analytics_level_type"]
          created_at: string
          custom_branding: boolean
          custom_subdomain: boolean
          google_reviews_integration: boolean
          item_availability_toggle: boolean
          max_branches: number
          max_items_with_images: number
          max_menu_items: number
          max_orders_per_month: number
          max_qr_codes: number
          max_staff_accounts: number
          multi_branch_enabled: boolean
          ordering_enabled: boolean
          plan: Database["public"]["Enums"]["plan_type"]
          priority_support: boolean
          ratings_enabled: boolean
          realtime_kitchen: boolean
          remove_branding: boolean
          staff_accounts_enabled: boolean
          trial_days: number
          updated_at: string
        }
        Insert: {
          advanced_category_management: boolean
          advanced_customization: boolean
          analytics_level: Database["public"]["Enums"]["analytics_level_type"]
          created_at?: string
          custom_branding: boolean
          custom_subdomain: boolean
          google_reviews_integration: boolean
          item_availability_toggle: boolean
          max_branches: number
          max_items_with_images: number
          max_menu_items: number
          max_orders_per_month: number
          max_qr_codes?: number
          max_staff_accounts: number
          multi_branch_enabled: boolean
          ordering_enabled: boolean
          plan: Database["public"]["Enums"]["plan_type"]
          priority_support: boolean
          ratings_enabled: boolean
          realtime_kitchen: boolean
          remove_branding: boolean
          staff_accounts_enabled: boolean
          trial_days?: number
          updated_at?: string
        }
        Update: {
          advanced_category_management?: boolean
          advanced_customization?: boolean
          analytics_level?: Database["public"]["Enums"]["analytics_level_type"]
          created_at?: string
          custom_branding?: boolean
          custom_subdomain?: boolean
          google_reviews_integration?: boolean
          item_availability_toggle?: boolean
          max_branches?: number
          max_items_with_images?: number
          max_menu_items?: number
          max_orders_per_month?: number
          max_qr_codes?: number
          max_staff_accounts?: number
          multi_branch_enabled?: boolean
          ordering_enabled?: boolean
          plan?: Database["public"]["Enums"]["plan_type"]
          priority_support?: boolean
          ratings_enabled?: boolean
          realtime_kitchen?: boolean
          remove_branding?: boolean
          staff_accounts_enabled?: boolean
          trial_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          label: string
          scan_count: number
          target_url: string
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          label?: string
          scan_count?: number
          target_url: string
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          label?: string
          scan_count?: number
          target_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          hotel_id: string
          id: string
          payment_provider: string | null
          plan: Database["public"]["Enums"]["plan_type"]
          provider_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          hotel_id: string
          id?: string
          payment_provider?: string | null
          plan?: Database["public"]["Enums"]["plan_type"]
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          hotel_id?: string
          id?: string
          payment_provider?: string | null
          plan?: Database["public"]["Enums"]["plan_type"]
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: true
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_verified: boolean
          name: string | null
          onboarding_complete: boolean
          phone: string | null
          plan: Database["public"]["Enums"]["plan_type"]
          restaurant_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          is_verified?: boolean
          name?: string | null
          onboarding_complete?: boolean
          phone?: string | null
          plan?: Database["public"]["Enums"]["plan_type"]
          restaurant_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_verified?: boolean
          name?: string | null
          onboarding_complete?: boolean
          phone?: string | null
          plan?: Database["public"]["Enums"]["plan_type"]
          restaurant_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      analytics_level_type: "none" | "basic" | "advanced"
      category_style: "pill" | "underline" | "card"
      dietary_flag:
      | "veg"
      | "non_veg"
      | "vegan"
      | "jain"
      | "gluten_free"
      | "dairy"
      | "egg"
      font_family:
      | "inter"
      | "poppins"
      | "syne"
      | "outfit"
      | "playfair"
      | "dm_sans"
      menu_layout: "card" | "list" | "grid"
      order_status:
      | "pending"
      | "accepted"
      | "preparing"
      | "ready"
      | "served"
      | "cancelled"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      plan_type: "basic" | "starter" | "growth" | "pro"
      restaurant_type:
      | "restaurant"
      | "cafe"
      | "bakery"
      | "food_court"
      | "cloud_kitchen"
      | "bar_restaurant"
      | "hotel_restaurant"
      shadow_intensity: "none" | "soft" | "medium" | "strong"
      spice_level: "none" | "mild" | "medium" | "hot" | "extra_hot"
      subscription_status:
      | "trialing"
      | "active"
      | "cancelled"
      | "expired"
      | "past_due"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      analytics_level_type: ["none", "basic", "advanced"],
      category_style: ["pill", "underline", "card"],
      dietary_flag: [
        "veg",
        "non_veg",
        "vegan",
        "jain",
        "gluten_free",
        "dairy",
        "egg",
      ],
      font_family: [
        "inter",
        "poppins",
        "syne",
        "outfit",
        "playfair",
        "dm_sans",
      ],
      menu_layout: ["card", "list", "grid"],
      order_status: [
        "pending",
        "accepted",
        "preparing",
        "ready",
        "served",
        "cancelled",
      ],
      payment_status: ["pending", "paid", "failed", "refunded"],
      plan_type: ["basic", "starter", "growth", "pro"],
      restaurant_type: [
        "restaurant",
        "cafe",
        "bakery",
        "food_court",
        "cloud_kitchen",
        "bar_restaurant",
        "hotel_restaurant",
      ],
      shadow_intensity: ["none", "soft", "medium", "strong"],
      spice_level: ["none", "mild", "medium", "hot", "extra_hot"],
      subscription_status: [
        "trialing",
        "active",
        "cancelled",
        "expired",
        "past_due",
      ],
    },
  },
} as const
