'use client';
import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseClient } from '@/lib/supabase/client';
import AuthNavbar from './Navbar';

const COOLDOWN_SECONDS = 60;

export default function ForgetPassword() {
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);


  function validate() {
    if (!email.trim()) { setEmailError('Enter your email first'); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailError('Enter a valid email address'); return false; }
    setEmailError('');
    return true;
  }

  async function sendResetLink() {
    if (!validate() || loading || cooldown > 0) return;
    setLoading(true);
    setApiError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth-callback?type=recovery`,
    });

    setLoading(false);
    if (error) {
      setApiError(error.message);
    } else {
      setSent(true);
      setCooldown(COOLDOWN_SECONDS);
    }
  }

  async function resendResetLink() {
    if (loading || cooldown > 0) return;
    setSent(false);
    await sendResetLink();
  }

  const isDisabled = loading || cooldown > 0;

  return (
    <div className="min-h-screen grid-bg from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="absolute rounded-full bg-accentlt opacity-50 pointer-events-none"
        style={{ width: 600, height: 600, top: -200, right: -100, filter: 'blur(80px)' }} />
      <div className="absolute rounded-full bg-accentlt opacity-50 pointer-events-none"
        style={{ width: 300, height: 300, bottom: 0, left: -80, filter: 'blur(80px)' }} />

      <style>{`
        @keyframes fadeInUp {
          from { transform: translateY(30px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
      `}</style>


      <AuthNavbar />

      <div className="relative min-h-screen flex items-center justify-center px-2 py-20">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">

          {/* Auth Card */}
          <div className="relative z-10" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
            <div className="bg-theme3 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-theme">
              <div className="mb-8">
                <h2 className="text-4xl text-theme font-syne font-bold mb-2">Reset Password</h2>
                <p className="text-theme2 font-light">We'll send a secure reset link to your inbox.</p>
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
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); setApiError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && sendResetLink()}
                      disabled={isDisabled}
                      className={`w-full pl-10 pr-4 py-3 bg-auth-input border rounded-xl outline-none transition-all
                        ${emailError ? 'border-red-500' : 'border-theme'}
                        focus:ring-2 focus:ring-[var(--accent)]
                        disabled:opacity-60 disabled:cursor-not-allowed`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                </div>

                {apiError && <p className="text-red-500 text-sm">{apiError}</p>}

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

                <p className="text-center text-sm text-theme2">
                  Remember your password?{' '}
                  <Link href="/login" className="text-theme3 font-semibold underline">Sign in</Link>
                </p>
              </div>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="hidden md:flex justify-center items-center" style={{ animation: 'slideIn 0.8s ease-out' }}>
            <div className="relative w-[280px]">
              <div className="w-[280px] h-[560px] rounded-[44px] bg-card border-[10px] overflow-hidden relative"
                style={{ borderColor: 'var(--phone-border)', boxShadow: 'var(--shadow2), 0 0 0 1px var(--border)' }}>
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-[22px] rounded-xl z-10"
                  style={{ background: 'var(--phone-notch)' }} />
                <div className="w-full h-full bg-theme flex flex-col">
                  <div className="pt-11 pb-4 px-4" style={{ background: 'var(--accent)' }}>
                    <h4 className="font-syne text-base font-bold text-white">Grand Palace Hotel</h4>
                    <p className="text-[11px] text-white/75 mt-0.5">Scan · Browse · Enjoy</p>
                  </div>
                  <div className="flex gap-1.5 px-3 pt-3 overflow-x-auto">
                    {['Starters', 'Main Course', 'Drinks', 'Desserts'].map((cat, i) => (
                      <div key={cat}
                        className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold ${i === 0 ? 'text-white' : 'text-theme2 bg-theme3'}`}
                        style={i === 0 ? { background: 'var(--accent)' } : {}}>
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
              <div className="absolute -bottom-4 -right-8 bg-card border border-theme2 rounded-[18px] p-3.5 flex items-center gap-3.5"
                style={{ boxShadow: 'var(--shadow2)' }}>
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
