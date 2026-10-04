'use client'

type Theme = {
  name: string
  tagline: string
  bg: string
  surface: string
  text: string
  muted: string
  accent: string
  accentText: string
  phoneBorder: string
  layout: 'list' | 'grid' | 'stacked'
}

const THEMES: Theme[] = [
  {
    name: 'Ember',
    tagline: 'Warm · Classic bistro',
    bg: '#fdf2e3',
    surface: '#ffffff',
    text: '#1c1408',
    muted: '#9a8468',
    accent: '#c96442',
    accentText: '#ffffff',
    phoneBorder: '#1c1408',
    layout: 'list',
  },
  {
    name: 'Midnight',
    tagline: 'Dark · Lounge & bar',
    bg: '#0b0b0d',
    surface: '#17171a',
    text: '#f4f4f5',
    muted: '#8a8a90',
    accent: '#d4a017',
    accentText: '#0b0b0d',
    phoneBorder: '#0b0b0d',
    layout: 'grid',
  },
  {
    name: 'Sage Garden',
    tagline: 'Fresh · Café & brunch',
    bg: '#e8efe4',
    surface: '#ffffff',
    text: '#1c2b20',
    muted: '#6f8a76',
    accent: '#4c7a5c',
    accentText: '#ffffff',
    phoneBorder: '#1c2b20',
    layout: 'stacked',
  },
]

const LIST_ITEMS = [
  { emoji: '🥘', name: 'Table d’Hote', price: '₹450' },
  { emoji: '🍷', name: 'House Red', price: '₹320' },
  { emoji: '🥖', name: 'Garlic Bread', price: '₹140' },
]

const GRID_ITEMS = [
  { emoji: '🍸', name: 'Smoked Old Fashioned', price: '₹550' },
  { emoji: '🍢', name: 'Chef’s Skewers', price: '₹380' },
  { emoji: '🧀', name: 'Cheese Board', price: '₹480' },
  { emoji: '🥃', name: 'Single Malt', price: '₹700' },
]

const STACK_ITEMS = [
  { emoji: '🥞', name: 'Buttermilk Pancakes', desc: 'Maple syrup, berries', price: '₹260' },
  { emoji: '☕', name: 'Cold Brew', desc: 'Single-origin, 24h steeped', price: '₹190' },
]

function PhoneFrame({ theme, delay }: { theme: Theme; delay: string }) {
  return (
    <div
      className="theme-phone relative w-[250px] sm:w-[270px] flex-shrink-0"
      style={{ animationDelay: delay }}
    >
      <div
        className="w-full h-[520px] rounded-[42px] border-[9px] overflow-hidden relative"
        style={{
          borderColor: theme.phoneBorder,
          background: theme.phoneBorder,
          boxShadow: 'var(--shadow2), 0 30px 60px -25px rgba(0,0,0,0.35)',
        }}
      >
        <div
          className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-[20px] rounded-xl z-20"
          style={{ background: theme.phoneBorder }}
        />

        <div className="w-full h-full flex flex-col" style={{ background: theme.bg, color: theme.text }}>
          {/* header */}
          <div className="pt-11 pb-4 px-4 flex-shrink-0" style={{ background: theme.accent, color: theme.accentText }}>
            <p className="text-[9px] font-semibold uppercase tracking-wide opacity-80">{theme.tagline}</p>
            <h4 className="font-syne text-[15px] font-bold mt-0.5">{theme.name} House</h4>
          </div>

          {/* category pills */}
          <div className="flex gap-1.5 px-3 pt-3 pb-1 overflow-hidden flex-shrink-0">
            {['Starters', 'Mains', 'Drinks'].map((cat, i) => (
              <div
                key={cat}
                className="flex-shrink-0 px-2.5 py-1 rounded-full text-[9.5px] font-semibold"
                style={
                  i === 0
                    ? { background: theme.accent, color: theme.accentText }
                    : { background: theme.surface, color: theme.muted, border: `1px solid ${theme.muted}33` }
                }
              >
                {cat}
              </div>
            ))}
          </div>

          {/* body — layout varies per theme */}
          <div className="flex-1 overflow-hidden p-2.5">
            {theme.layout === 'list' &&
              LIST_ITEMS.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 mb-2"
                  style={{ background: theme.surface, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="w-9 h-9 rounded-[9px] flex-shrink-0 flex items-center justify-center text-base"
                    style={{ background: `${theme.accent}1a` }}
                  >
                    {item.emoji}
                  </div>
                  <div className="text-[11px] font-semibold flex-1 truncate">{item.name}</div>
                  <div className="text-[11px] font-bold flex-shrink-0" style={{ color: theme.accent }}>{item.price}</div>
                </div>
              ))}

            {theme.layout === 'grid' && (
              <div className="grid grid-cols-2 gap-2">
                {GRID_ITEMS.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-xl p-2.5"
                    style={{ background: theme.surface }}
                  >
                    <div
                      className="w-full h-10 rounded-md flex items-center justify-center text-base mb-1.5"
                      style={{ background: `${theme.accent}22` }}
                    >
                      {item.emoji}
                    </div>
                    <p className="text-[9.5px] font-semibold leading-tight truncate">{item.name}</p>
                    <p className="text-[10px] font-bold mt-0.5" style={{ color: theme.accent }}>{item.price}</p>
                  </div>
                ))}
              </div>
            )}

            {theme.layout === 'stacked' &&
              STACK_ITEMS.map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl mb-2.5 overflow-hidden"
                  style={{ background: theme.surface, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="w-full h-16 flex items-center justify-center text-2xl"
                    style={{ background: `${theme.accent}1f` }}
                  >
                    {item.emoji}
                  </div>
                  <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold truncate">{item.name}</p>
                      <p className="text-[9px] mt-0.5 truncate" style={{ color: theme.muted }}>{item.desc}</p>
                    </div>
                    <p className="text-[11px] font-bold flex-shrink-0" style={{ color: theme.accent }}>{item.price}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* theme label chip */}
      <div
        className="mx-auto mt-5 w-fit flex items-center gap-2 bg-card border border-theme2 rounded-full px-3.5 py-1.5"
        style={{ boxShadow: 'var(--shadow)' }}
      >
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: theme.accent }} />
        <span className="text-[11px] font-bold text-theme">{theme.name}</span>
      </div>
    </div>
  )
}

export default function ThemeShowcase() {
  return (
    <section className="py-24 px-7 bg-theme overflow-hidden">
      <style>{`
        @keyframes themePhoneFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        .theme-phone { animation: themePhoneFloat 6s ease-in-out infinite; }
      `}</style>

      <div className="max-w-[1360px] mx-auto text-center">
        <div className="text-xs font-semibold tracking-[1.2px] uppercase text-accent-t mb-3">Make It Yours</div>
        <h2 className="font-syne font-extrabold text-theme mb-4 tracking-tight" style={{ fontSize: 'clamp(30px, 3.5vw, 44px)' }}>
          One menu, endless looks.
        </h2>
        <p className="text-base text-theme2 max-w-[560px] leading-relaxed mb-16 mx-auto">
          Switch between themes, colors, and layouts in a click. Every brand gets a digital menu that feels custom-built.
        </p>

        <div className="flex flex-wrap items-start justify-center gap-10 sm:gap-8">
          {THEMES.map((theme, i) => (
            <PhoneFrame key={theme.name} theme={theme} delay={`${i * 0.4}s`} />
          ))}
        </div>
      </div>
    </section>
  )
}
