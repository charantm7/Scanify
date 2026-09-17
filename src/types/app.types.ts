import type {
    UserRow,
    HotelRow,
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
    maxMenus: number;
    menuCount: number;
    maxMenuItems: number;
    maxItemsWithImages: number;
    maxImagesPerItem: number;
    advancedItemDetails: boolean;
    qrCustomizationLevel: 'none' | 'basic' | 'advanced';
    analyticsExportEnabled: boolean;
    maxQrCodes: number;
    maxBranches: number;
    maxStaffAccounts: number;

    // Analytics
    analyticsLevel: AnalyticsLevel;
    hasBasicAnalytics: boolean;
    hasAdvancedAnalytics: boolean;

    // Feature flags
    removeBranding: boolean;
    customBranding: boolean;
    advancedCustom: boolean;
    customSubdomain: boolean;
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
    isAtMenuCountLimit: boolean;
    hasMenuOverflow: boolean;
    canAddMenu: boolean;
    canAddMenuItem: boolean;
    canExportAnalytics: boolean;
    canUseAdvancedItemDetails: boolean;
    canCustomizeQr: boolean;
    canUseAdvancedQrCustomization: boolean;
    canViewBasicAnalytics: boolean;
    canViewAdvancedAnalytics: boolean;
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