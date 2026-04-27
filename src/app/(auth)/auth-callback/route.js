// app/auth-callback/route.js
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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

  if (type === 'signup') {
    await supabase.from('users').upsert(
      { id: user.id, onboarding_complete: false, email: user.email, is_verified: true },
      { onConflict: 'id', ignoreDuplicates: true }
    );
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_complete')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.from('users').insert({ id: user.id, onboarding_complete: false });
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  return NextResponse.redirect(
    profile.onboarding_complete ? `${origin}/console` : `${origin}/onboarding`
  );
}