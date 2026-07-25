import { FormData, SignUpPayload, SignInPayload, PasswordResetPayload, UpdatePasswordError, UpdatePasswordReturn } from "../types";
import { TypedSupabaseClient } from "../../../types/supabase";
import { signInWithPassword, getUserProfile, signUp, signOut, resetPassword, updatePassword, resendEmailVerification } from "../query/auth.query";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ToastMethods } from "../../../hooks/useToast";
import { Dispatch, SetStateAction } from "react";


export interface FormErrors {
    email?: string;
    password?: string;
    terms?: string;
}


async function redirectWithToast(
    message: string,
    path: string,
    toast: ToastMethods,
    router: AppRouterInstance
) {
    toast.success(message);

    await new Promise((r) =>
        setTimeout(r, 900)
    );

    router.push(path);
}

export function validate(formData: FormData) {
    const newErrors: FormErrors = {};

    if (!formData.email) {
        newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
        newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
        newErrors.password =
            "Minimum 6 characters required";
    }
    return newErrors
}

export function validateNewPassword(formData: UpdatePasswordError) {
    const newErrors: UpdatePasswordError = {};
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors
}

export function getPasswordStrength(pwd: string) {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (score === 2) return { level: 2, label: 'Fair', color: '#f97316' };
    if (score === 3) return { level: 3, label: 'Good', color: '#eab308' };
    return { level: 4, label: 'Strong', color: '#09a055' };
}

export async function AuthSignUp(
    supabase: TypedSupabaseClient,
    { email, password, acceptedTerms }: SignUpPayload,
    router: AppRouterInstance,
    toast: ToastMethods,
    setError: (errors: FormErrors) => void
) {
    const errors = validate({ email, password });

    if (Object.keys(errors).length > 0) {
        setError(errors)
        return;
    }

    if (!acceptedTerms) {
        setError({ ...errors, terms: 'You must accept Terms & Conditions' })
        return;
    }

    const data = await signUp(supabase, { email, password })

    if (!data?.user || data.user.identities?.length === 0) {
        throw new Error('An account with this email already exists. Please sign in.');
    }

    localStorage.setItem('signup_email', email);

    redirectWithToast('Account Created Successfully', '/check-mail', toast, router)
}

export async function AuthSignIn(
    supabase: TypedSupabaseClient,
    { email, password, rememberMe }: SignInPayload,
    router: AppRouterInstance,
    toast: ToastMethods
) {
    const data = await signInWithPassword(supabase, { email, password })

    if (!data?.user) throw new Error('Sign in failed — no user returned.');
    if (!data?.user.email_confirmed_at) throw new Error('Email Not Verified - SignUp')

    if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
        localStorage.setItem('remember_email', email);
    } else {
        localStorage.removeItem('remember_me');
        localStorage.removeItem('remember_email');
    }

    const profile = await getUserProfile(supabase, data.user.id);

    const destination = profile?.onboarding_complete ? '/console' : '/onboarding';
    redirectWithToast('Welcome Back!', destination, toast, router)
}

export async function AuthSignOut(
    supabase: TypedSupabaseClient,
    router: AppRouterInstance,
    toast: ToastMethods
) {
    await signOut(supabase)
    redirectWithToast('Signed Out Successfully!', '/login', toast, router)
}

export async function AuthResetPassword(
    supabase: TypedSupabaseClient,
    email: string,
    toast: ToastMethods,
    setError: (errors: FormErrors) => void,
    setSent: Dispatch<SetStateAction<boolean>>,
    setCooldown: Dispatch<SetStateAction<number>>
) {
    if (!email.trim()) {
        setError({ email: 'Email is required.' });
        return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError({ email: 'Invalid email format.' });
        return;
    }
    await resetPassword(supabase, email);
    setSent(true);
    setCooldown(60);
    toast.success('Password Reset Link Sent!')
}

export async function AuthUpdatePassword(
    supabase: TypedSupabaseClient,
    payload: PasswordResetPayload,
    userEmail: string,
    toast: ToastMethods,
    setUpdatePasswordError: (error: UpdatePasswordError) => void,
): Promise<UpdatePasswordReturn> {

    const errors = validateNewPassword({ password: payload.next, confirmPassword: payload.confirm })

    if (Object.keys(errors).length > 0) {
        setUpdatePasswordError(errors)
        return
    }

    if (payload.current && userEmail) {
        const { error: verifyErr } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: payload.current,
        });
        if (verifyErr) throw new Error('Current password is incorrect.');
    }

    await updatePassword(supabase, payload.next);
    toast.success('Password Updated')

    return {
        isRecovery: payload.isRecovery,
        success: true
    }
}


export async function AuthUpdateEmail(
    supabase: TypedSupabaseClient,
    newEmail: string,
    toast: ToastMethods
) {
    if (!newEmail.trim()) throw new Error('Email cannot be empty.');
    if (!/\S+@\S+\.\S+/.test(newEmail)) throw new Error('Invalid email format.');

    const { error: err } = await supabase.auth.updateUser({ email: newEmail });
    if (err) throw new Error(`Update Email error: ${err.message}`);
    toast.success('Email Updated')
}

export async function AuthResendEmail(
    supabase: TypedSupabaseClient,
    toast: ToastMethods,
    setResendCount: Dispatch<SetStateAction<number>>,
    setCooldown: Dispatch<SetStateAction<number>>
) {

    const savedEmail = localStorage.getItem('signup_email');
    if (!savedEmail) {
        toast.warning("Email not found. Please signup again.");
        return;
    }

    await resendEmailVerification(supabase, savedEmail)

    setResendCount((c) => c + 1);
    setCooldown(Number(process.env.NEXT_PUBLIC_COOLDOWN_SECONDS) ?? 60);

}
