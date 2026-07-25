'use client';

import { useState, useCallback, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../../../lib/supabase/client';
import { useApp } from '../../../context/AppContext';

import { SignInPayload, SignUpPayload, PasswordResetPayload, UseAuthReturn, FormErrors, UpdatePasswordError, UpdatePasswordReturn } from '../types';
import { AuthResendEmail, AuthResetPassword, AuthSignIn, AuthSignOut, AuthSignUp, AuthUpdateEmail, AuthUpdatePassword } from '../services/login.services';
import { oauthSignIn } from '../query/auth.query';
import { useToast } from '../../../hooks/useToast';


export function useAuth(): UseAuthReturn {
    const router = useRouter();
    const toast = useToast();
    const supabase = getSupabaseClient();

    const { user, profile } = useApp();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<FormErrors | null>(null);
    const [updatePasswordError, setUpdatePasswordError] = useState<UpdatePasswordError | null>(null);

    const clearError = useCallback(() => { setError(null); setUpdatePasswordError(null) }, []);

    // wraps all async function inside this and run
    const run = useCallback(
        async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
            setLoading(true);
            setError(null);

            try {
                return await action();
            } catch (err) {
                const msg =
                    err instanceof Error ? err.message : "Something went wrong.";

                toast.error(msg);
                return undefined;
            } finally {
                setLoading(false);
            }
        },
        [toast]
    );


    const signUp = useCallback(async (payload: SignUpPayload) => {
        await run(async () => {
            await AuthSignUp(supabase, payload, router, toast, setError)
        });
    }, [supabase, router, run, toast]);


    const signIn = useCallback(async (payload: SignInPayload) => {
        await run(async () => {
            await AuthSignIn(supabase, payload, router, toast)
        });
    }, [supabase, router, run, toast]);


    const signInWithGoogle = useCallback(async () => {
        await run(async () => {
            await oauthSignIn(supabase)
        });
    }, [supabase, run]);


    const signOut = useCallback(async () => {
        await run(async () => {
            await AuthSignOut(supabase, router, toast)
        });
    }, [supabase, router, run, toast]);


    const sendPasswordReset = useCallback(async (email: string, setSent: Dispatch<SetStateAction<boolean>>, setCooldown: Dispatch<SetStateAction<number>>) => {
        await run(async () => {
            await AuthResetPassword(supabase, email, toast, setError, setSent, setCooldown)
        });
    }, [supabase, run, toast]);

    const resendEmail = useCallback(async (setResendCount: Dispatch<SetStateAction<number>>, setCooldown: Dispatch<SetStateAction<number>>) => {
        await run(async () => {
            await AuthResendEmail(supabase, toast, setResendCount, setCooldown)
        });
    }, [supabase, run, toast]);

    // Handels from link and settings panel
    const updatePassword = useCallback(async (payload: PasswordResetPayload) => {
        let result: UpdatePasswordReturn;
        await run(async () => {
            result = await AuthUpdatePassword(supabase, payload, user?.email, toast, setUpdatePasswordError)
        });

        return result;

    }, [supabase, user?.email, run, toast]);


    //Upadte Email Supabase sends confirmation to both old + new address before switching.
    const updateEmail = useCallback(async (newEmail: string) => {
        await run(async () => {
            await AuthUpdateEmail(supabase, newEmail, toast);
        })
    }, [supabase, run, toast]);


    return {
        user,
        profile,
        isAuthenticated: user !== null,
        onboardingComplete: profile?.onboarding_complete ?? false,
        loading,
        error,
        updatePasswordError,
        router,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        sendPasswordReset,
        updatePassword,
        updateEmail,
        clearError,
        setError,
        resendEmail,
    };
}