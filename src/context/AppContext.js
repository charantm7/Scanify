"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

export const PLAN_LABELS = {
    basic: "Basic",
    starter: "Starter",
    growth: "Growth",
    pro: "Pro",
};

export const isUnlimited = (val) => val === -1;
export const displayLimit = (val) => (isUnlimited(val) ? "∞" : val);

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const supabase = getSupabaseClient();

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [hotel, setHotel] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [planLimits, setPlanLimits] = useState(null);
    const [menuItemCount, setMenuItemCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        async function bootstrap() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) { if (mounted) setLoading(false); return; }

                const authUser = session.user;

                const [
                    { data: prof },
                    { data: hot },
                    { data: sub },
                ] = await Promise.all([
                    supabase.from("users").select("*").eq("id", authUser.id).maybeSingle(),
                    supabase.from("hotels").select("*").eq("owner_id", authUser.id).maybeSingle(),
                    supabase.from("subscriptions").select("*").eq("user_id", authUser.id).maybeSingle(),
                ]);

                const planKey = prof?.plan ?? "basic";
                const { data: limits } = await supabase
                    .from("plan_limits")
                    .select("*")
                    .eq("plan", planKey)
                    .maybeSingle();

                let count = 0;
                if (hot?.id) {
                    const { count: c } = await supabase
                        .from("menu_items")
                        .select("id", { count: "exact", head: true })
                        .eq("hotel_id", hot.id);
                    count = c ?? 0;
                }

                if (mounted) {
                    setUser(authUser);
                    setProfile(prof);
                    setHotel(hot);
                    setSubscription(sub);
                    setPlanLimits(limits);
                    setMenuItemCount(count);
                }
            } catch (err) {
                console.error("[AppContext] bootstrap error:", err);
                if (mounted) setError(err.message ?? "Failed to load session");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        bootstrap();

        const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_OUT") {
                setUser(null);
                setProfile(null);
                setHotel(null);
                setSubscription(null);
                setPlanLimits(null);
                setMenuItemCount(0);
            }
        });

        return () => { mounted = false; authSub.unsubscribe(); };
    }, []);

    const refreshMenuCount = useCallback(async () => {
        if (!hotel?.id) return;
        const { count } = await supabase
            .from("menu_items")
            .select("id", { count: "exact", head: true })
            .eq("hotel_id", hotel.id);
        setMenuItemCount(count ?? 0);
    }, [hotel?.id, supabase]);

    const refreshHotel = useCallback(async () => {
        if (!user?.id) return;
        const { data } = await supabase
            .from("hotels").select("*").eq("owner_id", user.id).maybeSingle();
        setHotel(data);
    }, [user?.id, supabase]);

    const updateProfileLocally = useCallback((patch) => {
        setProfile((prev) => (prev ? { ...prev, ...patch } : patch));
    }, []);


    const plan = profile?.plan ?? "basic";
    const planLabel = PLAN_LABELS[plan] ?? plan;
    const subStatus = subscription?.status ?? null;
    const isTrialing = subStatus === "trialing";
    const isActive = subStatus === "active";
    const isCancelled = subStatus === "cancelled";
    const isExpired = subStatus === "expired";
    const isPastDue = subStatus === "past_due";
    const isSubscriptionOk = isTrialing || isActive;

    const trialEndsAt = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
    const trialMsLeft = isTrialing && trialEndsAt ? Math.max(0, trialEndsAt - Date.now()) : 0;
    const trialHoursLeft = Math.ceil(trialMsLeft / 3_600_000);
    const trialDaysLeft = Math.max(isTrialing ? 1 : 0, Math.ceil(trialMsLeft / 86_400_000));
    const isTrialExpired = isTrialing && trialMsLeft === 0;


    // Menu
    const maxMenuItems = planLimits?.max_menu_items ?? 0;
    const maxItemsWithImages = planLimits?.max_items_with_images ?? 0;
    const isAtMenuLimit = !isUnlimited(maxMenuItems) && menuItemCount >= maxMenuItems;

    // Orders
    const maxOrdersPerMonth = planLimits?.max_orders_per_month ?? 0;
    const orderingEnabled = planLimits?.ordering_enabled ?? false;
    const realtimeKitchen = planLimits?.realtime_kitchen ?? false;

    // QR codes
    const maxQrCodes = planLimits?.max_qr_codes ?? 1;

    // Branding
    const removeBranding = planLimits?.remove_branding ?? false;
    const customBranding = planLimits?.custom_branding ?? false;
    const advancedCustom = planLimits?.advanced_customization ?? false;
    const customSubdomain = planLimits?.custom_subdomain ?? false;

    // Analytics
    const analyticsLevel = planLimits?.analytics_level ?? "none";
    const hasBasicAnalytics = analyticsLevel === "basic" || analyticsLevel === "advanced";
    const hasAdvancedAnalytics = analyticsLevel === "advanced";

    // Engagement
    const ratingsEnabled = planLimits?.ratings_enabled ?? false;
    const googleReviews = planLimits?.google_reviews_integration ?? false;
    const availabilityToggle = planLimits?.item_availability_toggle ?? false;
    const advancedCategories = planLimits?.advanced_category_management ?? false;

    // Multi-branch & staff
    const multiBranchEnabled = planLimits?.multi_branch_enabled ?? false;
    const maxBranches = planLimits?.max_branches ?? 1;
    const staffEnabled = planLimits?.staff_accounts_enabled ?? false;
    const maxStaffAccounts = planLimits?.max_staff_accounts ?? 0;

    // Support
    const prioritySupport = planLimits?.priority_support ?? false;

    // ── Composite action guards ──────────────────────────────────────────────────
    // Use these in UI — don't re-derive in each component
    const isActionBlocked = !isSubscriptionOk || isTrialExpired;
    const canAddMenuItem = !isActionBlocked && !isAtMenuLimit;
    const canUseOrdering = !isActionBlocked && orderingEnabled;
    const canUseKitchenDisplay = !isActionBlocked && realtimeKitchen;
    const canViewBasicAnalytics = !isActionBlocked && hasBasicAnalytics;
    const canViewAdvancedAnalytics = !isActionBlocked && hasAdvancedAnalytics;
    const canUseRatings = !isActionBlocked && ratingsEnabled;
    const canUseGoogleReviews = !isActionBlocked && googleReviews;
    const canToggleAvailability = !isActionBlocked && availabilityToggle;
    const canManageMultiBranch = !isActionBlocked && multiBranchEnabled;
    const canManageStaff = !isActionBlocked && staffEnabled;
    const canUseCustomBranding = !isActionBlocked && customBranding;
    const canUseAdvancedCustom = !isActionBlocked && advancedCustom;
    const canUseCustomSubdomain = !isActionBlocked && customSubdomain;
    const canRemoveBranding = !isActionBlocked && removeBranding;

    const value = {
        supabase,

        user,
        profile,
        hotel,
        subscription,
        planLimits,

        menuItemCount,
        loading,
        error,

        plan,
        planLabel,
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

        maxMenuItems,
        maxItemsWithImages,
        maxOrdersPerMonth,
        maxQrCodes,
        maxBranches,
        maxStaffAccounts,

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

        refreshMenuCount,
        refreshHotel,
        updateProfileLocally,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
    return ctx;
}