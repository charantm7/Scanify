import LegalLayout from "../../../components/legal/LegalLayout";
import LegalRender from "../../../components/legal/LegalRender";
import { getLegalDoc } from "../../../lib/legal/legalhelper";

export const metadata = {
    title: "Privacy Policy | Scanify",
    description: "Read the Privacy Policy for using the Scanify platform.",
};

export default function TermsPage() {
    const content = getLegalDoc("privacy");

    return (
        <LegalLayout title="Privacy Policy" lastUpdated="April 26, 2026">
            <LegalRender content={content} />
        </LegalLayout>
    );
}