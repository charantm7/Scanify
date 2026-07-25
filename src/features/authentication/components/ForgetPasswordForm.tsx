'use client';
import { useState, useEffect } from 'react';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';


export default function ForgetPasswordForm() {
    const { loading, sendPasswordReset, error, clearError } = useAuth();
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);


    async function sendResetLink() {
        if (loading || cooldown > 0) return;
        sendPasswordReset(email, setSent, setCooldown);
    }

    async function resendResetLink() {
        if (loading || cooldown > 0) return;
        setSent(false);
        await sendResetLink();
    }

    const isDisabled = loading || cooldown > 0;

    return (

        <div className="relative z-10" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
            <div className=" backdrop-blur-xl rounded-3xl sm:shadow-2xl p-6 sm:border sm:border-theme">
                <div className="mb-8">
                    <h2 className="text-4xl text-theme font-syne font-bold mb-2">Reset Password</h2>
                    <p className="text-theme2 font-light">We&apos;ll send a secure reset link to your inbox.</p>
                </div>

                <div className="space-y-5">
                    {/* Email field */}
                    <div>
                        <label className="block text-sm font-semibold text-theme mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); clearError() }}
                                onKeyDown={(e) => e.key === 'Enter' && sendResetLink()}
                                disabled={isDisabled}
                                className={`w-full pl-10 pr-4 py-3 bg-auth-input border rounded-xl outline-none transition-all
                                ${error?.email ? 'border-red-500' : 'border-theme'}
                                focus:ring-2 focus:ring-[var(--accent)]
                                disabled:opacity-60 disabled:cursor-not-allowed`}
                                placeholder="you@example.com"
                            />
                        </div>
                        {error?.email && <p className="text-red-500 text-sm mt-1">{error?.email}</p>}
                    </div>

                    {sent && (
                        <div className="flex items-start gap-2 rounded-xl px-4 py-3 bg-[#74c69d]/10 border border-[#74c69d]/40">
                            <CheckCircle size={18} className="text-theme mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-[#74c69d]">
                                Reset link sent to <span className="font-semibold">{email}</span>. Check your inbox (and spam).
                            </p>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={sendResetLink}
                        disabled={isDisabled}
                        className="w-full py-3 rounded-xl bg-submit text-white font-semibold hover:opacity-90 transition
                    disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><Loader2 size={18} className="animate-spin" /> Sending…</>
                        ) : sent ? (
                            <><CheckCircle size={18} /> Link Sent</>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>

                    <div className="flex items-center justify-between text-sm">
                        <button
                            type="button"
                            onClick={resendResetLink}
                            disabled={isDisabled}
                            className={`font-medium transition ${isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-theme3 underline'}`}
                        >
                            Resend reset link
                        </button>
                        {cooldown > 0 && (
                            <span className="text-theme2">
                                Resend in <span className="font-semibold text-theme3">{cooldown}s</span>
                            </span>
                        )}
                    </div>

                    <p className="text-start text-sm text-theme2">
                        Remember your password?{' '}
                        <Link href="/login" className="text-theme3 font-semibold underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>


    );
}
