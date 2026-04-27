import OnboardingPage from "@/components/authentication/Onboarding";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_complete')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.onboarding_complete) {
    redirect('/console')
  }
  return <OnboardingPage />;
}
