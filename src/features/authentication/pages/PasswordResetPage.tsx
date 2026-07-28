'use client';

import AuthNavbar from '../../../components/shared/AuthNavbar';
import KeyFrames from '../../../components/ui/KeyFrames';
import PasswordResetForm from '../components/PasswordResetForm';
import PhoneMockup from '../components/PhoneMockup';

export default function ResetPasswordPage() {

    return (
        <div className="min-h-screen grid-bg relative overflow-hidden">

            <KeyFrames />
            <AuthNavbar />

            <div className="relative min-h-screen flex items-center justify-center px-2 py-20">
                <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
                    <PasswordResetForm />
                    <PhoneMockup />

                </div>
            </div>
        </div>
    );
}
