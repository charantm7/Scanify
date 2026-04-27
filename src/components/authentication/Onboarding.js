'use client';
import React, { useState, useEffect } from 'react';
import {
  Building2, MapPin, Phone, User, FileText, Hash,
  ChevronRight, ChevronLeft, Loader2, CheckCircle2,
  Image as ImageIcon, Globe, Sparkles, Store, Navigation, ContactRound, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { getSupabaseClient } from '@/lib/supabase/client';
import { subdomainUrlBuilderWithWindow } from '@/context/Service';
import AuthNavbar from './Navbar';

const STEPS = [
  {
    id: 1, label: 'Basic Info', sublabel: 'Restaurant identity', icon: Store,
    description: 'Tell us about your restaurant — name, vibe, and how guests see you.',
  },
  {
    id: 2, label: 'Location', sublabel: 'Where you are', icon: Navigation,
    description: 'Your address helps guests find you and keeps your profile accurate.',
  },
  {
    id: 3, label: 'Contact', sublabel: 'Admin details', icon: ContactRound,
    description: 'Well use these details for your account and to reach you if needed.',
  },
];

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-theme mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1.5">⚠ {error}</p>}
    </div>
  );
}

function Input({ icon: Icon, error, className = '', ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme2 pointer-events-none">
          <Icon size={15} />
        </div>
      )}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-auth-input border rounded-xl outline-none transition-all text-theme placeholder:text-theme3 text-sm
          ${error ? 'border-red-400 focus:ring-2 focus:ring-red-300' : 'border-theme focus:ring-2 focus:ring-[var(--accent)]'} ${className}`}
      />
    </div>
  );
}

function Textarea({ icon: Icon, error, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-3.5 text-theme2 pointer-events-none">
          <Icon size={15} />
        </div>
      )}
      <textarea
        rows={3}
        {...props}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-auth-input border rounded-xl outline-none transition-all text-theme placeholder:text-theme3 resize-none text-sm
          ${error ? 'border-red-400 focus:ring-2 focus:ring-red-300' : 'border-theme focus:ring-2 focus:ring-[var(--accent)]'}`}
      />
    </div>
  );
}

