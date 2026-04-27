'use client';

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

export default function UtilsNavbar() {

    const [mobileOpen, setMobileOpen] = useState(false)
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    

    const navLinks = [
        { href: '/about-us', label: 'About' },
        { href: '/blog', label: 'Blog' },
        { href: '/careers', label: 'Careers' },
        { href: '/help', label: 'Help' },
    ];
    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md utils-bg utils-border-b">

            <div className="max-w-[1100px] mx-auto px-8 h-[60px] flex items-center justify-between">

                {/* Logo */}
                <a href="/" className="flex items-center gap-3 font-syne text-base sm:text-lg font-extrabold utils-text-theme tracking-tight shrink-0">
                    <Image
                        src={theme === "dark" ? "/scanify_logo_dark.png" : "/scanify_logo_light.png"}
                        alt="Logo"
                        width={40}
                        height={40}
                    />
                    Scanify
                </a>

                <div className="hidden md:flex items-center gap-7 text-sm">
                    {navLinks.map((a) => {
                        const isActive = pathname === a.href;

                        return (
                            <Link
                                key={a.href}
                                href={a.href}
                                className={`transition-colors ${isActive
                                    ? "text-neutral-900 dark:text-white"
                                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                    }`}
                            >
                                {a.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Theme Toggle */}
                <div className="flex gap-4 items-center">
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className="w-9 h-9 rounded-xl utils-border utils-text-theme flex items-center justify-center utils-bg transition-all"
                    >
                        {theme === "dark" ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                        ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        )}
                    </button>
                    <button
                        className="md:hidden w-9 h-9 rounded-[10px] utils-border utils-text-theme text-theme2 flex items-center justify-center utils-bg transition-all duration-200 z-50"
                        onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                        {mobileOpen ? (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        ) : (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                        )}
                    </button>
                </div>

            </div>
            {mobileOpen && (
                <div className="md:hidden absolute top-[64px] left-0 right-0 flex justify-center z-50">
                    <div
                        className="w-[92%] max-w-5xl pointer-events-auto rounded-2xl border border-theme2 backdrop-blur-xl shadow-lg overflow-hidden utils-bg utils-text-theme"

                    >
                        <div className="px-3 py-3 flex flex-col gap-1">
                            {navLinks.map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="text-sm font-medium  no-underline px-4 py-3 rounded-xl hover:text-theme hover:bg-theme3 transition-all duration-200"
                                >
                                    {l.label}
                                </Link>
                            ))}


                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}