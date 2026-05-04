'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'



const annual = [
  {
    name: 'Free',
    tagline: 'Perfect for getting started',
    price: '4,999',
    save: "Save ₹989",
    period: 'per year',
    featured: false,
    features: [
      'QR code generation',
      'Menu with names & pricing',
      'Clean, simple layout',
      'Restaurant Logo Integration',
      'Unlimited scans',
      'Quick Setup & Go Live'
    ],
    cta: 'Start Free Trial',
    ctaFilled: false,
    href: '#',
  },
  {
    name: 'Basic',
    tagline: 'Perfect for getting started',
    price: '4,999',
    save: "Save ₹989",
    period: 'per year',
    featured: false,
    features: [
      'QR code generation',
      'Menu with names & pricing',
      'Clean, simple layout',
      'Restaurant Logo Integration',
      'Unlimited scans',
      'Quick Setup & Go Live'
    ],
    cta: 'Start Free Trial',
    ctaFilled: false,
    href: '#',
  },
  {
    name: 'Standard',
    tagline: 'For growing restaurants',
    price: '9,999',
    save: "Save ₹1,989",
    period: 'per year',
    featured: true,
    features: [
      'Ratings per Food',
      'Google Review Integration',
      'Full category organisation',
      'Item availability toggle',
      'Professional presentation',
      'Priority support',
    ],
    cta: 'Get Standard',
    ctaFilled: true,
    href: '#',
  },
  {
    name: 'Premium',
    tagline: 'Full visual experience',
    price: '14,999',
    save: "Save ₹2,989",
    period: 'per year',
    featured: false,
    features: [
      'Premium UI Design',
      'High-quality dish images',
      'Custom branding & logo',
      'Analytics dashboard',
      'Dedicated support',
      'Performance Hosting'
    ],
    cta: 'Get Premium',
    ctaFilled: false,
    href: '#',
  },
]

const plans = [
  {
    name: 'Free',
    tagline: 'Perfect for getting started',
    price: '0',
    period: 'forever',
    featured: false,
    features: [
      'QR Code Menu',
      'Up to 5 menu items',
      'Text-only menu (no images)',
      'Basic layout',
      'Scanify branding',
      'Unlimited scans',
      'Quick Setup & Go Live'
    ],
    cta: 'Get Started',
    ctaFilled: false,
    href: '#',
  },
  {
    name: 'Basic',
    tagline: 'Upgrade your menu experience',
    price: '499',
    period: 'per month',
    featured: false,
    features: [
      'Everything in Free +',
      'Up to 40 menu items',
      'Add images (up to 15 items)',
      'Basic customization (colors & logo)',
      'Remove Scanify branding',
      'Simple menu editor'
    ],
    cta: 'Start Free Trial',
    ctaFilled: false,
    href: '#',
  },
  {
    name: 'Standard',
    tagline: 'For growing restaurants',
    price: '999',
    period: 'per month',
    featured: true,
    features: [
      'Everything in Basic +',
      'Unlimited Items',
      'Unlimited Images',
      'Ratings per Food',
      'Google Review Integration',
      'Full category organisation',
      'Item availability toggle',
      'Professional presentation',
      'Priority support',
    ],
    cta: 'GetStandard',
    ctaFilled: true,
    href: '#',
  },
  {
    name: 'Premium',
    tagline: 'Full visual experience',
    price: '1,499',
    period: 'per month',
    featured: false,
    features: [
      'Premium UI Design',
      'High-quality dish images',
      'Custom branding & logo',
      'Analytics dashboard',
      'Dedicated support',
      'Performance Hosting'
    ],
    cta: 'Get Premium',
    ctaFilled: false,
    href: '#',
  },
]

export default function Pricing() {
  const cardRefs = useRef([])

  const [isAnnual, setIsAnnual] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    cardRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="pricing" className="py-24 px-7 bg-theme2">
      <div className="max-w-[1360px] mx-auto">
        <div className="text-xs font-semibold tracking-[1.2px] uppercase text-accent-t mb-3">Pricing</div>
        <h2 className="font-syne font-extrabold text-theme mb-4 tracking-tight" style={{ fontSize: 'clamp(30px, 3.5vw, 44px)' }}>
          Simple, honest pricing.
        </h2>
        <p className='text-base text-theme2 max-w-[520px] leading-relaxed mb-8'>
          Start free, upgrade as you grow. No hidden fees, no contracts.
        </p>
        <div className='flex justify-center  mb-12'>
          <div className="flex items-center bg-stone-900 justify-around w-full md:w-[60%] border-theme bg-card border-[1px] rounded-lg overflow-hidden">
            <button
              onClick={() => setIsAnnual(false)}
              className={`w-full py-3 text-sm rounded-lg font-semibold transition text-pricing-1 ${!isAnnual ? 'bg-pricing-card text-pricing-2' : ''
                }`}
            >
              Monthly
            </button>

            <button
              onClick={() => setIsAnnual(true)}
              className={`w-full py-3 text-sm rounded-lg font-semibold transition text-pricing-1 ${isAnnual ? 'bg-pricing-card text-pricing-2' : ''
                }`}
            >
              Yearly • 17% OFF
            </button>
          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {(isAnnual ? annual : plans).map((plan, i) => (
            <div
              key={plan.name}
              ref={(el) => { cardRefs.current[i] = el }}
              className={`reveal relative rounded-[24px] p-8 border transition-all duration-300 hover:-translate-y-1 ${plan.featured ? 'price-featured' : 'bg-card border-theme'}`}
              onMouseOver={e => e.currentTarget.style.boxShadow = 'var(--shadow2)'}
              onMouseOut={e => e.currentTarget.style.boxShadow = ''}
            >
              {plan.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[11px] font-bold tracking-[0.6px] text-white px-3.5 py-1 rounded-full whitespace-nowrap"
                  style={{ background: 'var(--accent)' }}>
                  Most Popular
                </div>
              )}

              <div className='flex justify-between items-center'>
                <div className="font-syne font-bold text-[15px] text-theme mb-1.5 uppercase tracking-[0.5px]">{plan.name}</div>

                {isAnnual && (
                  <div className="font-syne bg-pricing-off border border-theme px-3 py-1 rounded-full text-[14px] text-theme mb-1.5  tracking-[0.5px]">{plan.save}</div>
                )}


              </div>

              <div className="text-[13px] text-theme3 mb-6">{plan.tagline}</div>

              <div className="font-syne font-extrabold text-[44px] text-theme leading-none tracking-tight">
                <sup className="text-xl align-top mt-2 font-semibold">₹</sup>{plan.price}
              </div>
              <div className="text-[13px] text-theme3 mt-1.5 mb-6">{plan.period}</div>

              <div className="h-px bg-theme my-6" />

              <ul className="flex flex-col gap-2.5 list-none">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2.5 items-start text-[13px] text-theme2 leading-snug">
                    <span className="font-bold flex-shrink-0 mt-px" style={{ color: 'var(--accent)' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className="mt-7 block w-full py-3 rounded-xl text-sm font-semibold text-center no-underline transition-all duration-200"
                style={plan.ctaFilled
                  ? { background: 'var(--accent)', color: '#fff', border: 'none' }
                  : { background: 'transparent', color: 'var(--text)', border: '1.5px solid var(--border2)' }
                }
                onMouseOver={e => {
                  if (plan.ctaFilled) { e.currentTarget.style.background = 'var(--accent2)'; e.currentTarget.style.transform = 'translateY(-1px)' }
                  else e.currentTarget.style.background = 'var(--bg3)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = plan.ctaFilled ? 'var(--accent)' : 'transparent'
                  e.currentTarget.style.transform = ''
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
