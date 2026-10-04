'use client'

import { useState } from 'react'

type DietColor = '#16A34A' | '#DC2626' | '#D97706'

type CardDish = {
  cat: number
  name: string
  tags: string[]
  diet: DietColor
  serves: string
  time: string
  price: string
  kcal: string
  img: string
  soldOut?: boolean
}

type ListDish = {
  cat: number
  name: string
  desc: string
  tags: string[]
  diet: DietColor
  price: string
  img: string
}

type CompactDish = {
  cat: number
  name: string
  tags: string[]
  diet: DietColor
  price: string
}

type Category = { icon: string; name: string; count: number }

type Theme = {
  name: string
  tagline: string
  layoutLabel: string
  bg: string
  surface: string
  text: string
  muted: string
  accent: string
  accentText: string
  phoneBorder: string
  logoGrad: string
  hotelName: string
  desc: string
  rating: string
  reviews: string
  tags: string[]
  hours: string
  categoryStyle: 'pill' | 'underline' | 'card'
  categories: Category[]
  layout: 'card' | 'list' | 'compact'
  cardItems?: CardDish[]
  listItems?: ListDish[]
  compactItems?: CompactDish[]
}

const THEMES: Theme[] = [
  {
    name: 'Farmlore',
    tagline: 'Card layout',
    layoutLabel: 'Card Layout',
    bg: '#FAFAF8',
    surface: '#ffffff',
    text: '#1c1917',
    muted: '#78716c',
    accent: '#C8622A',
    accentText: '#ffffff',
    phoneBorder: '#1c1917',
    logoGrad: 'linear-gradient(135deg,#d6a86a,#8a6a3f)',
    hotelName: 'Farmlore',
    desc: 'Best Hotel in Bengaluru',
    rating: '4.5',
    reviews: '1,000',
    tags: ['South Indian', 'North Indian'],
    hours: '07:30 – 22:27',
    categoryStyle: 'pill',
    categories: [{ icon: '🍮', name: 'Desserts', count: 1 }, { icon: '🍛', name: 'Curry', count: 2 }],
    layout: 'card',
    cardItems: [
      { cat: 0, name: 'Gulab Jamun', tags: ['New', "Chef's Special"], diet: '#16A34A', serves: '5', time: '15m', price: '₹20', kcal: '50 kcal', img: 'linear-gradient(135deg,#b91c1c,#7c2d12)' },
      { cat: 1, name: 'Butter Chicken', tags: ["Chef's Special"], diet: '#DC2626', serves: '2', time: '25m', price: '₹320', kcal: '480 kcal', img: 'linear-gradient(135deg,#ea9a3e,#b45309)' },
      { cat: 1, name: 'Paneer Butter Masala', tags: ['Bestseller'], diet: '#16A34A', serves: '2', time: '20m', price: '₹260', kcal: '410 kcal', img: 'linear-gradient(135deg,#f59e0b,#92400e)' },
    ],
  },
  {
    name: 'Karavalli',
    tagline: 'List layout',
    layoutLabel: 'List Layout',
    bg: '#0e0d0b',
    surface: '#1a1814',
    text: '#f5f0e8',
    muted: '#a89f8c',
    accent: '#d9a441',
    accentText: '#1c1408',
    phoneBorder: '#000000',
    logoGrad: 'linear-gradient(135deg,#d9a441,#8a5a1f)',
    hotelName: 'Karavalli',
    desc: 'Serving fresh, flavorful chaats & beverages.',
    rating: '4.3',
    reviews: '98',
    tags: ['Fast Food'],
    hours: '13:00 – 21:00',
    categoryStyle: 'card',
    categories: [{ icon: '🥗', name: 'Chats', count: 3 }, { icon: '🍹', name: 'Drinks', count: 2 }],
    layout: 'list',
    listItems: [
      { cat: 0, name: 'Gobi Manchurian', desc: 'Crispy cabbage, spicy Indo-Chinese sauce', tags: [], diet: '#16A34A', price: '₹60', img: 'linear-gradient(135deg,#b91c1c,#7c2d12)' },
      { cat: 0, name: 'Pani Puri', desc: 'Crispy puris, tangy spiced water', tags: [], diet: '#16A34A', price: '₹40', img: 'linear-gradient(135deg,#d9a441,#8a5a1f)' },
      { cat: 0, name: 'Dahi Puri', desc: 'Crispy puris filled with curd & chutneys', tags: [], diet: '#D97706', price: '₹50', img: 'linear-gradient(135deg,#a16207,#713f12)' },
      { cat: 1, name: 'Masala Chaas', desc: 'Spiced buttermilk, served chilled', tags: [], diet: '#16A34A', price: '₹30', img: 'linear-gradient(135deg,#eab308,#854d0e)' },
      { cat: 1, name: 'Jaljeera', desc: 'Tangy cumin & mint cooler', tags: [], diet: '#16A34A', price: '₹35', img: 'linear-gradient(135deg,#65a30d,#365314)' },
      { cat: 1, name: 'Nimbu Soda', desc: 'Refreshing lemon soda with a hint of mint', tags: [], diet: '#16A34A', price: '₹40', img: 'linear-gradient(135deg,#84cc16,#166534)' },
      { cat: 0, name: 'Samosa Chaat', desc: 'Crispy samosa topped with chutneys & spices', tags: ['Popular'], diet: '#16A34A', price: '₹70', img: 'linear-gradient(135deg,#c2410c,#7c2d12)' },
    ],
  },
  {
    name: 'Sage Garden Café',
    tagline: 'Compact layout',
    layoutLabel: 'Compact Layout',
    bg: '#eef2ea',
    surface: '#ffffff',
    text: '#1c2b20',
    muted: '#6f8a76',
    accent: '#4c7a5c',
    accentText: '#ffffff',
    phoneBorder: '#1c2b20',
    logoGrad: 'linear-gradient(135deg,#86a98f,#3f5f48)',
    hotelName: 'Sage Garden Café',
    desc: 'Fresh, plant-forward brunch & coffee.',
    rating: '4.7',
    reviews: '340',
    tags: ['Café', 'Brunch'],
    hours: '08:00 – 18:00',
    categoryStyle: 'underline',
    categories: [{ icon: '🥞', name: 'Brunch', count: 2 }, { icon: '☕', name: 'Coffee', count: 2 }],
    layout: 'compact',
    compactItems: [
      { cat: 0, name: 'Buttermilk Pancakes', tags: ['Popular'], diet: '#16A34A', price: '₹260' },
      { cat: 0, name: 'Avocado Toast', tags: ['New'], diet: '#16A34A', price: '₹220' },
      { cat: 1, name: 'Cold Brew', tags: [], diet: '#16A34A', price: '₹190' },
      { cat: 1, name: 'Masala Chai', tags: ['Bestseller'], diet: '#16A34A', price: '₹90' },
      { cat: 0, name: 'Classic French Toast', tags: ['Popular'], diet: '#16A34A', price: '₹240' },
      { cat: 0, name: 'Blueberry Waffles', tags: ['Bestseller'], diet: '#16A34A', price: '₹280' },
      { cat: 0, name: 'Egg & Cheese Sandwich', tags: [], diet: '#16A34A', price: '₹210' },
      { cat: 0, name: 'Cheese Omelette', tags: ['Popular'], diet: '#16A34A', price: '₹180' },
      { cat: 0, name: 'Veggie Breakfast Bowl', tags: ['Healthy'], diet: '#16A34A', price: '₹250' },

      { cat: 1, name: 'Cappuccino', tags: ['Popular'], diet: '#16A34A', price: '₹160' },
      { cat: 1, name: 'Iced Latte', tags: ['New'], diet: '#16A34A', price: '₹180' },
      { cat: 1, name: 'Filter Coffee', tags: ['Bestseller'], diet: '#16A34A', price: '₹100' },
    ],
  },
]

