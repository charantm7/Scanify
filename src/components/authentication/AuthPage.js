'use client';
import React, { useState, useEffect } from 'react';
import { Mail, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { getSupabaseClient } from '../../lib/supabase/client';
import AuthNavbar from './Navbar';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseClient();

  const [mode, setMode] = useState('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'auth_callback_failed') {
      setAuthError('Email verification link expired or invalid. Please try again.');
    }


    if (localStorage.getItem('remember_me')) {
      const savedEmail = localStorage.getItem('remember_email');
      if (savedEmail) {
        setFormData((prev) => ({ ...prev, email: savedEmail }));
        setRememberMe(true);
      }
    }
  }, []);



  function switchMode(newMode) {
    setMode(newMode);
    setErrors({});
    setAuthError('');
    setFormData({ email: '', password: '' });
  }

  function validate() {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 characters required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    if (mode === 'signup' && !acceptedTerms) {
      setErrors((prev) => ({
        ...prev,
        terms: "You must accept Terms & Conditions",
      }));
      return;
    }
    setLoading(true);
    setAuthError('');

    try {
      if (mode === 'signup') {

        const { data, error: signupError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth-callback?type=signup`,
          },
        });

        if (signupError) throw signupError;

        if (!data?.user || data.user.identities?.length === 0) {
          setAuthError("Account already exists. Please sign in.");
          setLoading(false);
          return;
        }

        localStorage.setItem('signup_email', formData.email);
        toast.success('Account created! Check your email to verify.');
        router.push('/check-mail');

      } else {
        const { data, error: signinError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signinError) throw signinError;
        if (!data?.user) throw new Error('Login failed — no user returned.');

        if (rememberMe) {
          localStorage.setItem('remember_me', 'true');
          localStorage.setItem('remember_email', formData.email);
        } else {
          localStorage.removeItem('remember_me');
          localStorage.removeItem('remember_email');
        }

        const { data: existingUser } = await supabase
          .from('users')
          .select('id, onboarding_complete')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!existingUser) {
          const { error: insertError } = await supabase.from('users').insert({
            id: data.user.id,
            onboarding_complete: false
          });

          if (insertError) throw insertError;
        }

        const destination = existingUser?.onboarding_complete
          ? '/console'
          : '/onboarding';

        toast.success('Welcome back!');
        router.push(destination);

      }

    } catch (error) {
      const msg = error?.message || 'Something went wrong.';
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !loading) handleSubmit();
  }

  return (
    <div className="min-h-screen grid-bg from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <Toaster position="top-right" toastOptions={{ style: { zIndex: 9999 } }} />

      <div
        className="absolute rounded-full bg-accentlt opacity-50 z-[-1] pointer-events-none"
        style={{ width: 600, height: 600, top: -200, right: -100, filter: 'blur(80px)' }}
      />
      <div
        className="absolute rounded-full bg-accentlt opacity-50 z-[-1] pointer-events-none"
        style={{ width: 300, height: 300, bottom: 0, left: -80, filter: 'blur(80px)' }}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <AuthNavbar />

      <div className="relative min-h-screen flex items-center justify-center px-2 py-20">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">

          {/* Auth Card */}
          <div className="relative z-10" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
            <div className="md:bg-theme3 sm:bg-theme3 backdrop-blur-xl rounded-3xl sm:shadow-2xl md:shadow-2xl p-6 md:border sm:border border-theme">

              {/* Mode Toggle */}
              <div className="flex rounded-xl overflow-hidden border border-theme mb-6">
                <button
                  onClick={() => switchMode('signup')}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-all ${mode === 'signup' ? ' bg-submit text-white' : 'text-theme2 hover:bg-theme3'}`}
                >
                  Sign Up
                </button>
                <button
                  onClick={() => switchMode('signin')}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-all ${mode === 'signin' ? 'bg-submit text-white' : 'text-theme2 hover:bg-theme3'}`}
                >
                  Sign In
                </button>
              </div>

              {/* Header */}
              <div className="mb-6">
                <h2 className="text-4xl text-theme font-syne font-bold mb-2">
                  {mode === 'signup' ? 'Join us today' : 'Welcome back'}
                </h2>
                <p className="text-theme2 font-light">
                  {mode === 'signup' ? 'Ready To Scan QR' : 'Sign in to your account'}
                </p>
              </div>

              {/* Auth Error Banner */}
              {authError && (
                <div className="flex items-start gap-2 rounded-xl px-4 py-3 mb-4 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{authError}</p>
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
                        setErrors((p) => ({ ...p, email: '' }));
                        setAuthError('');
                      }}
                      onKeyDown={handleKeyDown}
                      className={`w-full pl-10 pr-4 py-3 bg-auth-input border rounded-xl outline-none transition-all ${errors.email ? 'border-red-500' : 'border-theme'} focus:ring-2 focus:ring-[var(--accent)]`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
                        setErrors((p) => ({ ...p, password: '' }));
                      }}
                      onKeyDown={handleKeyDown}
                      className={`w-full pl-4 pr-10 py-3 bg-auth-input border rounded-xl outline-none transition-all ${errors.password ? 'border-red-500' : 'border-theme'} focus:ring-2 focus:ring-[var(--accent)]`}
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
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                {mode === 'signup' && (
                  <>

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
                    {errors.terms && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.terms}
                      </p>
                    )}
                  </>


                )}

                {mode === 'signin' && (
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
                      {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                    </>
                  ) : mode === 'signup' ? (
                    'Sign Up'
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Phone mockup – unchanged */}
          <div className="hidden md:flex justify-center items-center" style={{ animation: 'slideIn 0.8s ease-out' }}>
            <div className="relative w-[280px]">
              <div
                className="w-[280px] h-[560px] rounded-[44px] bg-card border-[10px] overflow-hidden relative"
                style={{ borderColor: 'var(--phone-border)', boxShadow: 'var(--shadow2), 0 0 0 1px var(--border)' }}
              >
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-[22px] rounded-xl z-10" style={{ background: 'var(--phone-notch)' }} />
                <div className="w-full h-full bg-theme flex flex-col">
                  <div className="pt-11 pb-4 px-4" style={{ background: 'var(--accent)' }}>
                    <h4 className="font-syne text-base font-bold text-white">Grand Palace Hotel</h4>
                    <p className="text-[11px] text-white/75 mt-0.5">Scan · Browse · Enjoy</p>
                  </div>
                  <div className="flex gap-1.5 px-3 pt-3 overflow-x-auto scrollbar-hide">
                    {['Starters', 'Main Course', 'Drinks', 'Desserts'].map((cat, i) => (
                      <div
                        key={cat}
                        className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold ${i === 0 ? 'text-white' : 'text-theme2 bg-theme3'}`}
                        style={i === 0 ? { background: 'var(--accent)' } : {}}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                  <div className="p-2.5 flex-1 overflow-hidden">
                    {[
                      { emoji: '🥗', name: 'Garden Salad', desc: 'Fresh greens, vinaigrette', price: '₹180' },
                      { emoji: '🍜', name: 'Veg Manchurian', desc: 'Indo-Chinese classic', price: '₹220' },
                      { emoji: '🫓', name: 'Garlic Bread', desc: 'Toasted with herb butter', price: '₹120' },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center gap-2.5 bg-card rounded-xl px-3 py-2.5 mb-2 border phone-item-border">
                        <div className="w-10 h-10 rounded-[9px] bg-accentlt flex-shrink-0 flex items-center justify-center text-lg">{item.emoji}</div>
                        <div>
                          <div className="text-xs font-semibold text-theme">{item.name}</div>
                          <div className="text-[10px] text-theme3 mt-px">{item.desc}</div>
                        </div>
                        <div className="ml-auto text-[13px] font-bold text-accent-t flex-shrink-0">{item.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* QR Badge */}
              <div className="absolute -bottom-4 -right-8 bg-card border border-theme2 rounded-[18px] p-3.5 flex items-center gap-3.5" style={{ boxShadow: 'var(--shadow2)' }}>
                <svg width="52" height="52" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="2" fill="none" className="qr-stroke" strokeWidth="2" />
                  <rect x="7" y="7" width="10" height="10" rx="1" className="qr-fill" />
                  <rect x="30" y="2" width="20" height="20" rx="2" fill="none" className="qr-stroke" strokeWidth="2" />
                  <rect x="35" y="7" width="10" height="10" rx="1" className="qr-fill" />
                  <rect x="2" y="30" width="20" height="20" rx="2" fill="none" className="qr-stroke" strokeWidth="2" />
                  <rect x="7" y="35" width="10" height="10" rx="1" className="qr-fill" />
                  <rect x="30" y="30" width="5" height="5" className="qr-fill" />
                  <rect x="37" y="30" width="5" height="5" className="qr-fill" />
                  <rect x="44" y="30" width="5" height="5" className="qr-fill" />
                  <rect x="30" y="37" width="5" height="5" className="qr-fill" />
                  <rect x="44" y="37" width="5" height="5" className="qr-fill" />
                  <rect x="30" y="44" width="5" height="5" className="qr-fill" />
                  <rect x="37" y="44" width="14" height="5" className="qr-fill" />
                </svg>
                <div>
                  <p className="text-xs font-bold text-theme">Scan to view menu</p>
                  <p className="text-[11px] text-theme3 mt-0.5">No app needed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
