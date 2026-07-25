'use client';

import AuthNavbar from '../../../components/ui/AuthNavbar';
import PhoneMockup from '../components/PhoneMockup';
import ForgetPasswordForm from '../components/ForgetPasswordForm';
import KeyFrames from '../../../components/ui/KeyFrames';


export default function ForgetPasswordPage() {

    return (
        <div className="min-h-screen grid-bg from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            <KeyFrames />

            <AuthNavbar />

            <div className="relative min-h-screen flex items-center justify-center px-2 py-20">
                <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">

                    <ForgetPasswordForm />

                    <PhoneMockup />
                </div>
            </div>
        </div>
    );
}