function Stars({ color }: { color: string }) {
  return (
    <span className="inline-flex items-center gap-[1px]">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="8" height="8" viewBox="0 0 24 24" fill={i < 4 ? color : 'none'} stroke={color} strokeWidth="1.5">
          <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
        </svg>
      ))}
    </span>
  )
}

function CategoryPill({ theme, cat, active, onClick }: { theme: Theme; cat: Category; active: boolean; onClick: () => void }) {
  const base = 'flex-shrink-0 text-[9.5px] font-semibold px-2.5 py-1.5 flex items-center gap-1 transition-colors cursor-pointer'
  if (theme.categoryStyle === 'underline') {
    return (
      <button
        onClick={onClick}
        className={`${base} border-b-2`}
        style={{ borderColor: active ? theme.accent : 'transparent', color: active ? theme.accent : theme.muted }}
      >
        {cat.icon} {cat.name}
      </button>
    )
  }
  if (theme.categoryStyle === 'card') {
    return (
      <button
        onClick={onClick}
        className={`${base} rounded-lg border`}
        style={{
          borderColor: active ? theme.accent : `${theme.muted}44`,
          background: active ? `${theme.accent}22` : 'transparent',
          color: active ? theme.accent : theme.muted,
        }}
      >
        {cat.icon} {cat.name}
      </button>
    )
  }
  return (
    <button
      onClick={onClick}
      className={`${base} rounded-full`}
      style={active ? { background: theme.accent, color: theme.accentText } : { background: `${theme.muted}22`, color: theme.muted }}
    >
      {cat.icon} {cat.name}
    </button>
  )
}

