import LegalLayout from "../../../components/legal/LegalLayout";
import LegalRender from "../../../components/legal/LegalRender";
import { getLegalDoc } from "../../../lib/legal/legalhelper";

export const metadata = {
    title: "Terms and Conditions | Scanify",
    description: "Read the Terms and Conditions for using the Scanify platform.",
};

export default function TermsPage() {
    const content = getLegalDoc("terms");

    return (

        <LegalLayout title="Terms and Conditions" lastUpdated="April 26, 2026">
            <LegalRender content={content} />
        </LegalLayout>
    );
}