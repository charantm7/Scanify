'use client';
import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import toast, { Toaster } from 'react-hot-toast';
import AuthNavbar from './Navbar';

const COOLDOWN_SECONDS = 60;

export default function EmailSent() {
  const supabase = getSupabaseClient();
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleResend() {
    if (loading || cooldown > 0) return;
    const savedEmail = localStorage.getItem('signup_email');
    if (!savedEmail) {
      alert("Email not found. Please signup again.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: savedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth-callback?type=signup`,
        },
      });

      if (error) {
        toast.error(error.message)
        return;
      }
      setResendCount((c) => c + 1);
      setCooldown(COOLDOWN_SECONDS);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid-bg relative overflow-hidden">
      <Toaster position="top-right" toastOptions={{ style: { zIndex: 9999 } }} />
      <div className="absolute rounded-full bg-accentlt opacity-50 pointer-events-none"
        style={{ width: 600, height: 600, top: -200, right: -100, filter: 'blur(80px)' }} />
      <div className="absolute rounded-full bg-accentlt opacity-50 pointer-events-none"
        style={{ width: 300, height: 300, bottom: 0, left: -80, filter: 'blur(80px)' }} />

      <style>{`
        @keyframes fadeInUp {
          from { transform: translateY(30px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes emailBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .email-bounce { animation: emailBounce 2.5s ease-in-out infinite; }
      `}</style>

      <AuthNavbar />

      <div className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md" style={{ animation: 'fadeInUp 0.7s ease-out' }}>
          <div className="bg-theme3 backdrop-blur-xl rounded-3xl shadow-2xl border border-theme p-8 text-center">


            <div className="email-bounce mb-6 flex justify-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: 'var(--accentlt)' }}>
                <Mail size={36} style={{ color: 'var(--accent)' }} />
              </div>
            </div>

            <h1 className="text-3xl font-syne font-bold text-theme mb-2">Check your inbox</h1>
            <p className="text-theme2 text-sm font-light leading-relaxed mb-6">
              We've sent a verification link to your email address. Click it to activate your account and get started.
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
                Didn't receive the email?
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
      </div>
    </div>
  );
}
