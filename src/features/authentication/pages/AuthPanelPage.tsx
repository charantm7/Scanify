'use client';
import { useState } from 'react';
import PhoneMockup from '../components/PhoneMockup';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignupForm';
import AuthNavbar from '../../../components/shared/AuthNavbar';
import KeyFrames from '../../../components/ui/KeyFrames';



export default function AuthPanelPage() {

    const [mode, setMode] = useState('signup');



    return (
        <div className="min-h-screen grid-bg from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            <KeyFrames />
            <AuthNavbar />

            <div className="relative min-h-screen flex items-center justify-center px-2 py-20">
                <div className="w-full max-w-6xl grid md:grid-cols-2 sm:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="flex rounded-xl overflow-hidden border bg-theme border-theme mb-6">
                            <button
                                onClick={() => setMode('signup')}
                                className={`flex-1 py-2.5 text-sm font-semibold transition-all ${mode === 'signup' ? ' bg-submit text-white' : 'text-theme2 hover:bg-theme3'}`}
                            >
                                Sign Up
                            </button>
                            <button
                                onClick={() => setMode('signin')}
                                className={`flex-1 py-2.5 text-sm font-semibold transition-all ${mode === 'signin' ? 'bg-submit text-white' : 'text-theme2 hover:bg-theme3'}`}
                            >
                                Sign In
                            </button>
                        </div>
                        {mode === 'signup' ? (
                            <SignUpForm />
                        ) : (
                            <LoginForm />
                        )}
                    </div>

                    <PhoneMockup />

                </div>
            </div>
        </div>
    );
}
