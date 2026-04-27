import LegalLayout from "@/components/legal/LegalLayout";
import LegalRender from "@/components/legal/LegalRender";
import { getLegalDoc } from "@/lib/legal/legalhelper";

export const metadata = {
    title: "About Us | Scanify",
    description: "Read the About Us to know about Scanify Platform",
};

export default function TermsPage() {
    const content = getLegalDoc("aboutus");

    return (

        <LegalLayout title="About Us" lastUpdated="April 26, 2026">
            <LegalRender content={content} />
        </LegalLayout>
    );
}