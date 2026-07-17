// CTASection.tsx — NEW section: Lark-style full-width soft-blue CTA
'use client';

// Add this between Pricing and Footer

export default function CTASection() {
    return (
        <section
            style={{
                background: 'var(--bg)',
                padding: 'clamp(72px, 8vw, 100px) 20px',
            }}
        >
            <div className="max-w-[1460px] mx-auto">
                <div
                    className="relative rounded-3xl overflow-hidden text-center px-6 py-16 md:py-20"
                    style={{
                        background: 'linear-gradient(135deg, #EBF0FF 0%, #F4F0FF 50%, #EBF0FF 100%)',
                    }}
                >
                    {/* Decorative blobs */}
                    <div style={{
                        position: 'absolute', top: -40, left: -40, width: 200, height: 200,
                        borderRadius: '50%', background: 'rgba(43,91,246,0.10)', filter: 'blur(60px)', pointerEvents: 'none'
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -40, right: -40, width: 200, height: 200,
                        borderRadius: '50%', background: 'rgba(123,91,246,0.10)', filter: 'blur(60px)', pointerEvents: 'none'
                    }} />

                    <div className="relative z-10">
                        <h2
                            className="font-extrabold leading-tight tracking-tight mb-4 mx-auto"
                            style={{
                                fontSize: 'clamp(28px, 4vw, 52px)',
                                color: '#0D1117',
                                fontFamily: 'var(--font-syne, sans-serif)',
                                letterSpacing: '-1.5px',
                                maxWidth: 600,
                            }}
                        >
                            Get more guests served,<br />for less effort.
                        </h2>
                        <p className="text-[16px] leading-[1.7] mb-8 mx-auto" style={{ color: '#4A5568', maxWidth: 460 }}>
                            Join 500+ restaurants already using Scanify to delight guests and cut costs.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <a
                                href="/login"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[15px] font-semibold text-white no-underline transition-all duration-200"
                                style={{ background: 'var(--accent)', boxShadow: '0 2px 16px rgba(43,91,246,0.30)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
                            >
                                Start for free →
                            </a>
                            <a
                                href="#how"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[15px] font-medium no-underline transition-all duration-200"
                                style={{ background: 'rgba(13,17,23,0.08)', color: '#0D1117' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(13,17,23,0.12)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(13,17,23,0.08)'}
                            >
                                Watch demo
                            </a>
                        </div>
                        <p className="text-[12px] mt-5" style={{ color: '#8898B3' }}>
                            4-day free trial · No credit card required
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}