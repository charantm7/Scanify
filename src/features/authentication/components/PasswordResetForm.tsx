'use client';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { PasswordResetPayload } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getPasswordStrength } from '../services/login.services';
import { useApp } from '../../../context/AppContext';


export default function PasswordResetForm() {

    const { supabase } = useApp();
    const { updatePasswordError, loading, updatePassword, clearError, router } = useAuth();

    const [formData, setFormData] = useState<PasswordResetPayload>({ next: '', confirm: '', isRecovery: true });
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [done, setDone] = useState<boolean>(false);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [sessionReady, setSessionReady] = useState<boolean>(false);
    const [sessionError, setSessionError] = useState('');

    useEffect(() => {
        let isReady = false;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
                isReady = true;
                setSessionReady(true);
                setSessionError('');
            }
        });

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                isReady = true;
                setSessionReady(true);
            }
        });

        const timeout = setTimeout(() => {
            if (!isReady) {
                setSessionError('This reset link has expired or is invalid. Please request a new one.');
            }
        }, 5000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, [supabase.auth]);



    async function handleReset() {
        const result = await updatePassword(formData);

        if (result?.success) {
            setDone(result.success);
            setTimeout(async () => {
                await supabase.auth.signOut();

                await fetch('/api/clear-recovery', { method: 'POST' });

                router.push('/login?reset=success');
            }, 2000);

        }
    }

    const strength = getPasswordStrength(formData.next);

    return (
        <div className="relative z-10" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
            <div className="bg-theme3 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-theme">

                <div className="mb-8">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--accent)' }}>
                        <ShieldCheck size={24} color="white" />
                    </div>
                    <h2 className="text-4xl text-theme font-syne font-bold mb-2">Reset password</h2>
                    <p className="text-theme2 font-light">
                        {sessionReady ? 'Choose a strong new password for your account.' : 'Verifying your reset link…'}
                    </p>
                </div>

                {done && (
                    <div className="flex flex-col items-center py-8 gap-4 text-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accentlt)' }}>
                            <CheckCircle2 size={32} style={{ color: 'var(--accent)' }} />
                        </div>
                        <p className="text-theme font-semibold">Password updated!</p>
                        <p className="text-sm text-theme2">Redirecting you to sign in…</p>
                    </div>
                )}



                {!sessionReady && !done && sessionError && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 rounded-xl px-4 py-3 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                            <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-600 dark:text-red-400">{sessionError}</p>
                        </div>
                        <Link href="/forget-password">
                            <button className="w-full py-3 rounded-xl text-white font-semibold text-sm" style={{ background: 'var(--accent)' }}>
                                Request a new reset link
                            </button>
                        </Link>
                    </div>
                )}

                {/* Loading: waiting for PASSWORD_RECOVERY event */}
                {!sessionReady && !done && !sessionError && (
                    <div className="flex items-center justify-center py-8 gap-3 text-theme2">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="text-sm">Verifying link, please wait…</span>
                    </div>
                )}

                {/* Form */}
                {sessionReady && !done && (
                    <div className="space-y-5">
                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-semibold text-theme mb-2">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.next}
                                    onChange={(e) => { clearError(), setFormData({ ...formData, next: e.target.value }) }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                                    className={`w-full pl-4 pr-10 py-3 bg-auth-input border rounded-xl outline-none transition-all ${updatePasswordError?.password ? 'border-red-500' : 'border-theme'} focus:ring-2 focus:ring-[var(--accent)]`}
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {formData.next.length > 0 && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4].map((bar) => (
                                            <div key={bar} className="h-1 flex-1 rounded-full transition-all duration-300"
                                                style={{ background: bar <= strength.level ? strength.color : 'var(--border)' }} />
                                        ))}
                                    </div>
                                    <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
                                </div>
                            )}
                            {updatePasswordError?.password && <p className="text-red-500 text-sm mt-1">{updatePasswordError?.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold text-theme mb-2">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={formData.confirm}
                                    onChange={(e) => { clearError(), setFormData({ ...formData, confirm: e.target.value }) }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                                    className={`w-full pl-4 pr-10 py-3 bg-auth-input border rounded-xl outline-none transition-all ${updatePasswordError?.confirmPassword ? 'border-red-500' : 'border-theme'} focus:ring-2 focus:ring-[var(--accent)]`}
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {formData.confirm.length > 0 && (
                                <p className="text-xs mt-1" style={{ color: formData.next === formData.confirm ? '#09a055' : '#ef4444' }}>
                                    {formData.next === formData.confirm ? '✓ Passwords match' : 'Passwords do not match'}
                                </p>
                            )}
                            {updatePasswordError?.confirmPassword && <p className="text-red-500 text-sm mt-1">{updatePasswordError?.confirmPassword}</p>}
                        </div>

                        {updatePasswordError?.general && <p className="text-red-500 text-sm">{updatePasswordError?.general}</p>}

                        <button onClick={handleReset} disabled={loading}
                            className="w-full py-3 rounded-xl bg-submit text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            {loading ? (<><Loader2 size={18} className="animate-spin" /> Updating…</>) : 'Update Password'}
                        </button>

                        <p className="text-center text-sm text-theme2">
                            Remember your password?{' '}
                            <Link href="/login" className="text-theme underline font-semibold">Sign in</Link>
                        </p>
                    </div>
                )}
            </div>
        </div>



    );
}