function TagChip({ label, accent }: { label: string; accent: string }) {
  return (
    <span className="text-[7.5px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: `${accent}22`, color: accent }}>
      {label}
    </span>
  )
}

function PhoneFrame({ theme, delay }: { theme: Theme; delay: string }) {
  const [activeCat, setActiveCat] = useState(0)

  return (
    <div className="theme-phone relative w-[250px] sm:w-[270px] flex-shrink-0" style={{ animationDelay: delay }}>
      <div
        className="w-full h-[540px] rounded-[42px] border-[9px] overflow-hidden relative"
        style={{ borderColor: theme.phoneBorder, background: theme.phoneBorder, boxShadow: 'var(--shadow2), 0 30px 60px -25px rgba(0,0,0,0.35)' }}
      >
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-[20px] rounded-xl z-20" style={{ background: theme.phoneBorder }} />

        <div className="w-full h-full flex flex-col overflow-hidden" style={{ background: theme.bg, color: theme.text }}>
          {/* restaurant header */}
          <div className="pt-10 px-3.5 pb-2.5 flex-shrink-0">
            <div className="flex items-start gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0"
                style={{ background: theme.logoGrad, boxShadow: `0 0 0 2px ${theme.bg}` }}
              >
                {theme.hotelName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[7.5px] font-bold px-1.5 py-[1px] rounded-full" style={{ background: '#16A34A22', color: '#16A34A' }}>● Open</span>
                  <span className="text-[7.5px]" style={{ color: theme.muted }}>⏱ {theme.hours}</span>
                </div>
                <p className="text-[12.5px] flex font-extrabold mt-0.5 truncate" style={{ fontFamily: 'var(--font-syne, inherit)' }}>{theme.hotelName}</p>
              </div>
            </div>
            <p className="text-[8.5px] mt-1.5 leading-snug" style={{ color: theme.muted }}>{theme.desc}</p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span
                className="inline-flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-md"
                style={{ background: `${theme.accent}22`, color: theme.accent }}
              >
                <Stars color={theme.accent} /> {theme.rating}
              </span>
              <span className="text-[7.5px]" style={{ color: theme.muted }}>({theme.reviews})</span>
              {theme.tags.map((t) => (
                <span key={t} className="text-[7.5px] font-semibold px-1.5 py-0.5 rounded-md border" style={{ borderColor: `${theme.muted}44`, color: theme.muted }}>
                  {t}
                </span>
              ))}
            </div>

            {/* search */}
            <div
              className="mt-2.5 rounded-lg px-2.5 py-1.5 text-[8.5px] flex items-center gap-1.5"
              style={{ background: theme.surface, border: `1px solid ${theme.muted}33`, color: theme.muted }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={theme.muted} strokeWidth="2.5"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
              Search dishes, drinks…
            </div>
          </div>

          {/* category nav */}
          <div className="flex gap-1.5 px-3.5 pb-2 overflow-hidden flex-shrink-0" style={{ borderBottom: theme.categoryStyle === 'underline' ? `1px solid ${theme.muted}22` : 'none' }}>
            {theme.categories.map((c, i) => (
              <CategoryPill key={c.name} theme={theme} cat={c} active={i === activeCat} onClick={() => setActiveCat(i)} />
            ))}
          </div>

          {/* category section + items */}
          <div className="flex-1 overflow-hidden px-3.5 pt-2.5">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px]">{theme.categories[activeCat].icon}</span>
              <p className="text-[10.5px] font-extrabold">{theme.categories[activeCat].name}</p>
              <span className="text-[7.5px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: `${theme.accent}22`, color: theme.accent }}>
                {theme.categories[activeCat].count}
              </span>
              <div className="flex-1 h-px" style={{ background: `${theme.muted}22` }} />
            </div>

            {theme.layout === 'card' && theme.cardItems && (
              <div className="grid grid-cols-1 gap-2.5">
                {theme.cardItems.filter((it) => it.cat === activeCat).map((it) => (
                  <div key={it.name} className="rounded-xl overflow-hidden" style={{ background: theme.surface, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                    <div className="w-full h-20" style={{ background: it.img }} />
                    <div className="p-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0 border" style={{ background: it.diet, borderColor: `${it.diet}55` }} />
                        <p className="text-[10px] flex font-bold truncate flex-1">{it.name}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {it.tags.map((t) => <TagChip key={t} label={t} accent={theme.accent} />)}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[7.5px]" style={{ color: theme.muted }}>
                        <span>👥 {it.serves}</span>
                        <span>⏱ {it.time}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px] font-extrabold" style={{ color: theme.accent }}>{it.price}</span>
                        <span className="text-[7.5px]" style={{ color: theme.muted }}>{it.kcal}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {theme.layout === 'list' && theme.listItems && (
              <div className="flex flex-col">
                {theme.listItems.filter((it) => it.cat === activeCat).map((it, i) => (
                  <div
                    key={it.name}
                    className="flex items-center gap-2.5 py-2.5"
                    style={{ borderTop: i === 0 ? 'none' : `1px solid ${theme.muted}1f` }}
                  >
                    <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ background: it.img }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 border" style={{ background: it.diet, borderColor: `${it.diet}55` }} />
                        <p className="text-[9.5px] font-bold truncate">{it.name}</p>
                      </div>
                      <p className="text-[7.5px] mt-0.5 truncate" style={{ color: theme.muted }}>{it.desc}</p>
                    </div>
                    <span className="text-[10px] font-extrabold flex-shrink-0" style={{ color: theme.accent }}>{it.price}</span>
                  </div>
                ))}
              </div>
            )}

            {theme.layout === 'compact' && theme.compactItems && (
              <div className="flex flex-col gap-1.5">
                {theme.compactItems.filter((it) => it.cat === activeCat).map((it) => (
                  <div
                    key={it.name}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2"
                    style={{ background: theme.surface, border: `1px solid ${theme.muted}22` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 border" style={{ background: it.diet, borderColor: `${it.diet}55` }} />
                    <p className="text-[9.5px] flex font-semibold truncate flex-1">{it.name}</p>
                    {it.tags.map((t) => <TagChip key={t} label={t} accent={theme.accent} />)}
                    <span className="text-[10px] font-extrabold flex-shrink-0" style={{ color: theme.accent }}>{it.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* theme label chip */}
      <div className="mx-auto mt-5 w-fit flex items-center gap-2 bg-card border border-theme2 rounded-full px-3.5 py-1.5" style={{ boxShadow: 'var(--shadow)' }}>
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: theme.accent }} />
        <span className="text-[11px] font-bold text-theme">{theme.name}</span>
        <span className="text-[10px] text-theme3">· {theme.layoutLabel}</span>
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
          Switch between themes, colors, and layouts in a click
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
