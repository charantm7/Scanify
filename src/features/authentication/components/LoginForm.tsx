'use client';
import { useState, useEffect } from 'react';
import { Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { InputForm } from './InputForms';
import { useAuth } from '../hooks/useAuth';
import { FormData } from '../types';


export default function LoginForm() {
    const { signIn, error, clearError, loading } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('remember_me')
    });
    const [formData, setFormData] = useState<FormData>(() => {
        if (typeof window === 'undefined') {
            return {
                email: "",
                password: "",
            }
        }

        return {
            email: localStorage.getItem('remember_email') || "",
            password: ""
        }
    });


    function handleSubmit() {
        signIn({ email: formData.email, password: formData.password, rememberMe: rememberMe });
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter' && !loading) {
            handleSubmit();
        }
    }

    return (
        <div className="relative z-10" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
            <div className="md:bg-theme3 sm:bg-theme3 backdrop-blur-xl rounded-3xl sm:shadow-2xl md:shadow-2xl p-6 md:border sm:border border-theme">

                <div className="mb-6">
                    <h2 className="text-4xl text-theme font-syne font-bold mb-2">
                        Welcome back
                    </h2>
                    <p className="text-theme2 font-light">
                        Sign in to your account
                    </p>
                </div>


                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-theme mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <InputForm
                                type={'email'}
                                value={formData.email}
                                placeholder={"you@example.com"}
                                error={error?.email}
                                onChange={
                                    (value) => {
                                        setFormData({ ...formData, email: value });
                                        clearError();
                                    }
                                }
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        {error?.email && <p className="text-red-500 text-sm mt-1">{error?.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-theme mb-2">Password</label>
                        <div className="relative">
                            <InputForm
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                placeholder={"••••••••"}
                                error={error?.password}
                                onChange={
                                    (value) => {
                                        setFormData({ ...formData, password: value });
                                        clearError();
                                    }
                                }
                                onKeyDown={handleKeyDown}
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

                    <div className="flex items-center justify-between mt-2">
                        <label className="flex items-center gap-2 text-sm text-theme cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="accent-[var(--accent)]"
                            />
                            Remember me
                        </label>

                        <Link href="/forget-password" className="text-sm text-theme hover:underline">
                            Forgot password?
                        </Link>

                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-submit text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
