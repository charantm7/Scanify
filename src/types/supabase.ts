import { Database } from "./database.types";


export type User =
    Database["public"]["Tables"]["users"]["Row"];

export type UserInsert =
    Database["public"]["Tables"]["users"]["Insert"];

export type UserUpdate =
    Database["public"]["Tables"]["users"]["Update"];

export type Hotel =
    Database["public"]["Tables"]["hotels"]["Row"];

export type HotelInsert =
    Database["public"]["Tables"]["hotels"]["Insert"];

export type HotelUpdate =
    Database["public"]["Tables"]["hotels"]["Update"];

export type Category =
    Database["public"]["Tables"]["categories"]["Row"];

export type CategoryInsert =
    Database["public"]["Tables"]["categories"]["Insert"];

export type CategoryUpdate =
    Database["public"]["Tables"]["categories"]["Update"];

export type MenuItem =
    Database["public"]["Tables"]["menu_items"]["Row"];

export type MenuItemInsert =
    Database["public"]["Tables"]["menu_items"]["Insert"];

export type MenuItemUpdate =
    Database["public"]["Tables"]["menu_items"]["Update"];

export type MenuScan =
    Database["public"]["Tables"]["menu_scans"]["Row"];

export type MenuScanInsert =
    Database["public"]["Tables"]["menu_scans"]["Insert"];

export type MenuScanUpdate =
    Database["public"]["Tables"]["menu_scans"]["Update"];

export type QRCode =
    Database["public"]["Tables"]["qr_codes"]["Row"];

export type QRCodeInsert =
    Database["public"]["Tables"]["qr_codes"]["Insert"];

export type QRCodeUpdate =
    Database["public"]["Tables"]["qr_codes"]["Update"];

export type HotelTable =
    Database["public"]["Tables"]["hotel_tables"]["Row"];

export type HotelTableInsert =
    Database["public"]["Tables"]["hotel_tables"]["Insert"];

export type HotelTableUpdate =
    Database["public"]["Tables"]["hotel_tables"]["Update"];

export type Order =
    Database["public"]["Tables"]["orders"]["Row"];

export type OrderInsert =
    Database["public"]["Tables"]["orders"]["Insert"];

export type OrderUpdate =
    Database["public"]["Tables"]["orders"]["Update"];

export type OrderItem =
    Database["public"]["Tables"]["order_items"]["Row"];

export type OrderItemInsert =
    Database["public"]["Tables"]["order_items"]["Insert"];

export type OrderItemUpdate =
    Database["public"]["Tables"]["order_items"]["Update"];

export type OrderPayment =
    Database["public"]["Tables"]["order_payments"]["Row"];

export type OrderPaymentInsert =
    Database["public"]["Tables"]["order_payments"]["Insert"];

export type OrderPaymentUpdate =
    Database["public"]["Tables"]["order_payments"]["Update"];

export type Subscription =
    Database["public"]["Tables"]["subscriptions"]["Row"];

export type SubscriptionInsert =
    Database["public"]["Tables"]["subscriptions"]["Insert"];

export type SubscriptionUpdate =
    Database["public"]["Tables"]["subscriptions"]["Update"];

export type PlanLimit =
    Database["public"]["Tables"]["plan_limits"]["Row"];

export type PlanLimitInsert =
    Database["public"]["Tables"]["plan_limits"]["Insert"];

export type PlanLimitUpdate =
    Database["public"]["Tables"]["plan_limits"]["Update"];


// ENUMS

export type PlanType =
    Database["public"]["Enums"]["plan_type"];

export type SubscriptionStatus =
    Database["public"]["Enums"]["subscription_status"];

export type PaymentStatus =
    Database["public"]["Enums"]["payment_status"];

export type OrderStatus =
    Database["public"]["Enums"]["order_status"];

export type AnalyticsLevel =
    Database["public"]["Enums"]["analytics_level_type"];