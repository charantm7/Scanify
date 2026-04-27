
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/home/Navbar";
import ScrollButtons from "@/components/utils/ScrollButtons";

export default async function MainLayout({ children }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    return (
        <>
            <ScrollButtons />
            <Navbar user={user} />
            {children}
        </>

    );
}
