import { redirect } from "next/navigation";
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
 * Gate for every dashboard route. The proxy already turns away anonymous
 * requests, but it runs before the app and only checks that a session exists —
 * this also enforces that onboarding is finished, and re-checks the session
 * server-side so a route is never rendered for a user the proxy let through on
 * a stale cookie.
 */
export default async function DashboardLayout({ children }) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("users")
        .select("onboarding_complete")
        .eq("id", user.id)
        .maybeSingle();

    if (!profile?.onboarding_complete) {
        redirect("/onboarding");
    }

    return (
        <ErrorBoundary fallback={AppErrorFallback}>
            <DashboardShell>{children}</DashboardShell>
        </ErrorBoundary>
    );
}
