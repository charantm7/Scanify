import { redirect } from "next/navigation"
import { createClient } from "../../../lib/supabase/server"
import ConsoleShell from "../../../features/console/ConsoleShell"
import ErrorBoundary from "../../../components/feedback/ErrorBoundary"
import AppErrorFallback from "../../../components/feedback/AppErrorFallback"

export default async function Console() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('users')
        .select('onboarding_complete')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile?.onboarding_complete) {
        redirect('/onboarding')
    }
    return (
        <ErrorBoundary fallback={AppErrorFallback}>
            <ConsoleShell />
        </ErrorBoundary>
    )
}