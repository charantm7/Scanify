import OnboardingPage from "../../../features/onboarding/page";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export const metadata = {
  title: "Oboarding | Scanify",
  description: "Complete you hotel records on boarding.",
};

export default async function Onboarding() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: hotel }] = await Promise.all([
    supabase.from('users').select('onboarding_complete').eq('id', user.id).maybeSingle(),
    supabase.from('hotels').select('id').eq('owner_id', user.id).maybeSingle(),
  ])

  // Only skip onboarding when both the profile flag AND the hotel row exist.
  // If the hotel is missing despite the flag being set (e.g. the insert failed
  // mid-onboarding), fall through and render the form — otherwise the proxy's
  // "no hotel → /onboarding" check and this redirect create an infinite loop.
  if (profile?.onboarding_complete && hotel) {
    redirect('/overview')
  }
  return <OnboardingPage />;
}
