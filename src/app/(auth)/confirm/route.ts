// app/auth/confirm/route.ts
import { NextResponse } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '../../../lib/supabase/server';
import { createUserProfile, getUserProfileWithOnboarding } from '../../../lib/queries/user';
import { UserInsert } from '../../../types/supabase';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);

    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    // `next` comes from the email link, so anyone can edit it. It's appended to
    // origin, so "@evil.com" or ".evil.com" would leave our host. Allow only
    // same-origin paths.
    const rawNext = searchParams.get('next');
    const next = rawNext && /^\/(?![/\\])/.test(rawNext) ? rawNext : '/onboarding';

    if (!token_hash || !type) {
        return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }

    const supabase = await createClient();

    const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type,
    });

    if (verifyError) {
        // Distinguish "expired/used" from generic failure so the UI can be honest
        const reason =
            verifyError.message.toLowerCase().includes('expired')
                ? 'link_expired'
                : 'auth_callback_failed';

        return NextResponse.redirect(`${origin}/login?error=${reason}`);
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }

    // Recovery flow: hand off to reset-password page, don't touch profile
    if (type === 'recovery') {
        const response = NextResponse.redirect(`${origin}/reset-password`);
        response.cookies.set('recovery_flow', 'true', {
            httpOnly: true,
            maxAge: 60 * 5,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });
        return response;
    }

    // Signup / email verification flow. verifyOtp succeeding is not enough on
    // its own (an email_change OTP, say), so trust Supabase's confirmation
    // timestamp rather than asserting it.
    if (!user.email_confirmed_at) {
        return NextResponse.redirect(`${origin}/check-mail`);
    }

    const profile = await getUserProfileWithOnboarding(supabase, user.id);

    if (!profile) {
        const payload: UserInsert = {
            id: user.id,
            onboarding_complete: false,
            email: user.email!,
            is_verified: Boolean(user.email_confirmed_at),
        };

        await createUserProfile(supabase, payload);
        return NextResponse.redirect(`${origin}/onboarding`);
    }

    return NextResponse.redirect(
        `${origin}${profile.onboarding_complete ? '/dashboard' : next}`
    );
}