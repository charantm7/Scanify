'use client'

import { useEffect, useRef } from 'react'

const steps = [
  {
    num: '01',
    title: 'Create Your Menu',
    desc: 'Sign up, add your hotel, create categories like Starters or Drinks, and add items with names, prices, and photos.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Download Your QR',
    desc: 'Generate a unique QR code for your property. Download it as a PNG and print it — or share the link directly.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3m0 4h4v-4m-4 0h-3v4" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Customers Scan & Browse',
    desc: 'Place QR codes on tables. Guests scan with any phone camera, see your full menu instantly — no app required.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  const cardRefs = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    cardRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="how" className="py-24 px-7 bg-theme2">
      <div className="max-w-[1360px] mx-auto">
        <div className="text-xs font-semibold tracking-[1.2px] uppercase text-accent-t mb-3">How It Works</div>
        <h2 className="font-syne font-extrabold text-theme mb-4 tracking-tight" style={{ fontSize: 'clamp(30px, 3.5vw, 44px)' }}>
          Live in minutes,<br />not days.
        </h2>
        <p className="text-base text-theme2 max-w-[520px] leading-relaxed mb-14">
          Setting up your digital menu is as simple as filling in a form. No technical knowledge required.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.num}
              ref={(el) => { cardRefs.current[i] = el }}
              className="reveal bg-theme3 border border-theme rounded-[20px] p-8 relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{ ':hover': { boxShadow: 'var(--shadow2)' } }}
              onMouseOver={e => e.currentTarget.style.boxShadow = 'var(--shadow2)'}
              onMouseOut={e => e.currentTarget.style.boxShadow = ''}
            >
              {/* Big step number */}
              <div className="absolute top-4 right-5 font-syne font-extrabold text-[64px] leading-none select-none step-num-color">
                {step.num}
              </div>
              {/* Icon */}
              <div className="w-12 h-12 rounded-[14px] bg-accentlt flex items-center justify-center mb-5">
                {step.icon}
              </div>
              <h3 className="font-syne font-bold text-[18px] text-theme mb-2.5">{step.title}</h3>
              <p className="text-sm leading-[1.65] text-theme2">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
