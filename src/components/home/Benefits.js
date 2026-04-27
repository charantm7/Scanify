'use client'

import { useState } from 'react'

const businessBenefits = [
  {
    title: 'Zero Printing Costs',
    desc: 'Update prices, add dishes, and remove items instantly — no reprints, ever.',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
  },
  {
    title: 'Faster Table Turnover',
    desc: 'Guests make decisions quicker with a clear, visual menu — less waiting, more serving.',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  },
  {
    title: 'Instant Updates',
    desc: 'Mark items unavailable with a toggle — the live menu reflects changes immediately.',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
  },
  {
    title: 'Professional Branding',
    desc: 'A clean, modern menu that reflects the quality of your establishment.',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>,
  },
]

const customerBenefits = [
  {
    title: 'Instant Access',
    desc: 'Browse the full menu in seconds from any phone — just point and scan.',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
  },
  {
    title: 'Hygienic & Contactless',
    desc: 'No sharing physical menus. A safer, cleaner dining experience for every guest.',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  },
  {
    title: 'Works on Any Phone',
    desc: "No app to install. The menu opens directly in the phone's browser — iPhone or Android.",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>,
  },
  {
    title: 'Clear, Convenient Browsing',
    desc: 'Category tabs, dish photos, and prices — all in a clean mobile-first layout.',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}><path d="M1 6s2-2 5-2 5 2 5 2 2-2 5-2 5 2 5 2v14s-2-2-5-2-5 2-5 2-2-2-5-2-5 2-5 2z" /></svg>,
  },
]

const compareRows = [
  { feature: 'Instant updates', digital: true, printed: false },
  { feature: 'No reprinting', digital: true, printed: false },
  { feature: 'Item images', digital: true, printed: null },
  { feature: 'Availability control', digital: true, printed: false },
  { feature: 'Contactless', digital: true, printed: false },
  { feature: 'Zero ongoing cost', digital: true, printed: false },
  { feature: 'Works offline', digital: null, printed: true },
]

function Cell({ val }) {
  if (val === true) return <span style={{ color: 'var(--accent)', fontSize: 16 }}>✓</span>
  if (val === false) return <span style={{ color: '#e24b4a', fontSize: 16 }}>✗</span>
  return <span className="text-theme3">—</span>
}

export default function Benefits() {
  const [activeTab, setActiveTab] = useState('business')
  const benefits = activeTab === 'business' ? businessBenefits : customerBenefits

  return (
    <section id="benefits" className="py-24 px-7 bg-theme">
      <div className="max-w-[1360px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">

          {/* Left */}
          <div>
            <div className="text-xs font-semibold tracking-[1.2px] uppercase text-accent-t mb-3">Benefits</div>
            <h2 className="font-syne font-extrabold text-theme mb-4 tracking-tight" style={{ fontSize: 'clamp(30px, 3.5vw, 44px)' }}>
              Built for your business<br />and your guests.
            </h2>
            <p className="text-base text-theme2 max-w-[520px] leading-relaxed mb-7">
              Everything you need to run a smarter, faster, more professional restaurant or hotel.
            </p>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-7">
              {['business', 'customers'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-[18px] py-2 rounded-[10px] text-[13px] font-semibold border transition-all duration-200 cursor-pointer"
                  style={{
                    background: activeTab === tab ? 'var(--accent)' : 'transparent',
                    color: activeTab === tab ? '#fff' : 'var(--text2)',
                    borderColor: activeTab === tab ? 'var(--accent)' : 'var(--border2)',
                  }}
                >
                  {tab === 'business' ? 'For Your Business' : 'For Customers'}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3.5">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="flex gap-3.5 items-start px-[18px] py-4 rounded-[14px] bg-card border border-theme transition-all duration-200 cursor-default hover-accentlt"
                >
                  <div className="w-9 h-9 rounded-[10px] bg-accentlt flex items-center justify-center flex-shrink-0">
                    {b.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-theme mb-0.5">{b.title}</h4>
                    <p className="text-[13px] text-theme2 leading-snug">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-theme rounded-[24px] p-8 md:sticky md:top-[88px]">
            <p className="font-syne font-bold text-base text-theme mb-5">Digital vs. Printed Menu</p>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-xs font-semibold tracking-[0.8px] uppercase text-theme3 pb-3.5">Feature</th>
                  <th className="text-center text-xs font-semibold tracking-[0.8px] uppercase text-theme3 pb-3.5">Digital ✦</th>
                  <th className="text-center text-xs font-semibold tracking-[0.8px] uppercase text-theme3 pb-3.5">Printed</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row) => (
                  <tr key={row.feature} className="border-t border-theme">
                    <td className="py-2.5 text-[13px] font-medium text-theme">{row.feature}</td>
                    <td className="py-2.5 text-center text-[13px]"><Cell val={row.digital} /></td>
                    <td className="py-2.5 text-center text-[13px]"><Cell val={row.printed} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
