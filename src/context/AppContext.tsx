"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { getSupabaseClient } from "../lib/supabase/client";
import { PLAN_LABELS } from "../types/app.types";


export const isUnlimited = (val: number) => val === -1;
export const displayLimit = (val: number) => (isUnlimited(val) ? "∞" : val);

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const supabase = getSupabaseClient();

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [hotel, setHotel] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [planLimits, setPlanLimits] = useState(null);
    const [menuItemCount, setMenuItemCount] = useState(0);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [now] = useState(() => Date.now());

    useEffect(() => {
        let mounted = true;

        async function bootstrap() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) { if (mounted) setLoading(false); return; }

                const authUser = session.user;

                // Round 1. plan_limits joins this batch instead of waiting for
                // the profile: the table is one row per plan (four rows), so
                // fetching all of them and picking locally is cheaper than the
                // extra sequential round trip that selecting one row cost.
                const [
                    { data: prof },
                    { data: hot },
                    { data: sub },
                    { data: allLimits },
                ] = await Promise.all([
                    supabase.from("users").select("*").eq("id", authUser.id).maybeSingle(),
                    supabase.from("hotels").select("*").eq("owner_id", authUser.id).maybeSingle(),
                    supabase.from("subscriptions").select("*").eq("user_id", authUser.id).maybeSingle(),
                    supabase.from("plan_limits").select("*"),
                ]);

                const planKey = prof?.plan ?? "basic";
                const limits =
                    (allLimits ?? []).find((row) => row.plan === planKey) ?? null;

                // Round 2. Genuinely dependent — both need hotel.id.
                let count = 0;
                let menuRows = [];
                if (hot?.id) {
                    const [{ count: c }, { data: m }] = await Promise.all([
                        supabase
                            .from("menu_items")
                            .select("id", { count: "exact", head: true })
                            .eq("hotel_id", hot.id),
                        supabase
                            .from("menus")
                            .select("*")
                            .eq("hotel_id", hot.id)
                            .is("deleted_at", null)
                            .order("sort_order", { ascending: true }),
                    ]);
                    count = c ?? 0;
                    menuRows = m ?? [];
                }

                if (mounted) {
                    setUser(authUser);
                    setProfile(prof);
                    setHotel(hot);
                    setSubscription(sub);
                    setPlanLimits(limits);
                    setMenuItemCount(count);
                    setMenus(menuRows);
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
                setMenus([]);
            }
        });

        return () => { mounted = false; authSub.unsubscribe(); };
    }, [supabase]);

    // These three are handed to hooks that list them in useCallback/useEffect
    // dependency arrays. Declared as plain functions they were new on every
    // render of this provider, which re-created every downstream callback and
    // defeated memoisation all the way down the menu builder tree.
    // Read out of state once so the dependency arrays below name plain values.
    const hotelId = hotel?.id;
    const userId = user?.id;

    const refreshMenuCount = useCallback(async () => {
        if (!hotelId) return;
        const { count } = await supabase
            .from("menu_items")
            .select("id", { count: "exact", head: true })
            .eq("hotel_id", hotelId);
        setMenuItemCount(count ?? 0);
    }, [supabase, hotelId]);

    const refreshMenus = useCallback(async () => {
        if (!hotelId) return;
        const { data } = await supabase
            .from("menus")
            .select("*")
            .eq("hotel_id", hotelId)
            .is("deleted_at", null)
            .order("sort_order", { ascending: true });
        setMenus(data ?? []);
    }, [supabase, hotelId]);

    const refreshHotel = useCallback(async () => {
        if (!userId) return;
        const { data } = await supabase
            .from("hotels").select("*").eq("owner_id", userId).maybeSingle();
        setHotel(data);
    }, [supabase, userId]);

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
    const trialMsLeft = isTrialing && trialEndsAt ? Math.max(0, trialEndsAt.getTime() - now) : 0;
    const trialHoursLeft = Math.ceil(trialMsLeft / 3_600_000);
    const trialDaysLeft = Math.max(isTrialing ? 1 : 0, Math.ceil(trialMsLeft / 86_400_000));
    const isTrialExpired = isTrialing && trialMsLeft === 0;
    const isFreeTier = !isSubscriptionOk && isTrialExpired;


    // ── Menus (multiple menus per hotel) ────────────────────────────────────────
    const maxMenus = planLimits?.max_menus ?? 1;
    // Only menus the owner still holds count against the allowance; ones a
    // downgrade parked are excluded, otherwise a downgraded account could never
    // get back under its own limit.
    const ownedMenus = menus.filter((m) => !m.hidden_by_plan);
    const menuCount = ownedMenus.length;
    const primaryMenu = menus.find((m) => m.is_primary) ?? menus[0] ?? null;
    const isAtMenuCountLimit = !isUnlimited(maxMenus) && menuCount >= maxMenus;
    // True when a downgrade left more menus than the new plan allows and the
    // owner has not yet chosen which to keep.
    const hasMenuOverflow = !isUnlimited(maxMenus) && menus.length > maxMenus;

    // ── Menu items ──────────────────────────────────────────────────────────────
    const maxMenuItems = planLimits?.max_menu_items ?? 0;
    const maxItemsWithImages = planLimits?.max_items_with_images ?? 0;
    const maxImagesPerItem = planLimits?.max_images_per_item ?? 1;
    const isAtMenuLimit = !isUnlimited(maxMenuItems) && menuItemCount >= maxMenuItems;
    const advancedItemDetails = planLimits?.advanced_item_details ?? false;

    // ── QR codes ────────────────────────────────────────────────────────────────
    const maxQrCodes = planLimits?.max_qr_codes ?? 1;
    const qrCustomizationLevel = planLimits?.qr_customization_level ?? "none";

    // ── Branding ────────────────────────────────────────────────────────────────
    const removeBranding = planLimits?.remove_branding ?? false;
    const customBranding = planLimits?.custom_branding ?? false;
    const advancedCustom = planLimits?.advanced_customization ?? false;
    const customSubdomain = planLimits?.custom_subdomain ?? false;

    // ── Analytics ───────────────────────────────────────────────────────────────
    const analyticsLevel = planLimits?.analytics_level ?? "none";
    const hasBasicAnalytics = analyticsLevel === "basic" || analyticsLevel === "advanced" || isTrialing;
    const hasAdvancedAnalytics = analyticsLevel === "advanced";
    const analyticsExportEnabled = planLimits?.analytics_export_enabled ?? false;

    // ── Engagement ──────────────────────────────────────────────────────────────
    const googleReviews = planLimits?.google_reviews_integration ?? false;
    const availabilityToggle = planLimits?.item_availability_toggle ?? false;
    const advancedCategories = planLimits?.advanced_category_management ?? false;

    // ── Multi-branch & staff ────────────────────────────────────────────────────
    const multiBranchEnabled = planLimits?.multi_branch_enabled ?? false;
    const maxBranches = planLimits?.max_branches ?? 1;
    const staffEnabled = planLimits?.staff_accounts_enabled ?? false;
    const maxStaffAccounts = planLimits?.max_staff_accounts ?? 0;

    // ── Support ─────────────────────────────────────────────────────────────────
    const prioritySupport = planLimits?.priority_support ?? false;

    // ── Composite action guards ─────────────────────────────────────────────────
    // Use these in UI — don't re-derive in each component
    const isActionBlocked = !isSubscriptionOk || isTrialExpired;

    const canAddMenu = !isActionBlocked && !isAtMenuCountLimit;
    const canAddMenuItem = !isActionBlocked && !isAtMenuLimit;
    const canViewBasicAnalytics = !isActionBlocked && hasBasicAnalytics;
    const canViewAdvancedAnalytics = !isActionBlocked && hasAdvancedAnalytics;
    const canExportAnalytics = !isActionBlocked && analyticsExportEnabled;
    const canUseGoogleReviews = !isActionBlocked && googleReviews;
    const canToggleAvailability = !isActionBlocked && availabilityToggle;
    const canUseAdvancedItemDetails = !isActionBlocked && advancedItemDetails;
    const canCustomizeQr = !isActionBlocked && qrCustomizationLevel !== "none";
    const canUseAdvancedQrCustomization = !isActionBlocked && qrCustomizationLevel === "advanced";
    const canManageMultiBranch = !isActionBlocked && multiBranchEnabled;
    const canManageStaff = !isActionBlocked && staffEnabled;
    const canUseCustomBranding = !isActionBlocked && customBranding;
    const canUseAdvancedCustom = !isActionBlocked && advancedCustom;
    const canUseCustomSubdomain = !isActionBlocked && customSubdomain;
    const canRemoveBranding = !isActionBlocked && removeBranding;

    // A fresh object here meant every `useApp()` consumer in the tree re-rendered
    // on every render of this provider, whatever they actually read from it.
    /* eslint-disable react-hooks/exhaustive-deps */
    const value = useMemo(() => ({
        supabase,

        user,
        profile,
        hotel,
        subscription,
        planLimits,

        menuItemCount,
        menus,
        menuCount,
        primaryMenu,
        loading,
        error,

        plan,
        planLabel,
        subStatus,

        isTrialing,
        isFreeTier,
        isActive,
        isCancelled,
        isExpired,
        isPastDue,
        isSubscriptionOk,
        isTrialExpired,
        trialHoursLeft,
        trialDaysLeft,

        maxMenus,
        maxMenuItems,
        maxItemsWithImages,
        maxImagesPerItem,
        maxQrCodes,
        maxBranches,
        maxStaffAccounts,

        removeBranding,
        customBranding,
        advancedCustom,
        customSubdomain,
        analyticsLevel,
        hasBasicAnalytics,
        hasAdvancedAnalytics,
        analyticsExportEnabled,
        qrCustomizationLevel,
        advancedItemDetails,
        googleReviews,
        availabilityToggle,
        advancedCategories,
        multiBranchEnabled,
        staffEnabled,
        prioritySupport,

        isActionBlocked,
        isAtMenuLimit,
        isAtMenuCountLimit,
        hasMenuOverflow,
        canAddMenu,
        canAddMenuItem,
        canViewBasicAnalytics,
        canViewAdvancedAnalytics,
        canExportAnalytics,
        canUseAdvancedItemDetails,
        canCustomizeQr,
        canUseAdvancedQrCustomization,
        canUseGoogleReviews,
        canToggleAvailability,
        canManageMultiBranch,
        canManageStaff,
        canUseCustomBranding,
        canUseAdvancedCustom,
        canUseCustomSubdomain,
        canRemoveBranding,

        refreshMenuCount,
        refreshMenus,
        refreshHotel,
        updateProfileLocally,
    }), [
        supabase, user, profile, hotel, subscription, planLimits,
        menuItemCount, menus, loading, error, now,
        refreshMenuCount, refreshMenus, refreshHotel, updateProfileLocally,
    ]);
    /* eslint-enable react-hooks/exhaustive-deps */

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
    return ctx;
}