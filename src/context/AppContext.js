"use client";


import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

// ─── Constants ────────────────────────────────────────────────────────────────

export const FREE_GRACE_HOURS = 48;

export const PLANS = {
    free: { label: "Free", maxMenuItems: 5, qrCodes: 1, analytics: false },
    starter: { label: "Starter", maxMenuItems: 30, qrCodes: 10, analytics: false },
    pro: { label: "Pro", maxMenuItems: 200, qrCodes: Infinity, analytics: true },
    enterprise: { label: "Enterprise", maxMenuItems: Infinity, qrCodes: Infinity, analytics: true },
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
    const supabase = getSupabaseClient();

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [hotel, setHotel] = useState(null);
    const [menuItemCount, setMenuItemCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Bootstrap ──────────────────────────────────────────────────────────────
    useEffect(() => {
        let mounted = true;

        async function bootstrap() {
            try {
                const { data: { user }, error: authErr } = await supabase.auth.getUser();
                if (authErr) throw authErr;

                if (!user) {
                    if (mounted) setLoading(false);
                    return;
                }

                const [{ data: prof }, { data: hot }] = await Promise.all([
                    supabase.from("users").select("*").eq("id", user.id).maybeSingle(),
                    supabase.from("hotels").select("*").eq("owner_id", user.id).maybeSingle(),
                ]);

                let count = 0;
                if (hot?.id) {
                    const { count: c } = await supabase
                        .from("menu_items")
                        .select("id", { count: "exact", head: true })
                        .eq("hotel_id", hot.id);
                    count = c ?? 0;
                }

                if (mounted) {
                    setUser(user);
                    setProfile(prof);
                    setHotel(hot);
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

        // Keep session in sync
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_OUT") {
                setUser(null);
                setProfile(null);
                setHotel(null);
                setMenuItemCount(0);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Helpers ────────────────────────────────────────────────────────────────

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
            .from("hotels")
            .select("*")
            .eq("owner_id", user.id)
            .maybeSingle();
        setHotel(data);
    }, [user?.id, supabase]);

    /** Optimistically update profile fields in-memory (avoids a re-fetch). */
    const updateProfileLocally = useCallback((patch) => {
        setProfile((prev) => (prev ? { ...prev, ...patch } : patch));
    }, []);

    // ── Derived values ─────────────────────────────────────────────────────────

    const plan = profile?.plan ?? "free";
    const planConfig = PLANS[plan] ?? PLANS.free;
    const limits = planConfig;
    const isFreeTier = plan === "free";

    // Grace period: 48 h from account creation for free users
    const createdAt = profile?.created_at ? new Date(profile.created_at) : null;
    const hoursSinceSignup = createdAt ? (Date.now() - createdAt.getTime()) / 3_600_000 : Infinity;
    const isInGracePeriod = isFreeTier && hoursSinceSignup < FREE_GRACE_HOURS;
    const hoursLeftInGrace = isInGracePeriod ? Math.ceil(FREE_GRACE_HOURS - hoursSinceSignup) : 0;
    const trialDaysLeft = isFreeTier
        ? Math.max(0, Math.ceil((FREE_GRACE_HOURS - hoursSinceSignup) / 24))
        : 0;


    const value = {
        // Auth & data
        supabase,
        user,
        profile,
        hotel,
        plan,
        limits,
        menuItemCount,

        // State flags
        loading,
        error,
        isFreeTier,
        isInGracePeriod,
        hoursLeftInGrace,
        trialDaysLeft,

        // Mutators
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