'use client'
import Link from 'next/link'

export default function Hero() {
  return (

    <section id="home" className="relative min-h-screen pt-28 md:pt-34 pb-20 grid-bg overflow-x-hidden">
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
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>

      <div className="absolute rounded-full bg-accentlt opacity-50 pointer-events-none z-[-1]"
        style={{ width: 600, height: 600, top: -200, right: -100, filter: 'blur(80px)' }} />
      <div className="absolute rounded-full bg-accentlt opacity-50 pointer-events-none z-[-1]"
        style={{ width: 300, height: 300, bottom: 0, left: -80, filter: 'blur(80px)' }} />

      <div className=" max-w-[1460px] mx-auto px-7 grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr]  items-center justify-between">

        <div className='' style={{ animation: "fadeInUp 0.8s ease-out" }}>

          <div className="inline-flex items-center gap-2 bg-accentlt border border-green-300/25 rounded-full px-3.5 py-1.5 text-xs font-medium text-accent-t mb-5">
            <span className="badge-dot w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
            No app download required
          </div>

          <h1 className="font-syne font-extrabold text-theme leading-[1.05] tracking-[-1.5px] mb-5"
            style={{ fontSize: 'clamp(42px, 5vw, 68px)' }}>
            Your Menu,<br />
            <span style={{ color: 'var(--accent)' }}>One Scan</span><br />
            Away.
          </h1>

          <p className="text-[17px] leading-relaxed text-theme2 max-w-[480px] mb-9 font-light">
            Replace printed menus with a smart digital experience. Scan a QR code and browse instantly.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="#pricing"
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-semibold text-theme no-underline transition-all duration-200 hover:-translate-y-px z-20"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
              Start for Free
            </Link>

            <Link
              href="#how"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-semibold text-theme border border-theme2 no-underline hover:bg-theme3 transition-all duration-200 z-20"
            >
              See How It Works
            </Link>
          </div>

          <div className="flex flex-wrap gap-8 mt-12 mb-8">
            {[
              { num: '500+', label: 'Restaurants onboarded' },
              { num: '0₹', label: 'Printing costs saved' },
              { num: '3s', label: 'Average menu load time' },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="font-syne font-extrabold text-[28px] text-theme tracking-tight">{num}</div>
                <div className="text-[13px] text-theme3 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          <div className="hidden md:grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: 'Instant Access',
                desc: 'Scan and browse instantly',
                tag: '~2 sec load time',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                ),
              },
              {
                title: 'Real-time Updates',
                desc: 'Edit your menu instantly',
                tag: 'Always up to date',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                ),
              },
              {
                title: 'Save on Costs',
                desc: 'No more printing costs',
                tag: 'Zero printing costs',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                ),
              },
            ].map(({ title, desc, tag, icon }) => (
              <div
                key={title}
                className="relative bg-card rounded-2xl p-4 border border-[var(--border)] overflow-hidden
                 transition-transform duration-200 hover:-translate-y-1"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                  style={{ background: 'var(--accent)' }}
                />

                <div className='flex items-center gap-3'>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(29,185,84,0.10)' }}
                  >
                    {icon}
                  </div>

                  <h3
                    className="font-syne font-bold text-[15px] text-theme mb-1.5 tracking-tight"
                  >
                    {title}
                  </h3>
                </div>
                <p className="text-[13px] leading-relaxed text-theme3">{desc}</p>

                <div
                  className="inline-flex items-center gap-1.5 mt-4 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ background: 'rgba(29,185,84,0.08)', color: 'var(--accent-dark)' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--accent)' }}
                  />
                  {tag}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className=" md:w-[380px] mt-5 flex justify-center  items-center" style={{ animation: "slideIn 0.8s ease-out" }}>
          <div className="relative  ">

            <div className="w-[280px] h-[560px] rounded-[44px] bg-card border-[10px] phone-border overflow-hidden relative"
              style={{ borderColor: 'var(--phone-border)', boxShadow: 'var(--shadow2), 0 0 0 1px var(--border)' }}>

              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-[22px] rounded-xl z-10 phone-notch-bg"
                style={{ background: 'var(--phone-notch)' }} />
              <div className="w-full h-full bg-theme flex flex-col">
                <div className="pt-11 pb-4 px-4" style={{ background: 'var(--accent)' }}>
                  <h4 className="font-syne text-base font-bold text-white">Grand Palace Hotel</h4>
                  <p className="text-[11px] text-white/75 mt-0.5">Scan · Browse · Enjoy</p>
                </div>
                <div className="flex gap-1.5 px-3 pt-3 overflow-x-auto scrollbar-hide">
                  {['Starters', 'Main Course', 'Drinks', 'Desserts'].map((cat, i) => (
                    <div key={cat} className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold ${i === 0 ? 'text-white' : 'text-theme2 bg-theme3'}`}
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
                    { emoji: '🍔', name: 'Veg Burger', desc: 'Stuffed with vegies', price: '₹80' },

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
    </section>

  )
}
