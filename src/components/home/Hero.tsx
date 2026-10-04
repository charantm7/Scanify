'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'

const TABS = ['Dashboard', 'Analytics', 'Menu Builder', 'QR Codes', 'Customization'] as const

const NAV_ICONS: { d: string }[] = [
  { d: 'M3 4h8v8H3zM13 4h8v4h-8zM13 10h8v10h-8zM3 14h8v6H3z' },   // dashboard
  { d: 'M4 19V10M10 19V5M16 19v-7M22 19H2' },                       // analytics
  { d: 'M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6zM6 17h12' }, // menu builder (chef hat)
  { d: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM17.5 14.5h3.5v3.5h-3.5zM14 14h2m2 4h3' },  // qr codes
  { d: 'M12 2a10 10 0 100 20 1.5 1.5 0 001.5-1.5c0-.4-.15-.76-.4-1.04a1.5 1.5 0 01.4-2.46A10 10 0 0012 2zM7 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM10 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM15 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM17 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3z' }, // customization (palette)
]

const QUICK_ACTIONS: { title: string; desc: string; d: string }[] = [
  { title: 'Add Menu Item', desc: 'Create a new dish or drink', d: 'M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6zM6 17h12' },
  { title: 'Generate QR Code', desc: 'Create scannable QR for your menu', d: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM17.5 14.5h3.5v3.5h-3.5zM14 14h2m2 4h3' },
  { title: 'Open Live Menu', desc: 'View your public menu page', d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3' },
  { title: 'Customize Menu', desc: 'Colors, themes & layout', d: 'M12 2a10 10 0 100 20 1.5 1.5 0 001.5-1.5c0-.4-.15-.76-.4-1.04a1.5 1.5 0 01.4-2.46A10 10 0 0012 2zM7 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM10 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM15 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM17 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3z' },
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

    <section id="home" className="relative min-h-screen pt-28  md:pt-32 pb-24 overflow-x-hidden">
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

          <h1 className="kaushan-script-regular text-center font-extrabold text-theme text-[62px] sm:text-[6rem]  leading-[1.05] tracking-[-1.5px] mb-5"
          >
            Your Menu,<br />
            <span style={{ color: 'var(--accent)' }}>One Scan Away.</span>

          </h1>

          <p className="text-sm sm:text-[16px]  leading-relaxed text-theme2 mb-9 mt-5 font-light text-center max-w-[560px]">
            Replace printed menus with a smart digital experience. Scan a QR code and browse instantly.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:gap-5 gap-2 md:gap-5">
            <Link
              href="/login"
              className="btn-primary inline-flex items-center gap-3 pl-2 pr-5 py-2.5 rounded-md text-[13px] font-semibold text-white border hover:bg-[var(--accent2)] transition border-theme2 bg-submit no-underline"
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

            <a
              href="https://www.scanify.co.in/menu/scanify-demo-1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-theme2 px-5 py-2.5 text-[13px] font-semibold text-theme no-underline transition-all duration-200 hover:bg-[var(--bg3)]"
            >
              View Demo Menu
            </a>
          </div>

          {/* ---------- Rotating dashboard mockup ---------- */}
          <div className="relative w-full max-w-[920px] mt-16" style={{ perspective: '2000px' }}>

            {/* ambient glow behind the dashboard */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-10 pointer-events-none"
              style={{
                width: '92%',
                height: 420,
                background: 'radial-gradient(60% 60% at 50% 30%, rgba(79,70,229,0.22), transparent 70%)',
                filter: 'blur(40px)',
                zIndex: -1,
              }}
            />

            {/* tab pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
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
              style={{
                boxShadow: '0 2px 6px rgba(15,23,42,0.06), 0 30px 70px -20px rgba(31,41,99,0.35), 0 0 0 1px rgba(15,23,42,0.04)',
                animation: 'fadeInUp 0.9s ease-out 0.15s both',
                transform: 'rotateX(3deg)',
                transformOrigin: 'bottom center',
              }}
            >
              {/* browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
                <div className="ml-3 flex-1 max-w-[260px] rounded-md px-3 py-1 text-[11px] text-gray-400 border border-gray-200 bg-white truncate flex items-center gap-1.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" className="flex-shrink-0">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
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
                        {/* welcome banner */}
                        <div
                          className="rounded-xl p-4 relative overflow-hidden mb-3"
                          style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 65%)', border: '1px solid #e5e7eb' }}
                        >
                          <div
                            className="absolute -right-6 -top-10 w-28 h-28 rounded-full pointer-events-none"
                            style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.18), transparent 70%)' }}
                          />
                          <div className="relative flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <span className="inline-flex text-[9px] font-bold px-2 py-0.5 rounded-full mb-1.5" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                                ✨ Overview
                              </span>
                              <p className="text-sm sm:text-base font-extrabold text-gray-900 truncate">Good morning, Aswath 👋</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">Here&apos;s a quick overview of your restaurant.</p>
                            </div>
                            <div className="hidden sm:flex flex-col items-end flex-shrink-0 text-gray-400">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                              </svg>
                              <span className="text-[9px] mt-1 font-semibold">Oct 4</span>
                            </div>
                          </div>
                        </div>

                        {/* hotel details card */}
                        <div className="rounded-lg border border-gray-200 px-3.5 py-2.5 flex items-center justify-between mb-3 gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[11px] font-bold text-gray-900 truncate">Bhagini</p>
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: '#dcfce7', color: '#16a34a' }}>● Live</span>
                            </div>
                            <p className="text-[10px] text-gray-500 truncate mt-0.5">scanify.app/menu/bhagini</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[9px] font-semibold text-white px-2.5 py-1.5 rounded-md" style={{ background: '#4f46e5' }}>Open Menu</span>
                            <span className="hidden sm:inline text-[9px] font-semibold text-gray-700 px-2.5 py-1.5 rounded-md border border-gray-200">Manage</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                          {[
                            { label: 'Menu Items', value: '5', sub: 'Active items' },
                            { label: 'QR Codes', value: '1', sub: 'Active QR codes' },
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

                        <p className="text-[10px] font-bold text-gray-700 mb-2">Quick Actions</p>
                        <div className="grid grid-cols-2 gap-2">
                          {QUICK_ACTIONS.map((qa) => (
                            <div
                              key={qa.title}
                              className="group rounded-lg border border-gray-200 px-2.5 py-2.5 flex items-center gap-2 cursor-pointer transition-all hover:border-indigo-200"
                              style={{ transitionDuration: '150ms' }}
                            >
                              <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: '#eef2ff' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                                  <path d={qa.d} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-gray-900 truncate">{qa.title}</p>
                                <p className="text-[8.5px] text-gray-500 truncate hidden sm:block">{qa.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {active === 1 && (
                      <>
                        <div className="flex items-center justify-between mb-3 gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold text-gray-900">Analytics</p>
                            <p className="text-[10px] text-gray-500">How your menu performs</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="hidden sm:inline text-[9px] font-semibold text-gray-500 px-2 py-1 rounded-full border border-gray-200">Basic</span>
                            <span className="text-[10px] font-semibold text-white px-2.5 py-1 rounded-full" style={{ background: '#4f46e5' }}>7 days</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                          {[
                            { label: 'QR Scans', value: '184', sub: 'All scan events', trend: '+12%', d: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM17.5 14.5h3.5v3.5h-3.5zM14 14h2m2 4h3' },
                            { label: 'Menu Views', value: '152', sub: 'Menu opened', trend: '+8%', d: 'M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z M12 9a3 3 0 100 6 3 3 0 000-6z' },
                            { label: 'Item Views', value: '540', sub: 'Item taps', d: 'M3 17l6-6 4 4 8-8M15 7h6v6' },
                            { label: 'Active Days', value: '12', sub: '≥1 scan/day', d: 'M3 10h18M8 2v4M16 2v4M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z' },
                          ].map((s) => (
                            <div key={s.label} className="rounded-lg border border-gray-200 px-2.5 py-2">
                              <div className="w-5 h-5 rounded-md flex items-center justify-center mb-1.5" style={{ background: '#eef2ff' }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                                  <path d={s.d} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                              <p className="text-[8.5px] text-gray-500 truncate">{s.label}</p>
                              <div className="flex items-baseline gap-1">
                                <p className="text-sm font-extrabold text-gray-900 mt-0.5">{s.value}</p>
                                {s.trend && <span className="text-[8px] font-bold" style={{ color: '#16a34a' }}>{s.trend}</span>}
                              </div>
                              <p className="text-[7.5px] text-gray-400 mt-0.5 truncate">{s.sub}</p>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-lg border border-gray-200 p-3 mb-2.5">
                          <p className="text-[10px] font-semibold text-gray-700 mb-2">Peak hours · 6PM – 11PM</p>
                          <div className="flex items-end gap-2 h-12 mb-1.5">
                            {[30, 55, 70, 100, 65, 40].map((h, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="bar-grow w-full rounded" style={{ height: `${h}%`, background: h === 100 ? '#4f46e5' : '#c7d2fe', animationDelay: `${i * 0.08}s` }} />
                                <span className="text-[7.5px] text-gray-400">{['6P', '7P', '8P', '9P', '10P', '11P'][i]}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-[9.5px] pt-1.5 border-t border-gray-100">
                            <span className="text-gray-500">8 PM · 24 events</span>
                            <span className="font-bold" style={{ color: '#16a34a' }}>+562% vs avg</span>
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-3">
                          <p className="text-[10px] font-semibold text-gray-700 mb-2">Top items · Most viewed</p>
                          {[
                            { name: 'Gulab Jamun', views: 42 },
                            { name: 'Butter Chicken', views: 35 },
                            { name: 'Masala Chai', views: 28 },
                          ].map((it, i) => (
                            <div key={it.name} className="flex items-center gap-2 py-1">
                              <span
                                className="text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: '#eef2ff', color: '#4f46e5' }}
                              >
                                {i + 1}
                              </span>
                              <span className="text-[9.5px] font-semibold text-gray-800 flex-1 truncate">{it.name}</span>
                              <div className="w-14 h-1.5 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 hidden sm:block">
                                <div className="h-full rounded-full" style={{ width: `${(it.views / 42) * 100}%`, background: '#4f46e5' }} />
                              </div>
                              <span className="text-[9px] text-gray-400 flex-shrink-0 w-6 text-right">{it.views}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {active === 2 && (
                      <>
                        <div className="flex items-center justify-between mb-2.5 gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold text-gray-900">Menu Builder</p>
                            <p className="text-[10px] text-gray-500 truncate">Editing Bhagini · 5/∞ items</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#eef2ff' }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
                              </svg>
                            </span>
                            <span className="hidden sm:flex w-6 h-6 rounded-md items-center justify-center border border-gray-200">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                              </svg>
                            </span>
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 px-3 py-2 text-[10px] text-gray-400 mb-2.5 flex items-center gap-1.5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5">
                            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
                          </svg>
                          Search items or categories…
                        </div>

                        <div className="rounded-lg overflow-hidden border border-gray-200">
                          <div className="flex items-center justify-between px-3 py-2 bg-indigo-50">
                            <span className="text-[11px] font-bold text-gray-900">🍮 Desserts</span>
                            <span className="text-[9px] font-bold text-indigo-600 bg-white w-4 h-4 rounded-full flex items-center justify-center">1</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-3 py-2.5 border-t border-gray-100">
                            <div className="w-8 h-8 rounded-md flex-shrink-0" style={{ background: 'linear-gradient(135deg,#fbbf24,#f97316)' }} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full border flex-shrink-0" style={{ background: '#16A34A', borderColor: '#16A34A55' }} />
                                <p className="text-[11px] font-bold text-gray-900 truncate">Gulab Jamun</p>
                              </div>
                              <p className="text-[9px] text-indigo-600 mt-0.5">✨ New · 👨‍🍳 Chef&apos;s Special</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0 text-gray-300">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </div>
                            <span className="text-[11px] font-bold text-gray-900 flex-shrink-0">₹10</span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-2 bg-indigo-50 border-t border-gray-100">
                            <span className="text-[11px] font-bold text-gray-900">🍛 Curry</span>
                            <span className="text-[9px] font-bold text-indigo-600 bg-white w-4 h-4 rounded-full flex items-center justify-center">4</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-3 py-2.5 border-t border-gray-100">
                            <div className="w-8 h-8 rounded-md flex-shrink-0" style={{ background: 'linear-gradient(135deg,#f87171,#b91c1c)' }} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full border flex-shrink-0" style={{ background: '#DC2626', borderColor: '#DC262655' }} />
                                <p className="text-[11px] font-bold text-gray-900 truncate">Chicken Gravy</p>
                              </div>
                              <p className="text-[9px] text-indigo-600 mt-0.5">👨‍🍳 Chef&apos;s Special · 🌶️ Extra Hot</p>
                            </div>
                            <span className="text-[11px] font-bold text-gray-900 flex-shrink-0">₹200</span>
                          </div>
                        </div>
                      </>
                    )}

                    {active === 3 && (
                      <>
                        <div className="flex items-center justify-between mb-2.5">
                          <div>
                            <p className="text-sm font-extrabold text-gray-900">QR Codes</p>
                            <p className="text-[10px] text-gray-500">3 generated</p>
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-3 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 text-[10px] text-gray-400 border border-gray-200 rounded-md px-2.5 py-1.5 truncate">Label (e.g. Table 4, Takeaway)</div>
                            <span className="text-[10px] font-semibold text-white px-2.5 py-1.5 rounded-md flex-shrink-0 flex items-center gap-1" style={{ background: '#4f46e5' }}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
                              Generate
                            </span>
                          </div>
                          <p className="text-[8.5px] text-gray-400 mt-1.5 truncate">Points to: scanify.app/menu/bhagini</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          {[{ label: 'Table 1', date: 'Sep 12' }, { label: 'Table 2', date: 'Sep 18' }].map((t) => (
                            <div key={t.label} className="rounded-lg border border-gray-200 p-2.5 flex flex-col items-center gap-1.5">
                              <div className="flex items-center justify-between w-full">
                                <p className="text-[10px] font-bold text-gray-900">{t.label}</p>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
                                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6h12z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                              <QRPattern />
                              <div className="flex items-center gap-1 w-full">
                                <span className="flex-1 text-[8px] font-semibold text-indigo-600 border border-indigo-100 rounded px-1 py-1 text-center flex items-center justify-center gap-1">
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
                                  Copy
                                </span>
                                <span className="flex-1 text-[8px] font-semibold text-gray-600 border border-gray-200 rounded px-1 py-1 text-center flex items-center justify-center gap-1">
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                  Save
                                </span>
                              </div>
                              <p className="text-[7.5px] text-gray-400">Created {t.date}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {active === 4 && (
                      <>
                        <div className="flex items-center justify-between mb-2.5 gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold text-gray-900">Menu Appearance</p>
                            <p className="text-[10px] text-gray-500 truncate">Customize how your digital menu looks</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="hidden sm:flex w-6 h-6 rounded-md items-center justify-center border border-gray-200 text-gray-400">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                            <span className="text-[9px] font-semibold text-white px-2.5 py-1.5 rounded-md" style={{ background: '#4f46e5' }}>Save</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-400 mb-3 border-b border-gray-100 pb-2 overflow-x-auto scrollbar-hide">
                          <span className="text-indigo-600 border-b-2 border-indigo-600 pb-2 -mb-2.5 flex-shrink-0">Themes</span>
                          <span className="flex-shrink-0">Colors</span>
                          <span className="hidden sm:inline flex-shrink-0">Typography</span>
                          <span className="hidden sm:inline flex-shrink-0">Layout</span>
                          <span className="hidden sm:inline flex-shrink-0">Visibility</span>
                        </div>

                        <p className="text-[8.5px] font-bold text-gray-400 uppercase tracking-wide mb-2">Preset Themes</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { name: 'Ember', emoji: '🔥', colors: ['#fdf2e3', '#c96442', '#1c1408'] },
                            { name: 'Midnight', emoji: '🌑', colors: ['#0b0b0d', '#d4a017', '#3a3a3a'] },
                            { name: 'Sage Garden', emoji: '🌿', colors: ['#e8efe4', '#4c7a5c', '#1c2b20'] },
                            { name: 'Ocean Blue', emoji: '🌊', colors: ['#eaf4fb', '#2f6690', '#0d2436'] },
                            { name: 'Rose Petal', emoji: '🌸', colors: ['#fdf0f3', '#c2577a', '#3a1420'] },
                            { name: 'Slate Pro', emoji: '🪨', colors: ['#eef0f2', '#475569', '#1e293b'] },
                            { name: 'Saffron Spice', emoji: '🌶️', colors: ['#fff4e0', '#e08a1e', '#3a2305'] },
                            { name: 'Charcoal', emoji: '🖤', colors: ['#141414', '#8a8a8a', '#2a2a2a'], selected: true },
                          ].map((th) => (
                            <div key={th.name} className="rounded-lg border p-2" style={{ borderColor: th.selected ? '#4f46e5' : '#e5e7eb', borderWidth: th.selected ? 2 : 1 }}>
                              <div className="flex h-6 rounded overflow-hidden mb-1.5">
                                {th.colors.map((c, i) => <span key={i} className="flex-1" style={{ background: c }} />)}
                              </div>
                              <p className="text-[9px] font-bold text-gray-800 truncate">{th.emoji} {th.name}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                  </div>
                </div>
              </div>
            </div>

            {/* ground shadow for depth */}
            <div
              className="mx-auto mt-2 pointer-events-none"
              style={{ width: '70%', height: 28, background: 'radial-gradient(50% 100% at 50% 0%, rgba(15,23,42,0.18), transparent 75%)' }}
            />
          </div>

        </div>
      </div>
    </section>

  )
}