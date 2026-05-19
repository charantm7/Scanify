const stats = [
  { num: '70%', label: 'Reduction in menu management time' },
  { num: '₹0', label: 'Recurring printing costs' },
  { num: '3s', label: 'Menu load time for customers' },
  { num: '∞', label: 'Updates, any time' },
]

const points = [
  "A Digital Menu Card is not just a menu — it's a smarter way to run your restaurant.",
  'Update your menu any time, add new dishes instantly.',
  'Promote special items and daily specials in seconds.',
  'Save significant long-term costs vs. repeated reprints.',
  'Simple to use. Easy to manage. Designed to grow your business.',
]

export default function WhySwitch() {
  return (
    <section className="py-20 px-7" style={{ background: 'var(--accent)' }}>
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

        <div>
          <div className="text-[13px] font-semibold tracking-[1.2px] uppercase mb-2.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Why Switch
          </div>
          <h2 className="font-syne font-extrabold text-white leading-[1.1] tracking-tight mb-4"
            style={{ fontSize: 'clamp(28px, 3vw, 42px)' }}>
            Printed menus are holding you back.
          </h2>
          <p className="text-base leading-relaxed mb-7" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Every price change means reprinting. Every new dish means redesigning. With The QR Company,
            your menu lives online — always current, always professional.
          </p>

          <div className="grid grid-cols-2 gap-5">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl px-[22px] py-5"
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div className="font-syne font-extrabold text-[32px] text-white">{s.num}</div>
                <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[20px] p-7" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <p className="font-syne font-bold text-base text-white mb-5">The Bottom Line</p>
          <ul className="flex flex-col gap-3.5 list-none">
            {points.map((point) => (
              <li key={point} className="flex gap-3 items-start text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                <span className="w-[22px] h-[22px] rounded-[7px] flex-shrink-0 flex items-center justify-center text-xs text-white font-bold"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
