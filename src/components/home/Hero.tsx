'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'

const TABS = ['Dashboard', 'Analytics', 'Menu Builder', 'QR Codes', 'Customization'] as const

const NAV_ICONS: { d: string }[] = [
  { d: 'M3 4h8v8H3zM13 4h8v4h-8zM13 10h8v10h-8zM3 14h8v6H3z' },   // dashboard
  { d: 'M4 19V10M10 19V5M16 19v-7M22 19H2' },                       // analytics
  { d: 'M4 6h16M4 12h16M4 18h10' },                                 // menu builder
  { d: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z' },                    // qr codes
  { d: 'M12 3a9 9 0 100 18c1.2 0 2-.7 2-1.7 0-.5-.2-.9-.5-1.3-.3-.4-.1-1 .5-1h1.5A4.5 4.5 0 0021 12.5C21 7.3 17.1 3 12 3z' }, // customization
]

function QRPattern() {
  const cells = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1]
  return (
    <div className="grid grid-cols-5 gap-[1.5px] w-9 h-9 p-1 bg-white rounded-md border border-gray-200 flex-shrink-0">
      {cells.map((c, i) => (
        <span key={i} className="rounded-[1px]" style={{ background: c ? '#111827' : 'transparent' }} />
      ))}
    </div>
  )
}

