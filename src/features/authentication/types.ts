import { Dispatch, SetStateAction } from "react";
import type { UserRow } from "../../types/supabase";
import type { User } from "@supabase/supabase-js";

export interface FormErrors {
    email?: string;
    password?: string;
    terms?: string;
}

export interface FormData {
    email: string;
    password: string;
}


export interface SignUpPayload {
    email: string;
    password: string;
    acceptedTerms: boolean;

}

export interface SignInPayload {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface PasswordResetPayload {
    current: string;
    next: string;
    confirm: string;
}

export interface UseAuthReturn {
    user: User | null;
    profile: UserRow | null;
    isAuthenticated: boolean;
    onboardingComplete: boolean;

    loading: boolean;
    error: FormErrors | null;

    signUp: (payload: SignUpPayload) => Promise<void>;
    signIn: (payload: SignInPayload) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
    updatePassword: (payload: PasswordResetPayload) => Promise<void>;
    updateEmail: (newEmail: string) => Promise<void>;

    clearError: () => void;

    setError: Dispatch<SetStateAction<FormErrors>>
}
