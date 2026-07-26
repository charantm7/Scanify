// CTASection.tsx — QR-viewfinder CTA, fully token-driven (light + dark), responsive
'use client';

export default function CTASection() {
    return (
        <section className="bg-[var(--bg)] px-5 py-[clamp(56px,8vw,100px)]">
            <div className="mx-auto max-w-[1200px]">
                <div className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--bg2)] px-5 py-[clamp(40px,6vw,88px)] text-center shadow-[var(--shadow2)] sm:px-8 md:px-12">

                    {/* Dot-grid texture layer */}
                    <div
                        className="pointer-events-none absolute inset-0 z-0"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, var(--grid-r) 1px, transparent 0)',
                            backgroundSize: '24px 24px',
                        }}
                        aria-hidden="true"
                    />

                    {/* Corner viewfinder brackets */}
                    <span className="pointer-events-none absolute left-[clamp(16px,3vw,28px)] top-[clamp(16px,3vw,28px)] z-0 h-[clamp(22px,4vw,36px)] w-[clamp(22px,4vw,36px)] rounded-tl-lg border-l-[2.5px] border-t-[2.5px] border-[var(--qr-dot)] opacity-55" aria-hidden="true" />
                    <span className="pointer-events-none absolute right-[clamp(16px,3vw,28px)] top-[clamp(16px,3vw,28px)] z-0 h-[clamp(22px,4vw,36px)] w-[clamp(22px,4vw,36px)] rounded-tr-lg border-r-[2.5px] border-t-[2.5px] border-[var(--qr-dot)] opacity-55" aria-hidden="true" />
                    <span className="pointer-events-none absolute bottom-[clamp(16px,3vw,28px)] left-[clamp(16px,3vw,28px)] z-0 h-[clamp(22px,4vw,36px)] w-[clamp(22px,4vw,36px)] rounded-bl-lg border-b-[2.5px] border-l-[2.5px] border-[var(--qr-dot)] opacity-55" aria-hidden="true" />
                    <span className="pointer-events-none absolute bottom-[clamp(16px,3vw,28px)] right-[clamp(16px,3vw,28px)] z-0 h-[clamp(22px,4vw,36px)] w-[clamp(22px,4vw,36px)] rounded-br-lg border-b-[2.5px] border-r-[2.5px] border-[var(--qr-dot)] opacity-55" aria-hidden="true" />



                    <div className="relative z-10">
                        <p className="mb-5 inline-block rounded-full border border-[var(--border)] bg-[var(--accentlt)] px-3.5 py-1.5 text-[12.5px] font-semibold tracking-wide text-[var(--accent)]">
                            Ease of Business, one scan away
                        </p>

                        <h2 className="mx-auto mb-4 max-w-[620px] font-[var(--font-syne,sans-serif)] text-[clamp(28px,4.6vw,52px)]  leading-[1.08] tracking-[-0.02em] text-[var(--text)]">
                            Get more guests served,<br />for less effort.
                        </h2>

                        <p className="mx-auto mb-8 max-w-[460px] text-[clamp(14.5px,1.6vw,17px)] leading-[1.7] text-[var(--text2)]">
                            Join restaurants, cafés, and hotels already running their menu on Scanify.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-3">

                            <a

                                href="/login"
                                className="inline-flex w-full max-w-[260px] items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,var(--accent),var(--accent2))] px-6 py-3.5 text-[15px] font-semibold text-white no-underline shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--accent)_55%,transparent)] transition-shadow duration-200 hover:shadow-[0_10px_28px_-6px_color-mix(in_srgb,var(--accent)_65%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:scale-[0.98] sm:w-auto"
                            >
                                Start for free
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M3.5 8h9M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </a>
                            <a

                                href="#how"
                                className="inline-flex w-full max-w-[260px] items-center justify-center gap-2 rounded-xl border border-[var(--border2)] bg-transparent px-6 py-3.5 text-[15px] font-semibold text-[var(--text)] no-underline transition-colors duration-200 hover:border-[var(--border3)] hover:bg-[var(--hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:scale-[0.98] sm:w-auto"
                            >
                                Watch demo
                            </a>

                        </div>
                    </div>

                    <p className="mt-[18px] text-xs text-[var(--text3)]">
                        4-day free trial · No credit card required
                    </p>
                </div>


            </div >
        </section >
    );
}