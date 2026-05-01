import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ConsoleShell from "@/components/console/ConsoleShell"

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
        <ConsoleShell />
    )
}