function SuccessScreen({ url, restaurantName, onGoToConsole }) {


  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'var(--accentlt)' }}
      >
        <Sparkles size={36} style={{ color: 'var(--accent)' }} />
      </div>
      <h2 className="font-syne font-bold text-3xl text-theme mb-2">You're all set! 🎉</h2>
      <p className="text-theme2 text-sm mb-8 max-w-sm">
        Your restaurant profile has been created. Your menu is live at:
      </p>

      <div
        className="w-full max-w-md rounded-2xl border p-5 mb-6 text-left"
        style={{ borderColor: 'var(--accent)', background: 'var(--accentlt)' }}
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
          Your menu URL
        </p>
        <div className="flex items-center justify-between gap-3">
          <code className="text-sm font-bold text-theme break-all">{url}</code>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition hover:opacity-80"
            style={{ background: 'var(--accent)' }}
          >
            Open <ExternalLink size={12} />
          </a>
        </div>
        <p className="text-xs text-theme2 mt-2">
          Share this link or generate a QR code from your console.
        </p>
      </div>

      <button
        onClick={onGoToConsole}
        className="w-full max-w-md py-3.5 rounded-xl text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
        style={{ background: 'var(--accent)' }}
      >
        Go to Console <ChevronRight size={17} />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [animDir, setAnimDir] = useState('forward');
  const [animating, setAnimating] = useState(false);
  const [done, setDone] = useState(false);
  const [createdSlug, setCreatedSlug] = useState('');

  const [form, setForm] = useState({
    restaurant_name: '', description: '', logo_url: '',
    address: '', city: '', pincode: '',
    name: '', phone: '', website: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return; }
      setUserId(session.user.id);
      const meta = session.user.user_metadata;
      if (meta?.full_name) setForm((f) => ({ ...f, name: meta.full_name }));
    });
  }, []);



  function set(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((err) => ({ ...err, [field]: '' }));
    };
  }

  function validateStep(s) {
    const e = {};
    if (s === 1) {
      if (!form.restaurant_name.trim()) e.restaurant_name = 'Restaurant name is required';
      if (!form.description.trim()) e.description = 'Please add a short description';
    }
    if (s === 2) {
      if (!form.address.trim()) e.address = 'Address is required';
      if (!form.city.trim()) e.city = 'City is required';
      if (!form.pincode.trim()) e.pincode = 'Pincode is required';
      else if (!/^\d{4,10}$/.test(form.pincode)) e.pincode = 'Enter a valid pincode';
    }
    if (s === 3) {
      if (!form.name.trim()) e.name = 'Your name is required';
      if (!form.phone.trim()) e.phone = 'Phone number is required';
      else if (!/^\+?[\d\s\-]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goNext() {
    if (!validateStep(step) || animating) return;
    setAnimDir('forward');
    setAnimating(true);
    setTimeout(() => { setStep((s) => s + 1); setAnimating(false); }, 220);
  }

  function goPrev() {
    if (animating) return;
    setAnimDir('backward');
    setAnimating(true);
    setTimeout(() => { setStep((s) => s - 1); setAnimating(false); }, 220);
  }

  async function handleSubmit() {
    if (!validateStep(3)) return;
    if (!userId) { toast.error('Session expired. Please sign in again.'); return; }

    setLoading(true);
    try {
      const slug = form.restaurant_name.trim().toLowerCase()
        .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const { error: hotelErr } = await supabase.from('hotels').insert({
        owner_id: userId,
        name: form.restaurant_name.trim(),
        description: form.description.trim(),
        logo_url: form.logo_url.trim() || null,
        address: `${form.address.trim()}, ${form.city.trim()}`,
        pincode: parseInt(form.pincode, 10),
        slug: slug,
      });
      if (hotelErr) throw hotelErr;

      const { error: userErr } = await supabase.from('users').update({
        name: form.name.trim(),
        phone: form.phone.trim(),
        restaurant_name: form.restaurant_name.trim(),
        onboarding_complete: true,
      }).eq('id', userId);
      if (userErr) throw userErr;

      setCreatedSlug(slug);
      toast.success('Restaurant profile created! 🎉');
      setDone(true);
    } catch (err) {
      const msg = err?.message || 'Something went wrong.';
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const completedFields = {
    1: [form.restaurant_name, form.description].filter(Boolean).length,
    2: [form.address, form.city, form.pincode].filter(Boolean).length,
    3: [form.name, form.phone].filter(Boolean).length,
  };
  const stepTotals = { 1: 2, 2: 3, 3: 2 };

  const destinationBuilder = () => {
    const host = window.location.hostname.includes('localhost');

    if (host) {
      router.push(`/console?hotel=${createdSlug}`)
    } else {
      window.location.href = `https://${window.location.host}/console`
    }
  }



  return (
    <div className="min-h-screen grid-bg relative overflow-hidden">
      <Toaster position="top-right" toastOptions={{ style: { zIndex: 9999 } }} />

      <div className="absolute rounded-full bg-accentlt opacity-40 pointer-events-none"
        style={{ width: 500, height: 500, top: -150, right: -80, filter: 'blur(80px)' }} />
      <div className="absolute rounded-full bg-accentlt opacity-30 pointer-events-none"
        style={{ width: 300, height: 300, bottom: 0, left: -80, filter: 'blur(80px)' }} />

      <style>{`
        @keyframes slideForward { from { transform:translateX(40px);opacity:0; } to { transform:translateX(0);opacity:1; } }
        @keyframes slideBackward { from { transform:translateX(-40px);opacity:0; } to { transform:translateX(0);opacity:1; } }
        @keyframes fadeInUp { from { transform:translateY(20px);opacity:0; } to { transform:translateY(0);opacity:1; } }
        .anim-forward { animation: slideForward 0.3s ease-out forwards; }
        .anim-backward { animation: slideBackward 0.3s ease-out forwards; }
      `}</style>

      <AuthNavbar />

      <div className="relative min-h-screen flex items-center justify-center px-4 pt-28 pb-12">
        <div className={`w-full ${done ? 'max-w-2xl' : 'max-w-6xl grid lg:grid-cols-[1fr_380px] gap-8 items-start'}`}>

          {done ? (
            <div className="bg-theme3 rounded-3xl border border-theme p-8 shadow-2xl" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
              <SuccessScreen
                url={subdomainUrlBuilderWithWindow(createdSlug)}
                restaurantName={form.restaurant_name}
                onGoToConsole={() => destinationBuilder()}
              />
            </div>
          ) : (
            <>
              {/* ── LEFT: Form ── */}
              <div className="bg-theme3 backdrop-blur-xl rounded-3xl shadow-2xl border border-theme p-8 min-h-[520px] flex flex-col" style={{ animation: 'fadeInUp 0.6s ease-out' }}>

                <div className="mb-7">
                  <div className="flex items-center gap-2 mb-2">
                    {React.createElement(STEPS[step - 1].icon, { size: 14, style: { color: 'var(--accent)' } })}
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                      Step {step} of {STEPS.length}
                    </span>
                  </div>
                  <h2 className="text-3xl font-syne font-bold text-theme mb-1">{STEPS[step - 1].label}</h2>
                  <p className="text-sm text-theme2 font-light leading-relaxed">{STEPS[step - 1].description}</p>
                </div>

                <div
                  key={step}
                  className={!animating ? (animDir === 'forward' ? 'anim-forward' : 'anim-backward') : 'opacity-0'}
                  style={{ flex: 1 }}
                >
                  {step === 1 && (
                    <div className="space-y-5">
                      <Field label="Restaurant / Hotel Name *" error={errors.restaurant_name}>
                        <Input icon={Building2} placeholder="e.g. Grand Palace Hotel" value={form.restaurant_name} onChange={set('restaurant_name')} error={errors.restaurant_name} />
                      </Field>
                      <Field label="Description *" error={errors.description}>
                        <Textarea icon={FileText} placeholder="Briefly describe your restaurant — cuisine, vibe, specialties…" value={form.description} onChange={set('description')} error={errors.description} />
                      </Field>
                      <Field label="Logo URL (optional)">
                        <Input icon={ImageIcon} placeholder="https://your-logo.com/logo.png" value={form.logo_url} onChange={set('logo_url')} />
                      </Field>
                    </div>
                  )}
                  {step === 2 && (
                    <div className="space-y-5">
                      <Field label="Street Address *" error={errors.address}>
                        <Textarea icon={MapPin} placeholder="e.g. 42, MG Road, Near Central Mall" value={form.address} onChange={set('address')} error={errors.address} />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="City *" error={errors.city}>
                          <Input placeholder="e.g. Bengaluru" value={form.city} onChange={set('city')} error={errors.city} />
                        </Field>
                        <Field label="Pincode *" error={errors.pincode}>
                          <Input icon={Hash} placeholder="560001" value={form.pincode} onChange={set('pincode')} error={errors.pincode} maxLength={10} inputMode="numeric" />
                        </Field>
                      </div>
                    </div>
                  )}
                  {step === 3 && (
                    <div className="space-y-5">
                      <Field label="Your Full Name *" error={errors.name}>
                        <Input icon={User} placeholder="e.g. Rahul Sharma" value={form.name} onChange={set('name')} error={errors.name} />
                      </Field>
                      <Field label="Admin Phone *" error={errors.phone}>
                        <Input icon={Phone} placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} error={errors.phone} inputMode="tel" />
                      </Field>
                      <Field label="Website (optional)">
                        <Input icon={Globe} placeholder="https://yourrestaurant.com" value={form.website} onChange={set('website')} />
                      </Field>
                      {errors.general && (
                        <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-200">⚠ {errors.general}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="mt-6 mb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-theme2">Overall progress</span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                      {Math.round(((step - 1) / STEPS.length) * 100 + (completedFields[step] / stepTotals[step]) * (100 / STEPS.length))}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${((step - 1) / STEPS.length) * 100 + (completedFields[step] / stepTotals[step]) * (100 / STEPS.length)}%`,
                        background: 'var(--accent)',
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  {step > 1 && (
                    <button onClick={goPrev} className="flex-1 py-3 rounded-xl border text-theme font-semibold hover:bg-theme3 transition flex items-center justify-center gap-2 text-sm" style={{ borderColor: 'var(--border)' }}>
                      <ChevronLeft size={17} /> Back
                    </button>
                  )}
                  {step < STEPS.length ? (
                    <button onClick={goNext} className="flex-1 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 text-sm" style={{ background: 'var(--accent)' }}>
                      Continue <ChevronRight size={17} />
                    </button>
                  ) : (
                    <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm" style={{ background: 'var(--accent)' }}>
                      {loading ? <><Loader2 size={17} className="animate-spin" /> Saving…</> : <><Sparkles size={17} /> Launch my restaurant</>}
                    </button>
                  )}
                </div>

                <p className="text-center text-xs text-theme2 mt-4">You can update all these details later from your dashboard.</p>
              </div>

              {/* ── RIGHT: Timeline ── */}
              <div className="hidden lg:flex flex-col gap-0 sticky top-32" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
                <div className="bg-theme3 rounded-3xl border border-theme p-6 mb-4 shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                      <Building2 size={20} color="white" />
                    </div>
                    <div>
                      <p className="text-xs text-theme2 font-medium">Setting up</p>
                      <p className="text-sm font-bold font-syne text-theme">{form.restaurant_name || 'Your Restaurant'}</p>
                    </div>
                  </div>
                  {form.restaurant_name && (
                    <div className="mt-3 px-3 py-2 rounded-xl text-xs font-mono" style={{ background: 'var(--accentlt)', color: 'var(--accent)' }}>
                      {form.restaurant_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.scanify.app
                    </div>
                  )}
                  {form.city && (
                    <div className="flex items-center gap-2 text-xs text-theme2 mt-2">
                      <MapPin size={12} style={{ color: 'var(--accent)' }} />
                      <span>{form.city}{form.pincode ? ` — ${form.pincode}` : ''}</span>
                    </div>
                  )}
                </div>

                <div className="bg-theme3 rounded-3xl border border-theme p-6 shadow-xl">
                  <p className="text-xs font-bold uppercase tracking-widest text-theme2 mb-5">Your progress</p>
                  <div className="relative">
                    {STEPS.map((s, idx) => {
                      const isDone = step > s.id;
                      const isActive = step === s.id;
                      const isPending = step < s.id;
                      const Icon = s.icon;
                      return (
                        <div key={s.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500"
                              style={{
                                background: isDone || isActive ? 'var(--accent)' : 'var(--border)',
                                opacity: isPending ? 0.4 : 1,
                                boxShadow: isActive ? '0 0 0 4px var(--accentlt)' : 'none',
                              }}
                            >
                              {isDone ? <CheckCircle2 size={16} color="white" /> : <Icon size={15} color={isActive ? 'white' : 'var(--text2)'} />}
                            </div>
                            {idx < STEPS.length - 1 && (
                              <div className="w-0.5 my-1 rounded-full transition-all duration-700"
                                style={{ height: 40, background: isDone ? 'var(--accent)' : 'var(--border)', opacity: isPending ? 0.3 : 1 }} />
                            )}
                          </div>
                          <div className="pt-1 flex-1" style={{ paddingBottom: idx < STEPS.length - 1 ? '24px' : '0' }}>
                            <div className="flex items-center justify-between mb-0.5">
                              <p className="text-sm font-semibold" style={{ color: isActive ? 'var(--accent)' : isDone ? 'var(--text)' : 'var(--text2)', opacity: isPending ? 0.5 : 1 }}>
                                {s.label}
                              </p>
                              {isDone && <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--accent)' }}>Done</span>}
                              {isActive && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--accentlt)', color: 'var(--accent)' }}>Active</span>}
                            </div>
                            <p className="text-xs text-theme2" style={{ opacity: isPending ? 0.4 : 0.8 }}>{s.sublabel}</p>
                            {isActive && (
                              <div className="flex gap-1 mt-2">
                                {Array.from({ length: stepTotals[s.id] }).map((_, fi) => (
                                  <div key={fi} className="h-1 flex-1 rounded-full transition-all duration-500"
                                    style={{ background: fi < completedFields[s.id] ? 'var(--accent)' : 'var(--border)' }} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between text-xs text-theme2 mb-2">
                      <span>Steps completed</span>
                      <span className="font-bold" style={{ color: 'var(--accent)' }}>{step - 1} / {STEPS.length}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${((step - 1) / STEPS.length) * 100}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 px-4 py-3 rounded-2xl border text-xs text-theme2 leading-relaxed" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                  💡 All information can be edited later from your console settings.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
