// app/auth-callback/route.js
import { createClient } from '../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { createUserProfile, getUserProfileWithOnboarding } from '../../../lib/queries/user';
import { UserInsert } from '../../../types/supabase';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');


  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('[auth-callback] code exchange failed:', exchangeError.message);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  if (type === 'recovery') {
    const response = NextResponse.redirect(`${origin}/reset-password`);

    response.cookies.set('recovery_flow', 'true', {
      httpOnly: true,
      maxAge: 60 * 5
    })

    return response;
  }

  // A session is not proof of a confirmed email: with "Confirm email" off in
  // Supabase, sign-up hands out a session straight away. Only Supabase's own
  // email_confirmed_at says the address was verified.
  if (!user.email_confirmed_at) {
    return NextResponse.redirect(`${origin}/check-mail`);
  }

  const profile = await getUserProfileWithOnboarding(supabase, user.id)

  if (!profile) {
    const payload: UserInsert = {
      id: user.id,
      onboarding_complete: false,
      email: user.email,
      is_verified: Boolean(user.email_confirmed_at),
    }
    await createUserProfile(supabase, payload);

    return NextResponse.redirect(`${origin}/onboarding`);
  }

  return NextResponse.redirect(
    profile.onboarding_complete ? `${origin}/overview` : `${origin}/onboarding`
  );
}