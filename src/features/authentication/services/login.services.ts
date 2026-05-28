import { FormData, SignUpPayload, SignInPayload, PasswordResetPayload } from "../types";
import { TypedSupabaseClient } from "../../../types/supabase";
import { signInWithPassword, getUserProfile, signUp, signOut, resetPassword, updatePassword } from "../query/auth.query";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ToastMethods } from "../../../hooks/useToast";


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
    toast: ToastMethods
) {
    if (!email.trim()) throw new Error('Email is required.');
    if (!/\S+@\S+\.\S+/.test(email)) throw new Error('Invalid email format.');
    await resetPassword(supabase, email);
    toast.success('Password Reset Link Sent!')
}

export async function AuthUpdatePassword(
    supabase: TypedSupabaseClient,
    payload: PasswordResetPayload,
    userEmail: string,
    toast: ToastMethods
) {
    if (payload.next.length < 8) throw new Error('New password must be at least 8 characters.');
    if (payload.next !== payload.confirm) throw new Error('Passwords do not match.');

    if (payload.current && userEmail) {
        const { error: verifyErr } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: payload.current,
        });
        if (verifyErr) throw new Error('Current password is incorrect.');
    }

    await updatePassword(supabase, payload.next);
    toast.success('Password Updated')
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