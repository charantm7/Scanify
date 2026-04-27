'use client';
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { getSupabaseClient } from '@/lib/supabase/client';
import AuthNavbar from './Navbar';
import { cookies } from 'next/headers';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [theme, setTheme] = useState('light');
  const [done, setDone] = useState(false);

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
  }, []);



  function validate() {
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleReset() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: formData.password });
      if (error) throw error;

      setDone(true);
      toast.success('Password updated successfully!');

      setTimeout(async () => {
        await supabase.auth.signOut();

        await fetch('/api/clear-recovery', { method: 'POST' });

        router.push('/login?reset=success');
      }, 2000);
    } catch (error) {
      const msg = error?.message || 'Failed to update password. Try again.';
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function getStrength(pwd) {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (score === 2) return { level: 2, label: 'Fair', color: '#f97316' };
    if (score === 3) return { level: 3, label: 'Good', color: '#eab308' };
    return { level: 4, label: 'Strong', color: '#74c69d' };
  }

  const strength = getStrength(formData.password);

  return (
    <div className="min-h-screen grid-bg relative overflow-hidden">
      <Toaster position="top-right" />

      <div className="absolute rounded-full bg-accentlt opacity-50 pointer-events-none"
        style={{ width: 600, height: 600, top: -200, right: -100, filter: 'blur(80px)' }} />
      <div className="absolute rounded-full bg-accentlt opacity-50 pointer-events-none"
        style={{ width: 300, height: 300, bottom: 0, left: -80, filter: 'blur(80px)' }} />

      <style>{`
        @keyframes fadeInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <AuthNavbar />

      <div className="relative min-h-screen flex items-center justify-center px-2 py-20">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">

          <div className="relative z-10" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
            <div className="bg-theme3 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-theme">

              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--accent)' }}>
                  <ShieldCheck size={24} color="white" />
                </div>
                <h2 className="text-4xl text-theme font-syne font-bold mb-2">Reset password</h2>
                <p className="text-theme2 font-light">
                  {done ? 'Your password has been updated!' : sessionReady ? 'Choose a strong new password for your account.' : 'Verifying your reset link…'}
                </p>
              </div>

              {/* Success state */}
              {done && (
                <div className="flex flex-col items-center py-8 gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accentlt)' }}>
                    <CheckCircle2 size={32} style={{ color: 'var(--accent)' }} />
                  </div>
                  <p className="text-theme font-semibold">Password updated!</p>
                  <p className="text-sm text-theme2">Redirecting you to sign in…</p>
                </div>
              )}

              {/* Error: invalid/expired link */}
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
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                        className={`w-full pl-4 pr-10 py-3 bg-auth-input border rounded-xl outline-none transition-all ${errors.password ? 'border-red-500' : 'border-theme'} focus:ring-2 focus:ring-[var(--accent)]`}
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {formData.password.length > 0 && (
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
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-theme mb-2">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                        className={`w-full pl-4 pr-10 py-3 bg-auth-input border rounded-xl outline-none transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-theme'} focus:ring-2 focus:ring-[var(--accent)]`}
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {formData.confirmPassword.length > 0 && (
                      <p className="text-xs mt-1" style={{ color: formData.password === formData.confirmPassword ? '#74c69d' : '#ef4444' }}>
                        {formData.password === formData.confirmPassword ? '✓ Passwords match' : 'Passwords do not match'}
                      </p>
                    )}
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>

                  {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}

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

          {/* Phone mockup (right side - unchanged from original) */}
          <div className="hidden md:flex justify-center items-center" style={{ animation: 'slideIn 0.8s ease-out' }}>
            <div className="relative w-[280px]">
              <div className="w-[280px] h-[560px] rounded-[44px] bg-card border-[10px] overflow-hidden relative"
                style={{ borderColor: 'var(--phone-border)', boxShadow: 'var(--shadow2), 0 0 0 1px var(--border)' }}>
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-[22px] rounded-xl z-10" style={{ background: 'var(--phone-notch)' }} />
                <div className="w-full h-full bg-theme flex flex-col">
                  <div className="pt-11 pb-4 px-4" style={{ background: 'var(--accent)' }}>
                    <h4 className="font-syne text-base font-bold text-white">Grand Palace Hotel</h4>
                    <p className="text-[11px] text-white/75 mt-0.5">Scan · Browse · Enjoy</p>
                  </div>
                  <div className="flex gap-1.5 px-3 pt-3 overflow-x-auto scrollbar-hide">
                    {['Starters', 'Main Course', 'Drinks', 'Desserts'].map((cat, i) => (
                      <div key={cat} className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold ${i === 0 ? 'text-white' : 'text-theme2 bg-theme3'}`}
                        style={i === 0 ? { background: 'var(--accent)' } : {}}>{cat}</div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
