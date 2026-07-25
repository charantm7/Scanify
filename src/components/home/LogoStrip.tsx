// LogoStrip.tsx — Insert between Hero and HowItWorks
// Shows social proof logos (Lark-style scrolling strip)
'use client';


const logos = [
    { name: 'Grand Palace Hotel', abbr: 'GP' },
    { name: 'Spice Garden', abbr: 'SG' },
    { name: 'Café Noir', abbr: 'CN' },
    { name: 'The Dosa Hub', abbr: 'DH' },
    { name: 'Taj Residency', abbr: 'TR' },
    { name: 'Blue Leaf Café', abbr: 'BL' },
    { name: 'Hotel Navrang', abbr: 'HN' },
];

export default function LogoStrip() {
    return (
        <div
            className="py-8 border-y"
            style={{ background: 'var(--bg1)', borderColor: 'var(--border)' }}
        >
            <div className="max-w-[1200px] mx-auto px-5 sm:px-6">
                <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-10">
                    <p className="text-[12px] font-medium flex-shrink-0 text-center sm:text-left" style={{ color: 'var(--text3)', letterSpacing: '0.5px' }}>
                        TRUSTED BY RESTAURANTS<br className="hidden sm:block" /> ACROSS INDIA
                    </p>
                    <div className="w-px h-8 hidden sm:block" style={{ background: 'var(--border2)' }} />
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3">
                        {logos.map((logo) => (
                            <div
                                key={logo.name}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-150"
                                style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
                            >
                                <div
                                    className="w-6 h-6 rounded-lg text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'var(--accent)' }}
                                >
                                    {logo.abbr}
                                </div>
                                <span className="text-[13px] font-medium whitespace-nowrap" style={{ color: 'var(--text2)' }}>
                                    {logo.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}