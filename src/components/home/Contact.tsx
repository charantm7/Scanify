'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FaLinkedin } from 'react-icons/fa'
import { SiGmail } from 'react-icons/si'
import { FaXTwitter } from 'react-icons/fa6'

const contactPoints = [
    {
        label: 'Email us',
        value: 'support@scanify.co.in',
        href: 'mailto:support@scanify.co.in',
    },
    {
        label: 'Call us',
        value: '+91 98765 43210',
        href: 'tel:+919876543210',
    },

]

export default function ContactPage() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'sent'>('idle')
    const [form, setForm] = useState({ name: '', email: '', business: '', message: '' })

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target
        setForm((f) => ({ ...f, [name]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setStatus('submitting')
        // TODO: wire up to your API route / Supabase table
        await new Promise((r) => setTimeout(r, 900))
        setStatus('sent')
    }

    return (
        <main className="bg-theme font-syne min-h-screen">
            <section className="max-w-[1200px] mx-auto px-6 md:px-8 pt-24 md:pt-32 pb-24">

                {/* Header */}
                <div className="max-w-[640px] mb-16 md:mb-20">
                    <p className="text-xs font-bold tracking-[1.5px] uppercase text-accent-t mb-4">
                        Contact
                    </p>
                    <h1 className="font-extrabold tracking-tight leading-[1.05] text-theme text-[clamp(32px,5vw,52px)] mb-5">
                        Let&apos;s get your menu online.
                    </h1>
                    <p className="text-theme2 text-[15px] md:text-[16px] leading-[1.7] max-w-[480px]">
                        Questions about pricing, onboarding, or a feature you need — send us a note
                        and we&apos;ll get back within one business day.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16">

                    {/* Left: contact info */}
                    <div className="flex flex-col gap-10">
                        <div className="flex flex-col gap-6">
                            {contactPoints.map((point) => (
                                <div key={point.label} className="border-b border-theme pb-6 last:border-b-0 last:pb-0">
                                    <p className="text-xs font-bold tracking-[1px] uppercase text-theme3 mb-2">
                                        {point.label}
                                    </p>
                                    {point.href ? (
                                        <a
                                            href={point.href}
                                            className="text-[16px] font-semibold text-theme no-underline hover:text-accent-t transition-colors"
                                        >
                                            {point.value}
                                        </a>
                                    ) : (
                                        <p className="text-[16px] font-semibold text-theme">{point.value}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div>
                            <p className="text-xs font-bold tracking-[1px] uppercase text-theme3 mb-4">
                                Follow along
                            </p>
                            <div className="flex items-center gap-5 text-theme2">
                                <a href="https://www.linkedin.com/company/scanifycompany" target="_blank" rel="noopener noreferrer" className="hover:text-accent-t transition-colors">
                                    <FaLinkedin size={20} />
                                </a>
                                <a href="mailto:support@scanify.co.in" className="hover:text-accent-t transition-colors">
                                    <SiGmail size={20} />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent-t transition-colors">
                                    <FaXTwitter size={20} />
                                </a>
                            </div>
                        </div>

                    </div>

                    {/* Right: form card */}
                    <div className="rounded-2xl border border-theme bg-[var(--card)] shadow-[var(--shadow)] p-6 md:p-10">
                        {status === 'sent' ? (
                            <div className="flex flex-col items-center text-center py-16">
                                <div className="w-12 h-12 rounded-full bg-[var(--accentlt)] flex items-center justify-center mb-5">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                        <path d="M5 13l4 4L19 7" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 className="text-[20px] font-bold text-theme mb-2">Message sent</h3>
                                <p className="text-theme2 text-sm max-w-[280px]">
                                    Thanks for reaching out — our team will reply to {form.email || 'your inbox'} within one business day.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <Field label="Your name">
                                        <input
                                            required
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="Priya Sharma"
                                            className="input-field"
                                        />
                                    </Field>
                                    <Field label="Work email">
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="you@restaurant.com"
                                            className="input-field"
                                        />
                                    </Field>
                                </div>

                                <Field label="Restaurant / business name">
                                    <input
                                        name="business"
                                        value={form.business}
                                        onChange={handleChange}
                                        placeholder="Spice Route Café"
                                        className="input-field"
                                    />
                                </Field>

                                <Field label="Message">
                                    <textarea
                                        required
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="Tell us what you need help with..."
                                        className="input-field resize-none"
                                    />
                                </Field>

                                <button
                                    type="submit"
                                    disabled={status === 'submitting'}
                                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold text-white transition-all disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
                                >
                                    {status === 'submitting' ? 'Sending…' : 'Send message'}
                                </button>

                                <p className="text-xs text-theme3 text-center">
                                    By submitting, you agree to our{' '}
                                    <Link href="/privacy-policy" className="underline hover:text-accent-t">privacy policy</Link>.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            <style jsx global>{`
        .input-field {
          width: 100%;
          background: var(--input);
          border: 1px solid var(--border2);
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 14.5px;
          color: var(--text);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .input-field::placeholder { color: var(--text3); }
        .input-field:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accentlt);
        }
      `}</style>
        </main >
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-theme2">{label}</span>
            {children}
        </label>
    )
}