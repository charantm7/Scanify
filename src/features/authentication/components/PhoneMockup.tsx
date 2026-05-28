export default function PhoneMockup() {
    const Items = [
        { emoji: '🥗', name: 'Garden Salad', desc: 'Fresh greens, vinaigrette', price: '₹180' },
        { emoji: '🍜', name: 'Veg Manchurian', desc: 'Indo-Chinese classic', price: '₹220' },
        { emoji: '🫓', name: 'Garlic Bread', desc: 'Toasted with herb butter', price: '₹120' },
    ]
    return (
        <div className="hidden md:flex justify-center items-center" style={{ animation: 'slideIn 0.8s ease-out' }}>
            <div className="relative w-[280px]">
                <div
                    className="w-[280px] h-[560px] rounded-[44px] bg-card border-[10px] overflow-hidden relative"
                    style={{ borderColor: 'var(--phone-border)', boxShadow: 'var(--shadow2), 0 0 0 1px var(--border)' }}
                >
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-[22px] rounded-xl z-10" style={{ background: 'var(--phone-notch)' }} />
                    <div className="w-full h-full bg-theme flex flex-col">
                        <div className="pt-11 pb-4 px-4" style={{ background: 'var(--accent)' }}>
                            <h4 className="font-syne text-base font-bold text-white">Grand Palace Hotel</h4>
                            <p className="text-[11px] text-white/75 mt-0.5">Scan · Browse · Enjoy</p>
                        </div>
                        <div className="flex gap-1.5 px-3 pt-3 overflow-x-auto scrollbar-hide">
                            {['Starters', 'Main Course', 'Drinks', 'Desserts'].map((cat, i) => (
                                <div
                                    key={cat}
                                    className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold ${i === 0 ? 'text-white' : 'text-theme2 bg-theme3'}`}
                                    style={i === 0 ? { background: 'var(--accent)' } : {}}
                                >
                                    {cat}
                                </div>
                            ))}
                        </div>
                        <div className="p-2.5 flex-1 overflow-hidden">
                            {Items.map((item) => (
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
                {/* QR Badge */}
                <div className="absolute -bottom-4 -right-8 bg-card border border-theme2 rounded-[18px] p-3.5 flex items-center gap-3.5" style={{ boxShadow: 'var(--shadow2)' }}>
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
    )
}