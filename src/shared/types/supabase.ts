export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
      bookings: {
        Row: {
          amount_paid: number | null
          amount_total: number | null
          company_id: string
          court_number: number
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: number
          metadata: Json | null
          payment_status: Database['public']['Enums']['payment_status']
          start_time: string
          status: Database['public']['Enums']['booking_status']
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          amount_total?: number | null
          company_id: string
          court_number: number
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: number
          metadata?: Json | null
          payment_status?: Database['public']['Enums']['payment_status']
          start_time: string
          status?: Database['public']['Enums']['booking_status']
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          amount_total?: number | null
          company_id?: string
          court_number?: number
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: number
          metadata?: Json | null
          payment_status?: Database['public']['Enums']['payment_status']
          start_time?: string
          status?: Database['public']['Enums']['booking_status']
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bookings_company_id_court_number_start_time_fkey'
            columns: ['company_id', 'court_number', 'start_time']
            isOneToOne: false
            referencedRelation: 'court_availabilities'
            referencedColumns: ['company_id', 'court_number', 'start_time']
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          slug: string
          sports: string
          stripe_account_details: Json | null
          stripe_account_enabled: boolean | null
          stripe_account_id: string | null
          stripe_currency: string | null
          stripe_payment_methods: string[] | null
          stripe_webhook_secret: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
          sports?: string
          stripe_account_details?: Json | null
          stripe_account_enabled?: boolean | null
          stripe_account_id?: string | null
          stripe_currency?: string | null
          stripe_payment_methods?: string[] | null
          stripe_webhook_secret?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sports?: string
          stripe_account_details?: Json | null
          stripe_account_enabled?: boolean | null
          stripe_account_id?: string | null
          stripe_currency?: string | null
          stripe_payment_methods?: string[] | null
          stripe_webhook_secret?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_products: {
        Row: {
          company_id: string
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean
          metadata: Json | null
          name: string
          price_amount: number
          stripe_payment_type: Database['public']['Enums']['stripe_payment_type'] | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          type: Database['public']['Enums']['product_type']
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name: string
          price_amount: number
          stripe_payment_type?: Database['public']['Enums']['stripe_payment_type'] | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          type: Database['public']['Enums']['product_type']
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name?: string
          price_amount?: number
          stripe_payment_type?: Database['public']['Enums']['stripe_payment_type'] | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          type?: Database['public']['Enums']['product_type']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'company_products_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      court_availabilities: {
        Row: {
          company_id: string
          court_number: number
          created_at: string
          end_time: string
          start_time: string
          status: Database['public']['Enums']['availability_status']
          updated_at: string
        }
        Insert: {
          company_id: string
          court_number: number
          created_at?: string
          end_time: string
          start_time: string
          status?: Database['public']['Enums']['availability_status']
          updated_at?: string
        }
        Update: {
          company_id?: string
          court_number?: number
          created_at?: string
          end_time?: string
          start_time?: string
          status?: Database['public']['Enums']['availability_status']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'court_availabilities_company_id_court_number_fkey'
            columns: ['company_id', 'court_number']
            isOneToOne: false
            referencedRelation: 'courts'
            referencedColumns: ['company_id', 'court_number']
          },
          {
            foreignKeyName: 'court_availabilities_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      courts: {
        Row: {
          company_id: string
          court_number: number
          created_at: string
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          court_number: number
          created_at?: string
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          court_number?: number
          created_at?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'courts_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          company_id: string | null
          created_at: string
          email: string
          id: string
          invited_by: string | null
          is_active: boolean
          joined_at: string | null
          name: string
          role: Database['public']['Enums']['member_role']
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          is_active?: boolean
          joined_at?: string | null
          name: string
          role?: Database['public']['Enums']['member_role']
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          is_active?: boolean
          joined_at?: string | null
          name?: string
          role?: Database['public']['Enums']['member_role']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'users_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gbt_bit_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_bool_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_bool_fetch: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_bpchar_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_bytea_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_cash_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_cash_fetch: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_date_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_date_fetch: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_decompress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_enum_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_enum_fetch: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_float4_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_float4_fetch: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_float8_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_float8_fetch: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_inet_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_int2_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_int2_fetch: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_int4_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_int4_fetch: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_int8_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_int8_fetch: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_intv_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_intv_decompress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_intv_fetch: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_macad_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_macad_fetch: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_macad8_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_macad8_fetch: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_numeric_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_oid_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_oid_fetch: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_text_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_time_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_time_fetch: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_timetz_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_ts_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_ts_fetch: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_tstz_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_uuid_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_uuid_fetch: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_var_decompress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbt_var_fetch: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbtreekey_var_in: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbtreekey_var_out: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbtreekey16_in: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbtreekey16_out: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbtreekey2_in: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbtreekey2_out: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbtreekey32_in: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbtreekey32_out: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbtreekey4_in: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbtreekey4_out: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbtreekey8_in: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gbtreekey8_out: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
    }
    Enums: {
      availability_status: 'available' | 'held' | 'booked' | 'past'
      booking_status: 'confirmed' | 'cancelled' | 'pending'
      member_role: 'owner' | 'admin' | 'member'
      payment_status: 'paid' | 'refunded' | 'failed' | 'processing' | 'pending'
      product_type: 'court_rental' | 'equipment'
      stripe_payment_type: 'recurring' | 'one_time'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never
