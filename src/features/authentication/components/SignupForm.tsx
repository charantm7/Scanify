'use client';
import { useState, } from 'react';
import { Mail, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { FormData } from '../types';


export default function SignUpForm() {
    const { signUp, error, clearError, loading } = useAuth();

    const searchParams = useSearchParams();

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        email: "",
        password: "",
    });
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const urlAuthError =
        searchParams.get("error") === "auth_callback_failed"
            ? "Email verification link expired or invalid. Please try again."
            : null;


    function handleSubmit() {
        signUp({ email: formData.email, password: formData.password, acceptedTerms: acceptedTerms })
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !loading) handleSubmit();
    }

    return (

        <div className="relative z-10" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
            <div className="md:bg-theme3 sm:bg-theme3 backdrop-blur-xl rounded-3xl sm:shadow-2xl md:shadow-2xl p-6 md:border sm:border border-theme">

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-4xl text-theme font-syne font-bold mb-2">
                        Join us today
                    </h2>
                    <p className="text-theme2 font-light">
                        Ready To Scan QR
                    </p>
                </div>

                {error?.server && (
                    <div className="flex items-center gap-3 rounded-lg border mb-5 border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                        <p>{error.server}</p>
                    </div>
                )}

                {/* Auth Error Banner */}
                {urlAuthError && (
                    <div className="flex items-start gap-2 rounded-xl px-4 py-3 mb-4 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                        <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-600 dark:text-red-400">{urlAuthError}</p>
                    </div>
                )}

                <div className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-theme mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value });
                                    clearError();
                                }}
                                onKeyDown={handleKeyDown}
                                className={`w-full pl-10 pr-4 py-3 bg-auth-input border rounded-xl outline-none transition-all ${error?.email ? 'border-red-500' : 'border-theme'} focus:ring-2 focus:ring-[var(--accent)]`}
                                placeholder="you@example.com"
                            />
                        </div>
                        {error?.email && <p className="text-red-500 text-sm mt-1">{error?.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-theme mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => {
                                    setFormData({ ...formData, password: e.target.value });
                                    clearError();
                                }}
                                onKeyDown={handleKeyDown}
                                className={`w-full pl-4 pr-10 py-3 bg-auth-input border rounded-xl outline-none transition-all ${error?.password ? 'border-red-500' : 'border-theme'} focus:ring-2 focus:ring-[var(--accent)]`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {error?.password && <p className="text-red-500 text-sm mt-1">{error?.password}</p>}
                    </div>


                    <label className="flex items-center gap-2 text-[11px] md:text-sm text-theme cursor-pointer text-neutral-500">
                        <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="accent-[var(--accent)]"
                        />
                        <span>
                            I agree to the{" "}
                            <a href="/terms-&-conditions" className="underline hover:text-black dark:hover:text-white">
                                Terms & Conditions
                            </a>{" "}
                            and{" "}
                            <a href="/privacy-policy" className="underline hover:text-black dark:hover:text-white">
                                Privacy Policy
                            </a>
                        </span>
                    </label>
                    {error?.terms && (
                        <p className="text-red-500 text-sm mt-1">
                            {error?.terms}
                        </p>
                    )}

                    {/* CTA */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-submit text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            'Sign Up'
                        )}
                    </button>
                </div>
            </div>
        </div>

    );
}
