import type {
    UserRow,
    HotelRow,
    OrderRow,
    OrderItemsRow,
    MenuItemRow,
    MenuScanRow,
    HotelTabelRow,
    CategoryRow,
    QrCodeRow,
    OrderPaymentRow,
    SubscriptionRow,
    PlanLimitsRow,

    TypedSupabaseClient,

    PlanType,
    SubscriptionStatus,
    AnalyticsLevel

} from './supabase'

// Plans Display Config
// Single source of plan record used over the app UI

export const PLAN_LABELS: Record<PlanType, string> = {
    basic: 'Basic',
    starter: 'Starter',
    growth: 'Growth',
    pro: 'Pro'
} as const;


export interface SubscriptionState {

    subStatus: SubscriptionStatus | null;
    isTrialing: boolean;
    isActive: boolean;
    isCancelled: boolean;
    isExpired: boolean;
    isPastDue: boolean;
    isSubscriptionOk: boolean;
    isTrialExpired: boolean;
    trialEndsAt: Date | null;
    trialHoursLeft: number;
    trialDaysLeft: number;
}


export interface PlanCapabilities {
    // Limits
    maxMenuItems: number;
    maxItemsWithImages: number;
    maxOrdersPerMonth: number;
    maxQrCodes: number;
    maxBranches: number;
    maxStaffAccounts: number;

    // Analytics
    analyticsLevel: AnalyticsLevel;
    hasBasicAnalytics: boolean;
    hasAdvancedAnalytics: boolean;

    // Feature flags
    orderingEnabled: boolean;
    realtimeKitchen: boolean;
    removeBranding: boolean;
    customBranding: boolean;
    advancedCustom: boolean;
    customSubdomain: boolean;
    ratingsEnabled: boolean;
    googleReviews: boolean;
    availabilityToggle: boolean;
    advancedCategories: boolean;
    multiBranchEnabled: boolean;
    staffEnabled: boolean;
    prioritySupport: boolean;
}


export interface ActionGuards {
    isActionBlocked: boolean;
    isAtMenuLimit: boolean;
    canAddMenuItem: boolean;
    canUseOrdering: boolean;
    canUseKitchenDisplay: boolean;
    canViewBasicAnalytics: boolean;
    canViewAdvancedAnalytics: boolean;
    canUseRatings: boolean;
    canUseGoogleReviews: boolean;
    canToggleAvailability: boolean;
    canManageMultiBranch: boolean;
    canManageStaff: boolean;
    canUseCustomBranding: boolean;
    canUseAdvancedCustom: boolean;
    canUseCustomSubdomain: boolean;
    canRemoveBranding: boolean;
}


export interface AppContextValue
    extends SubscriptionState,
    PlanCapabilities,
    ActionGuards {

    supabase: TypedSupabaseClient;

    user: import('@supabase/supabase-js').User | null;
    profile: UserRow | null;
    hotel: HotelRow | null;
    subscription: SubscriptionRow | null;
    planLimits: PlanLimitsRow | null;

    menuItemCount: number;

    loading: boolean;
    error: string | null;

    plan: PlanType,
    PlanLabel: string

    refreshMenuCount: () => Promise<void>;
    refreshHotel: () => Promise<void>;
    updateProfileLocally: (patch: Partial<UserRow>) => void;
}


export interface BootstrapData {
    profile: UserRow | null;
    hotel: HotelRow | null;
    subscription: SubscriptionRow | null;
    planLimits: PlanLimitsRow | null;
}

export interface PanelBaseProps {
    className?: string;
}

export interface WithLoadingProps {
    isLoading?: boolean;
}