"use client";


import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";


export const TRIAL_HOURS = 48;

export const PLANS = {
    free: {
        label: "Free",
        maxMenuItems: 5,
        qrCodes: 1,
        analytics: false,
    },
    trial: {
        label: "Free Trial",
        maxMenuItems: 50,
        qrCodes: 10,
        analytics: true,
    },
    starter: {
        label: "Starter",
        maxMenuItems: 50,
        qrCodes: 10,
        analytics: true,
    },
    pro: {
        label: "Pro",
        maxMenuItems: 200,
        qrCodes: Infinity,
        analytics: true,
    },
    enterprise: {
        label: "Enterprise",
        maxMenuItems: Infinity,
        qrCodes: Infinity,
        analytics: true,
    },
};


const AppContext = createContext(null);


export function AppProvider({ children }) {
    const supabase = getSupabaseClient();

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [hotel, setHotel] = useState(null);
    const [menuItemCount, setMenuItemCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        async function bootstrap() {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session?.user) {
                    if (mounted) setLoading(false);
                    return;
                }

                const user = session.user;

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
            .from("hotels")
            .select("*")
            .eq("owner_id", user.id)
            .maybeSingle();
        setHotel(data);
    }, [user?.id, supabase]);

    const updateProfileLocally = useCallback((patch) => {
        setProfile((prev) => (prev ? { ...prev, ...patch } : patch));
    }, []);


    const dbPlan = profile?.plan ?? "free";
    const createdAt = profile?.created_at ? new Date(profile.created_at) : null;
    const hoursOnPlatform = createdAt
        ? (Date.now() - createdAt.getTime()) / 3_600_000
        : Infinity;

    const isInTrial = dbPlan === "free" && hoursOnPlatform < TRIAL_HOURS;
    const trialHoursLeft = isInTrial ? Math.ceil(TRIAL_HOURS - hoursOnPlatform) : 0;
    const trialDaysLeft = isInTrial ? Math.max(1, Math.ceil(trialHoursLeft / 24)) : 0;

    const plan = isInTrial ? "trial" : dbPlan;
    const limits = PLANS[plan] ?? PLANS.free;

    const isFreeTier = plan === "free";
    const isOnTrial = plan === "trial";
    const isPaidPlan = !isFreeTier && !isOnTrial;



    const value = {
        supabase,
        user,
        profile,
        hotel,

        plan,
        dbPlan,
        limits,
        menuItemCount,

        loading,
        error,

        isFreeTier,
        isOnTrial,
        isPaidPlan,
        isInTrial,
        trialHoursLeft,
        trialDaysLeft,

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