export default function Hero() {

  const { user } = useApp();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % TABS.length), 4000);
    return () => clearInterval(id);
  }, [active]);

  return (

    <section id="home" className="relative min-h-screen pt-36 md:pt-34 pb-24 grid-bg overflow-x-hidden">
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
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-16px) rotate(1deg); }
        }
        @keyframes gentleFloatAlt {
          0%, 100% { transform: translateY(0px) rotate(2deg); }
          50% { transform: translateY(-14px) rotate(-1deg); }
        }
        @keyframes gentleFloatSide {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes scanPulse {
          0% { transform: scale(0.9); opacity: 0.7; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes steamRise {
          0% { transform: translateY(0) scaleX(1); opacity: 0.55; }
          50% { transform: translateY(-6px) scaleX(1.15); opacity: 0.9; }
          100% { transform: translateY(-12px) scaleX(1); opacity: 0; }
        }
        @keyframes barGrow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
        @keyframes panelFade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .float-card { animation: gentleFloat 6s ease-in-out infinite; }
        .float-card-alt { animation: gentleFloatAlt 7s ease-in-out infinite; }
        .float-card-side { animation: gentleFloatSide 5.5s ease-in-out infinite; }
        .scan-ring { animation: scanPulse 2.4s ease-out infinite; transform-origin: center; }
        .steam-line { animation: steamRise 2.2s ease-in-out infinite; transform-origin: bottom; }
        .bar-grow { animation: barGrow 0.9s cubic-bezier(0.16,1,0.3,1) both; transform-origin: bottom; }
        .live-dot { animation: blink 1.6s ease-in-out infinite; }
        .panel-fade { animation: panelFade 0.45s ease-out both; }
      `}</style>

      <div className="absolute rounded-full bg-accentlt opacity-50 pointer-events-none z-[-1]"
        style={{ width: 600, height: 600, top: -200, right: -100, filter: 'blur(80px)' }} />
      <div className="absolute rounded-full bg-accentlt opacity-50 pointer-events-none z-[-1]"
        style={{ width: 300, height: 300, bottom: 0, left: -80, filter: 'blur(80px)' }} />

      <div className="max-w-[1460px] mx-auto px-7 relative">

        {/* ---------- Floating feature callouts (desktop only) ---------- */}

        <div
          className="float-card hidden xl:flex absolute left-2 top-16 items-center gap-3 bg-card border border-theme2 rounded-2xl px-4 py-3 z-10"
          style={{ boxShadow: 'var(--shadow2)' }}
        >
          <div className="relative w-11 h-11 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accentlt)' }}>
            <span className="scan-ring absolute inset-0 rounded-[10px] border-2" style={{ borderColor: 'var(--accent)' }} />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" fill="var(--accent)" stroke="none" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-theme leading-none">Table 4 scanned</p>
            <p className="text-[11px] text-theme3 mt-1">just now</p>
          </div>
        </div>

        <div
          className="float-card-alt hidden xl:flex absolute right-2 top-8 items-center gap-3 bg-card border border-theme2 rounded-2xl px-4 py-3 z-10"
          style={{ boxShadow: 'var(--shadow2)' }}
        >
          <div className="w-11 h-11 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accentlt)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
              <path d="M4 19V10M10 19V5M16 19v-7M22 19H2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-theme leading-none">8 PM peak hour</p>
            <p className="text-[11px] mt-1 font-semibold text-accent-t">+562% vs average</p>
          </div>
        </div>

        <div
          className="float-card-side hidden xl:flex absolute left-[-8px] top-[440px] items-center gap-3 bg-card border border-theme2 rounded-2xl px-4 py-3 z-10"
          style={{ boxShadow: 'var(--shadow2)', animationDelay: '0.6s' }}
        >
          <div className="relative w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accentlt)' }}>
            <span className="steam-line absolute -top-1 left-3 w-[3px] h-3 rounded-full" style={{ background: 'var(--accent)', animationDelay: '0s' }} />
            <span className="steam-line absolute -top-1 left-5.5 w-[3px] h-3 rounded-full" style={{ background: 'var(--accent)', animationDelay: '0.5s' }} />
            <span className="steam-line absolute -top-1 right-3 w-[3px] h-3 rounded-full" style={{ background: 'var(--accent)', animationDelay: '1s' }} />
            <span className="text-lg">🍮</span>
          </div>
          <div>
            <p className="text-xs font-bold text-theme leading-none">Gulab Jamun</p>
            <p className="text-[11px] text-theme3 mt-1">✨ New · Chef&apos;s Special</p>
          </div>
        </div>

        <div
          className="float-card-side hidden xl:flex absolute right-[-8px] top-[420px] flex-col gap-2 bg-card border border-theme2 rounded-2xl px-4 py-3 z-10"
          style={{ boxShadow: 'var(--shadow2)', animationDelay: '1s' }}
        >
          <p className="text-xs font-bold text-theme leading-none">8 branded themes</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {['#c96442', '#1c1c1e', '#4c7a5c', '#3f6ea5'].map((c) => (
              <span key={c} className="w-4 h-4 rounded-full border border-theme2" style={{ background: c }} />
            ))}
            <span className="text-[10px] text-theme3 ml-1">+4 more</span>
          </div>
        </div>

        <div
          className="float-card hidden xl:flex absolute left-8 bottom-6 items-center gap-2 bg-card border border-theme2 rounded-full px-4 py-2 z-10"
          style={{ boxShadow: 'var(--shadow2)', animationDelay: '1.2s' }}
        >
          <span className="live-dot w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
          <p className="text-[11px] font-semibold text-theme2">Synced across every table</p>
        </div>

        {/* ---------- Main hero content ---------- */}
        <div className='flex flex-col items-center' style={{ animation: "fadeInUp 0.8s ease-out" }}>

          <div className="inline-flex items-center gap-2 bg-accentlt border border-green-300/25 rounded-full px-3.5 py-1.5 text-xs font-medium text-accent-t mb-5">
            <span className="badge-dot w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
            No app download required
          </div>

          <h1 className="kaushan-script-regular text-center font-extrabold text-theme text-[4rem] sm:text-[6rem] leading-[1.05] tracking-[-1.5px] mb-5"
          >
            Your Menu,<br />
            <span style={{ color: 'var(--accent)' }}>One Scan Away.</span>

          </h1>

          <p className="text-[17px] leading-relaxed text-theme2 mb-9 mt-5 font-light text-center max-w-[560px]">
            Replace printed menus with a smart digital experience. Scan a QR code and browse instantly.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link
              href="/login"
              className="btn-primary inline-flex items-center gap-3 pl-2 pr-5 py-2.5 rounded-[10px] text-sm font-semibold text-white border hover:bg-[var(--accent2)] transition border-theme2 bg-submit no-underline"
            >
              <span className="flex items-center relative">

                <svg
                  className="arrow-loop arrow1"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="6 17 11 12 6 7" />
                  <polyline points="13 17 18 12 13 7" />
                </svg>

              </span>

              {user ? "Dashboard" : "Start for Free"}
            </Link>

            <Link
              href="#how"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-semibold text-theme border border-theme2 no-underline hover:bg-[var(--bg3)] transition-all duration-200 z-20"
            >
              See How It Works
            </Link>
          </div>

          {/* ---------- Rotating dashboard mockup ---------- */}
          <div className="relative w-full max-w-[880px] mt-16">

            {/* tab pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {TABS.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setActive(i)}
                  className="relative text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors"
                  style={{
                    borderColor: i === active ? '#4f46e5' : 'var(--border)',
                    color: i === active ? '#4f46e5' : 'var(--theme3)',
                    background: i === active ? '#eef2ff' : 'transparent',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div
              className="w-full rounded-2xl border border-theme2 bg-white overflow-hidden text-left"
              style={{ boxShadow: 'var(--shadow2)', animation: 'fadeInUp 0.9s ease-out 0.15s both' }}
            >
              {/* browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
                <div className="ml-3 flex-1 max-w-[260px] rounded-md px-3 py-1 text-[11px] text-gray-400 border border-gray-200 bg-white truncate">
                  scanify.app/{TABS[active].toLowerCase().replace(' ', '-')}
                </div>
                <span className="ml-auto hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                  <span className="live-dot w-1.5 h-1.5 rounded-full" style={{ background: '#4f46e5' }} />
                  Live
                </span>
              </div>

              <div className="flex">
                {/* mini sidebar */}
                <div className="hidden sm:flex flex-col items-center gap-1.5 w-14 py-4 border-r border-gray-100 flex-shrink-0">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center mb-2 text-white text-[11px] font-extrabold" style={{ background: 'linear-gradient(135deg,#fb923c,#f97316)' }}>S</div>
                  {NAV_ICONS.map((nav, i) => (
                    <button key={i} onClick={() => setActive(i)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: i === active ? '#4f46e5' : 'transparent' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={i === active ? '#fff' : '#9ca3af'} strokeWidth="2">
                        <path d={nav.d} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  ))}
                </div>

                {/* main content — swaps per active tab */}
                <div className="flex-1 p-4 sm:p-5 min-w-0 min-h-[330px] sm:min-h-[300px]">
                  <div key={active} className="panel-fade">

                    {active === 0 && (
                      <>
                        <div className="rounded-xl p-4 flex items-center justify-between text-white mb-3.5" style={{ background: 'linear-gradient(120deg,#4f46e5,#3b82f6)' }}>
                          <div>
                            <p className="text-[11px] text-indigo-100">Welcome back,</p>
                            <p className="text-lg sm:text-xl font-extrabold">Scanify 👋</p>
                            <p className="text-[11px] text-indigo-100 mt-0.5">🏨 Hotel</p>
                          </div>
                          <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-1 rounded-full bg-white/20">Pro</span>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 flex items-center justify-between mb-3.5 gap-3">
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-indigo-600 tracking-wide">YOUR LIVE MENU URL</p>
                            <p className="text-[11px] text-gray-800 truncate">scanify.app/menu/bhagini</p>
                          </div>
                          <span className="text-[10px] font-semibold text-white px-2.5 py-1 rounded-md flex-shrink-0" style={{ background: '#4f46e5' }}>Open</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
                          {[
                            { label: 'Menu Items', value: '5', sub: '5 / ∞' },
                            { label: 'QR Codes', value: '1', sub: 'Generated' },
                            { label: 'Total Scans', value: '184', sub: 'All time' },
                            { label: 'Account Age', value: '27d', sub: 'Since joining' },
                          ].map((s) => (
                            <div key={s.label} className="rounded-lg border border-gray-200 px-3 py-2.5">
                              <p className="text-[9px] text-gray-500">{s.label}</p>
                              <p className="text-base sm:text-lg font-extrabold text-gray-900 mt-0.5">{s.value}</p>
                              <p className="text-[9px] text-gray-400 mt-0.5">{s.sub}</p>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            { title: 'Manage Menu', desc: 'Add items, categories & prices' },
                            { title: 'Generate QR Code', desc: 'Create scannable QR for your menu' },
                          ].map((qa) => (
                            <div key={qa.title} className="rounded-lg border border-gray-200 px-3 py-2.5 flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: '#eef2ff' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                                  <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-bold text-gray-900">{qa.title}</p>
                                <p className="text-[9px] text-gray-500 truncate">{qa.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {active === 1 && (
                      <>
                        <div className="flex items-center justify-between mb-3.5">
                          <div>
                            <p className="text-sm font-extrabold text-gray-900">Analytics</p>
                            <p className="text-[10px] text-gray-500">How your menu performs</p>
                          </div>
                          <span className="text-[10px] font-semibold text-white px-2.5 py-1 rounded-full" style={{ background: '#4f46e5' }}>7 days</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
                          {[
                            { label: 'Avg Session Depth', value: '25', sub: 'Item views per QR scan' },
                            { label: 'Repeat Days', value: '0', sub: 'Days with ≥2 sessions' },
                          ].map((s) => (
                            <div key={s.label} className="rounded-lg border border-gray-200 px-3 py-2.5">
                              <p className="text-[9px] text-gray-500">{s.label}</p>
                              <p className="text-base sm:text-lg font-extrabold text-gray-900 mt-0.5">{s.value}</p>
                              <p className="text-[9px] text-gray-400 mt-0.5">{s.sub}</p>
                            </div>
                          ))}
                        </div>
                        <div className="rounded-lg border border-gray-200 p-3.5">
                          <p className="text-[10px] font-semibold text-gray-700 mb-2.5">Peak hours · 6PM – 11PM</p>
                          <div className="flex items-end gap-2 h-16 mb-2">
                            {[30, 55, 70, 100, 65, 40].map((h, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="bar-grow w-full rounded" style={{ height: `${h}%`, background: h === 100 ? '#4f46e5' : '#c7d2fe', animationDelay: `${i * 0.08}s` }} />
                                <span className="text-[8px] text-gray-400">{['6P', '7P', '8P', '9P', '10P', '11P'][i]}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-[10px] pt-2 border-t border-gray-100">
                            <span className="text-gray-500">8 PM · 24 events</span>
                            <span className="font-bold" style={{ color: '#16a34a' }}>+562% vs avg</span>
                          </div>
                        </div>
                      </>
                    )}

                    {active === 2 && (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-extrabold text-gray-900">Menu Builder</p>
                            <p className="text-[10px] text-gray-500">5 items · Unlimited</p>
                          </div>
                          <span className="text-[9px] font-bold text-indigo-600">PRO</span>
                        </div>
                        <div className="rounded-lg border border-gray-200 px-3 py-2 text-[10px] text-gray-400 mb-3">Search items or categories…</div>
                        <div className="rounded-lg overflow-hidden border border-gray-200">
                          <div className="flex items-center justify-between px-3 py-2 bg-indigo-50">
                            <span className="text-[11px] font-bold text-gray-900">Desserts</span>
                            <span className="text-[9px] font-bold text-indigo-600 bg-white w-4 h-4 rounded-full flex items-center justify-center">1</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-3 py-2.5 border-t border-gray-100">
                            <div className="w-8 h-8 rounded-md flex-shrink-0" style={{ background: 'linear-gradient(135deg,#fbbf24,#f97316)' }} />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold text-gray-900 truncate">Gulab Jamun</p>
                              <p className="text-[9px] text-indigo-600">✨ New · 👨‍🍳 Chef&apos;s Special</p>
                            </div>
                            <span className="text-[11px] font-bold text-gray-900 flex-shrink-0">₹10</span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-2 bg-indigo-50 border-t border-gray-100">
                            <span className="text-[11px] font-bold text-gray-900">Curry</span>
                            <span className="text-[9px] font-bold text-indigo-600 bg-white w-4 h-4 rounded-full flex items-center justify-center">4</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-3 py-2.5 border-t border-gray-100">
                            <div className="w-8 h-8 rounded-md flex-shrink-0" style={{ background: 'linear-gradient(135deg,#f87171,#b91c1c)' }} />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold text-gray-900 truncate">Chicken Gravy</p>
                              <p className="text-[9px] text-indigo-600">👨‍🍳 Chef&apos;s Special · 🌶️ Extra Hot</p>
                            </div>
                            <span className="text-[11px] font-bold text-gray-900 flex-shrink-0">₹200</span>
                          </div>
                        </div>
                      </>
                    )}

                    {active === 3 && (
                      <>
                        <div className="flex items-center justify-between mb-3.5">
                          <div>
                            <p className="text-sm font-extrabold text-gray-900">QR Codes</p>
                            <p className="text-[10px] text-gray-500">3 / ∞ generated</p>
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-3 flex items-center gap-2 mb-3.5">
                          <div className="flex-1 text-[10px] text-gray-400 border border-gray-200 rounded-md px-2.5 py-1.5">Label (e.g. Table 4, Takeaway)</div>
                          <span className="text-[10px] font-semibold text-white px-2.5 py-1.5 rounded-md flex-shrink-0" style={{ background: '#4f46e5' }}>+ Generate</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5">
                          {['Table 3', 'Table 2', 'Table 1'].map((t) => (
                            <div key={t} className="rounded-lg border border-gray-200 p-2.5 flex flex-col items-center gap-1.5">
                              <p className="text-[10px] font-bold text-gray-900 self-start">{t}</p>
                              <QRPattern />
                              <span className="text-[8px] font-semibold text-indigo-600 border border-indigo-100 rounded px-1.5 py-0.5 w-full text-center">Copy URL</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {active === 4 && (
                      <>
                        <div className="mb-3.5">
                          <p className="text-sm font-extrabold text-gray-900">Customization</p>
                          <p className="text-[10px] text-gray-500">Customize how your digital menu looks</p>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-400 mb-3 border-b border-gray-100 pb-2">
                          <span className="text-indigo-600 border-b-2 border-indigo-600 pb-2 -mb-2.5">Themes</span>
                          <span>Colors</span>
                          <span className="hidden sm:inline">Typography</span>
                          <span className="hidden sm:inline">Layout</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {[
                            { name: 'Ember', colors: ['#fdf2e3', '#c96442', '#1c1408'] },
                            { name: 'Midnight', colors: ['#0b0b0d', '#d4a017', '#3a3a3a'] },
                            { name: 'Sage Garden', colors: ['#e8efe4', '#4c7a5c', '#1c2b20'] },
                            { name: 'Charcoal', colors: ['#141414', '#8a8a8a', '#2a2a2a'], selected: true },
                          ].map((th) => (
                            <div key={th.name} className="rounded-lg border p-2" style={{ borderColor: th.selected ? '#4f46e5' : '#e5e7eb', borderWidth: th.selected ? 2 : 1 }}>
                              <div className="flex h-6 rounded overflow-hidden mb-1.5">
                                {th.colors.map((c, i) => <span key={i} className="flex-1" style={{ background: c }} />)}
                              </div>
                              <p className="text-[9px] font-bold text-gray-800 truncate">{th.name}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

  )
}