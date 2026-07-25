'use client';


import { useApp } from "../context/AppContext";


export function usePlan() {
    const {
        // Plan Identidy
        plan,
        planLabel,

        // Subscription status
        subStatus,
        isTrialing,
        isActive,
        isCancelled,
        isExpired,
        isPastDue,
        isSubscriptionOk,
        isTrialExpired,
        trialHoursLeft,
        trialDaysLeft,

        // Raw item limit list (from plan_limit tabel)
        maxMenuItems,
        maxItemsWithImages,
        maxOrdersPerMonth,
        maxQrCodes,
        maxBranches,
        maxStaffAccounts,

        // Feature flags
        orderingEnabled,
        realtimeKitchen,
        removeBranding,
        customBranding,
        advancedCustom,
        customSubdomain,
        analyticsLevel,
        hasBasicAnalytics,
        hasAdvancedAnalytics,
        ratingsEnabled,
        googleReviews,
        availabilityToggle,
        advancedCategories,
        multiBranchEnabled,
        staffEnabled,
        prioritySupport,

        // Action flags UI usage
        isActionBlocked,
        isAtMenuLimit,
        canAddMenuItem,
        canUseOrdering,
        canUseKitchenDisplay,
        canViewBasicAnalytics,
        canViewAdvancedAnalytics,
        canUseRatings,
        canUseGoogleReviews,
        canToggleAvailability,
        canManageMultiBranch,
        canManageStaff,
        canUseCustomBranding,
        canUseAdvancedCustom,
        canUseCustomSubdomain,
        canRemoveBranding,

    } = useApp()

    return {
        // Plan identity
        plan,
        planLabel,

        // Subscription state
        subStatus,
        isTrialing,
        isActive,
        isCancelled,
        isExpired,
        isPastDue,
        isSubscriptionOk,
        isTrialExpired,
        trialDaysLeft,
        trialHoursLeft,

        // Raw limits
        maxMenuItems,
        maxItemsWithImages,
        maxOrdersPerMonth,
        maxQrCodes,
        maxBranches,
        maxStaffAccounts,

        // Feature flags
        orderingEnabled,
        realtimeKitchen,
        removeBranding,
        customBranding,
        advancedCustom,
        customSubdomain,
        analyticsLevel,
        hasBasicAnalytics,
        hasAdvancedAnalytics,
        ratingsEnabled,
        googleReviews,
        availabilityToggle,
        advancedCategories,
        multiBranchEnabled,
        staffEnabled,
        prioritySupport,

        // Action guards
        isActionBlocked,
        isAtMenuLimit,
        canAddMenuItem,
        canUseOrdering,
        canUseKitchenDisplay,
        canViewBasicAnalytics,
        canViewAdvancedAnalytics,
        canUseRatings,
        canUseGoogleReviews,
        canToggleAvailability,
        canManageMultiBranch,
        canManageStaff,
        canUseCustomBranding,
        canUseAdvancedCustom,
        canUseCustomSubdomain,
        canRemoveBranding,
    };
}