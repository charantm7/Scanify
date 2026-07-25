import { Dispatch, SetStateAction } from "react";
import type { UserRow } from "../../types/supabase";
import type { User } from "@supabase/supabase-js";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";


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
    current?: string;
    next: string;
    confirm: string;
    isRecovery: boolean;
}

export interface UpdatePasswordReturn {
    isRecovery: boolean;
    success: boolean;
}

export interface UpdatePasswordError {
    password?: string;
    confirmPassword?: string;
    general?: string;
    current?: string;

}


export interface UseAuthReturn {
    user: User | null;
    profile: UserRow | null;
    isAuthenticated: boolean;
    onboardingComplete: boolean;

    loading: boolean;
    error: FormErrors | null;
    updatePasswordError: UpdatePasswordError | null;

    router: AppRouterInstance;

    signUp: (payload: SignUpPayload) => Promise<void>;
    signIn: (payload: SignInPayload) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    sendPasswordReset: (email: string, setSent: Dispatch<SetStateAction<boolean>>, setCooldown: Dispatch<SetStateAction<number>>) => Promise<void>;
    updatePassword: (payload: PasswordResetPayload) => Promise<UpdatePasswordReturn>;
    updateEmail: (newEmail: string) => Promise<void>;
    resendEmail: (setResendCount: Dispatch<SetStateAction<number>>, setCooldown: Dispatch<SetStateAction<number>>) => Promise<void>;

    clearError: () => void;

    setError: Dispatch<SetStateAction<FormErrors>>

}
