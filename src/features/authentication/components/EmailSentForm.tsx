'use client';
import { useState, useEffect } from 'react';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';


export default function EmailSentForm() {
    const { loading, resendEmail } = useAuth();
    const [cooldown, setCooldown] = useState<number>(0);
    const [resendCount, setResendCount] = useState<number>(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    function handleResend() {
        if (loading || cooldown > 0) return;
        resendEmail(setResendCount, setCooldown)
    }


    return (

        <div className="w-full max-w-md" style={{ animation: 'fadeInUp 0.7s ease-out' }}>
            <div className="bg-theme3 backdrop-blur-xl rounded-3xl shadow-2xl border border-theme p-8 text-center">


                <div className="email-bounce mb-6 flex justify-center">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: 'var(--accentlt)' }}>
                        <Mail size={36} style={{ color: 'var(--accent)' }} />
                    </div>
                </div>

                <h1 className="text-3xl font-syne font-bold text-theme mb-2">Check your inbox</h1>
                <p className="text-theme2 text-sm font-light leading-relaxed mb-6">
                    We&apos;ve sent a verification link to your email address. Click it to activate your account and get started.
                </p>

                {/* Checklist */}
                <div className="text-left space-y-2.5 mb-7 px-2">
                    {[
                        'Open your email inbox',
                        'Look for an email from Scanify',
                        'Click the "Confirm your email" link',
                        'Check spam/junk if you don\'t see it',
                    ].map((step, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-theme2">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold"
                                style={{ background: 'var(--accent)' }}>
                                {i + 1}
                            </div>
                            {step}
                        </div>
                    ))}
                </div>

                {/* Resend section */}
                <div className="border-t pt-5" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs text-theme2 mb-3">
                        Didn&apos;t receive the email?
                        {resendCount > 0 && <span className="text-[#74c69d] font-semibold"> Sent {resendCount} time{resendCount > 1 ? 's' : ''}</span>}
                    </p>
                    <button
                        onClick={handleResend}
                        disabled={loading || cooldown > 0}
                        className="w-full py-3 rounded-xl border font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-theme3"
                        style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                    >
                        {loading ? (
                            <><RefreshCw size={15} className="animate-spin" /> Sending...</>
                        ) : cooldown > 0 ? (
                            `Resend in ${cooldown}s`
                        ) : (
                            <><RefreshCw size={15} /> Resend verification email</>
                        )}
                    </button>
                </div>

                <Link href="/login" className="flex items-center justify-center gap-1.5 mt-4 text-sm text-theme2 hover:text-theme transition-colors">
                    <ArrowLeft size={14} /> Back to sign in
                </Link>
            </div>
        </div>
    );
}
