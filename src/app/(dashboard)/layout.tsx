import { redirect } from "next/navigation";
import { cache } from "react";
import "../style/globals.css";
import { createClient } from "../../lib/supabase/server";
import DashboardShell from "../../features/shell/DashboardShell";
import ErrorBoundary from "../../components/feedback/ErrorBoundary";
import AppErrorFallback from "../../components/feedback/AppErrorFallback";

export const metadata = {
    title: "Scanify | Dashboard",
    description:
        "Manage your digital menu, QR codes, branding and subscription from one place.",
};

/**
 * Gate for every dashboard route.
 *
 * This used to call `supabase.auth.getUser()` and then query `users` — two
 * blocking round trips on every navigation, on top of the two the proxy
 * already pays, because a layout above a dynamic segment is re-executed for
 * each RSC request. That was the bulk of the delay between clicking a tab and
 * seeing the next one.
 *
 * Now the session comes from `getClaims()`, which verifies the JWT locally
 * instead of calling the Supabase auth server (the proxy has already checked
 * the token against the server on this same request), and only the onboarding
 * flag is fetched. That query is wrapped in React's `cache()` so a page that
 * needs the same row reuses this result instead of issuing a second one.
 */
const getOnboardingState = cache(async (userId: string) => {
    const supabase = await createClient();
    const { data } = await supabase
        .from("users")
        .select("onboarding_complete")
        .eq("id", userId)
        .maybeSingle();

    return data?.onboarding_complete ?? false;
});

export default async function DashboardLayout({ children }) {
    const supabase = await createClient();

    // Local JWT verification — no network hop. Falls back to getUser() on
    // projects still using the legacy symmetric JWT secret, where claims
    // cannot be verified offline.
    const { data: claimsData } = await supabase.auth.getClaims();
    let userId = claimsData?.claims?.sub as string | undefined;

    if (!userId) {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        userId = user?.id;
    }

    if (!userId) {
        redirect("/login");
    }

    if (!(await getOnboardingState(userId))) {
        redirect("/onboarding");
    }

    return (
        <ErrorBoundary fallback={AppErrorFallback}>
            <DashboardShell>{children}</DashboardShell>
        </ErrorBoundary>
    );
}
