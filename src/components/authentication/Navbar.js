'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

export default function AuthNavbar() {

    const { theme, toggleTheme } = useTheme();

    return (
        <nav className={`fixed top-7 w-full z-50 transition-all duration-300 `}>
            <div className="md:w-[66%] md:mr-[21%] mx-auto px-7 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5 font-syne text-xl font-extrabold text-theme no-underline tracking-tight">
                    <Image
                        src="/scanify_logo.png"
                        alt="Logo"
                        width={50}
                        height={50}
                    />
                    Scanify
                </Link>
                <button onClick={toggleTheme}
                    className="w-[38px] h-[38px] rounded-[10px] border border-theme2 bg-card text-theme2 flex items-center justify-center hover:bg-theme3 transition-all">
                    {theme === 'dark' ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    )}
                </button>
            </div>
        </nav>
    )
}