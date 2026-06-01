import { TypedSupabaseClient } from "../../../types/supabase";
import { UserRow, UserInsert } from "../../../types/supabase";
import { FormData } from "../types";


// Read

export async function getUserProfile(
    supabase: TypedSupabaseClient,
    userId: string,
): Promise<UserRow | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

    if (error) {
        throw new Error(`Get User Profile error: ${error.message}`)
    }

    return data;
}

// Auth Operations

export async function signInWithPassword(
    supabase: TypedSupabaseClient,
    formData: FormData,
) {
    const { data, error } = await supabase
        .auth
        .signInWithPassword({
            email: formData.email,
            password: formData.password
        })

    if (error) {

        throw new Error(`SignIn With Password  error: ${error.message}`)
    }

    return data;
};

export async function signUp(
    supabase: TypedSupabaseClient,
    formData: FormData,
) {
    const { data, error } = await supabase
        .auth
        .signUp({
            email: formData.email,
            password: formData.password,
            options: {
                emailRedirectTo: `${window.location.origin}/${process.env.SIGNUP_EMAIL_REDIRECT_TO}`
            }
        })

    if (error) {
        throw new Error(`Sign Up error: ${error.message}`)
    }

    return data;
};

export async function signOut(
    supabase: TypedSupabaseClient
) {
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw new Error(`Sign Out error: ${error.message}`)
    }
}

export async function resetPassword(
    supabase: TypedSupabaseClient,
    email: string
) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {

        throw new Error(`Reset Password error: ${error.message}`)
    }
}

export async function resendEmailVerification(
    supabase: TypedSupabaseClient,
    email: string
) {
    const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
            emailRedirectTo: `${window.location.origin}/${process.env.SIGNUP_EMAIL_REDIRECT_TO}`
        }
    })
    if (error) {

        throw new Error(`Resend Email Verification error: ${error.message}`)
    }
}

export async function updatePassword(
    supabase: TypedSupabaseClient,
    password: string
) {
    const { error } = await supabase.auth.updateUser({ password: password });
    if (error) {
        throw new Error(`Update Password error: ${error.message}`)
    }

}


export async function oauthSignIn(
    supabase: TypedSupabaseClient
) {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/${process.env.OAUTH_EMAIL_REDIRECT_TO}`,
        },
    });
    if (error) {
        throw new Error(`Google Authentication error: ${error.message}`)
    }
}


// Write

export async function createUserProfile(
    supabase: TypedSupabaseClient,
    payload: UserInsert
): Promise<UserRow> {
    const { data, error } = await supabase
        .from('users')
        .insert(payload)
        .select()
        .single();
    if (error) {
        throw new Error(`Create User Profile error: ${error.message}`)
    }

    return data;
}