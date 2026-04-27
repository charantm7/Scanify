// app/terms/page.js (or pages/terms.js depending on your router setup)
// This is a SERVER COMPONENT — no "use client" here.
// getLegalDoc uses Node.js `fs`, which only works on the server.
// LegalRender is "use client" and will hydrate on the browser side.

import LegalLayout from "@/components/legal/LegalLayout";
import LegalRender from "@/components/legal/LegalRender";
import { getLegalDoc } from "@/lib/legal/legalhelper";

export const metadata = {
    title: "Refund Policy | Scanify",
    description: "Read the Refund Policy for using the Scanify platform.",
};

export default function TermsPage() {
    const content = getLegalDoc("refund");

    return (

        <LegalLayout title="Refund Policy" lastUpdated="April 26, 2026">
            <LegalRender content={content} />
        </LegalLayout>
    );
}