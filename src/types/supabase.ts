import type { Database } from "./database.types";
import { SupabaseClient } from "@supabase/supabase-js";

// Typed Supabase Client
// It give auto complete on tabels and typed response
export type TypedSupabaseClient = SupabaseClient<Database>;

// Row Level helpers 
// Derive the Row, Insert, Update shapes directly from the generated types
type Tables = Database['public']['Tables'];

export type Row<T extends keyof Tables> = Tables[T]['Row'];
export type Insert<T extends keyof Tables> = Tables[T]['Insert'];
export type Update<T extends keyof Tables> = Tables[T]['Update']

// Named Row Types
// Its a base type for rows and reusable in anywhere in the app

export type UserRow = Row<'users'>;
export type HotelRow = Row<'hotels'>;

export type OrderRow = Row<'orders'>;
export type HotelTabelRow = Row<'hotel_tables'>;
export type MenuItemRow = Row<'menu_items'>;
export type OrderItemsRow = Row<'order_items'>
export type CategoryRow = Row<'categories'>;
export type MenuScanRow = Row<'menu_scans'>;
export type QrCodeRow = Row<'qr_codes'>;

export type OrderPaymentRow = Row<'order_payments'>;
export type SubscriptionRow = Row<'subscriptions'>;
export type PlanLimitsRow = Row<'plan_limits'>;


// Named Update Row Types

export type UserUpdate = Update<'users'>;
export type HotelUpdate = Update<'hotels'>;

export type OrderUpdate = Update<'orders'>;
export type HotelTabelUpdate = Update<'hotel_tables'>;
export type MenuItemUpdate = Update<'menu_items'>;
export type OrderItemsUpdate = Update<'order_items'>
export type CategoryUpdate = Update<'categories'>;
export type MenuScanUpdate = Update<'menu_scans'>;
export type QrCodeUpdate = Update<'qr_codes'>;

export type OrderPaymentUpdate = Update<'order_payments'>;
export type SubscriptionUpdate = Update<'subscriptions'>;
export type PlanLimitsUpdate = Update<'plan_limits'>;


// Named Insert Row Types

export type UserInsert = Insert<'users'>;
export type HotelInsert = Insert<'hotels'>;

export type OrderInsert = Insert<'orders'>;
export type HotelTabelInsert = Insert<'hotel_tables'>;
export type MenuItemInsert = Insert<'menu_items'>;
export type OrderItemsInsert = Insert<'order_items'>
export type CategoryInsert = Insert<'categories'>;
export type MenuScanInsert = Insert<'menu_scans'>;
export type QrCodeInsert = Insert<'qr_codes'>;

export type OrderPaymentInsert = Insert<'order_payments'>;
export type SubscriptionInsert = Insert<'subscriptions'>;
export type PlanLimitsInsert = Insert<'plan_limits'>;


// ENUMS Types

type Enum = Database['public']['Enums']


export type PlanType = Enum['plan_type']
export type SubscriptionStatus = Enum['subscription_status']
export type PaymentStatus = Enum['order_status']
export type OrderStatus = Enum['order_status']
export type AnalyticsLevel = Enum['analytics_level_type']