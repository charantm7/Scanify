'use client';

import { useApp } from "../context/AppContext";
import type { UserRow } from "../types/supabase";
import type { User } from "@supabase/supabase-js";

export interface UseAuthReturn {
    user: User | null;
    profile: UserRow | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    onboardingComplete: boolean;
    updateProfileLocally: (patch: Partial<UserRow>) => void;
}

export function useAuth(): UseAuthReturn {
    const { user, profile, loading, error, updateProfileLocally } = useApp();

    return {
        user,
        profile,
        loading,
        error,
        isAuthenticated: user !== null,
        onboardingComplete: profile?.onboarding_complete ?? false,
        updateProfileLocally
    };
}