'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import { labelForPath } from './navigation';
import { AppProvider } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';

function ThemeIcon({ dark }) {
    return dark ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
        </svg>
    ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    );
}

/**
 * Chrome shared by every dashboard route. This used to be ConsoleShell, which
 * held the active tab in React state and swapped panels through a switch — so
 * every tab lived at the single /console URL and nothing was linkable or
 * refreshable. Each tab is now its own route and this is just the frame;
 * `children` is the routed page.
 *
 * AppProvider lives here rather than in each page so the session, plan limits
 * and menu list are fetched once per navigation session instead of once per
 * tab visit.
 */
export default function DashboardShell({ children }: { children: React.ReactNode }) {
    return (
        <AppProvider>
            <DashboardShellInner>{children}</DashboardShellInner>
        </AppProvider>
    );
}

function DashboardShellInner({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();

    const activeLabel = labelForPath(pathname);

    return (
        <div className="min-h-screen grid-bg flex">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            {/* Main content */}
            <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
                {/* Top bar */}
                <header
                    className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 sm:px-5 border-b flex-shrink-0"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-theme2 hover:text-theme transition flex-shrink-0"
                            aria-label="Open menu"
                        >
                            <Menu size={22} />
                        </button>
                        <h2 className="font-syne font-bold text-theme text-base sm:text-lg truncate">
                            {activeLabel}
                        </h2>
                    </div>

                    <div className="flex gap-2 sm:gap-4 flex-shrink-0">
                        <button
                            className="w-9 h-9 rounded-xl border text-theme2 flex items-center justify-center hover:bg-theme3 transition-all"
                            style={{ borderColor: 'var(--border)' }}
                            aria-label="Notifications"
                        >
                            <Bell size={16} />
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="w-9 h-9 rounded-xl border text-theme2 flex items-center justify-center hover:bg-theme3 transition-all"
                            style={{ borderColor: 'var(--border)' }}
                            aria-label="Toggle theme"
                        >
                            <ThemeIcon dark={theme === 'dark'} />
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
