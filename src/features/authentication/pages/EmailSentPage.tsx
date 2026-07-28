'use client';

import AuthNavbar from '../../../components/shared/AuthNavbar';
import KeyFrames from '../../../components/ui/KeyFrames';
import EmailSentForm from '../components/EmailSentForm';

export default function EmailSentPage() {

    return (
        <div className="min-h-screen grid-bg relative overflow-hidden">
            <KeyFrames />

            <AuthNavbar />

            <div className="relative min-h-screen flex items-center justify-center px-4 py-20">
                <EmailSentForm />
            </div>
        </div>
    );
}
