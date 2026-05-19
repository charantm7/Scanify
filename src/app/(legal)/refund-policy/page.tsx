import LegalLayout from "../../../components/legal/LegalLayout";
import LegalRender from "../../../components/legal/LegalRender";
import { getLegalDoc } from "../../../lib/legal/legalhelper";

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