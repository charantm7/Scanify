'use client';

import { useEffect, useState } from 'react';
import { Menu, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Sidebar, { NAV_ITEMS } from './Sidebar';
import DashboardPanel from './panels/DashboardPanel';
import MenuPanel from './panels/MenuPanel';
import QRPanel from './panels/QrPanel';
import AnalyticsPanel from './panels/AnalyticsPanel';
import SettingsPanel from './panels/SettingsPanel';
import { getSupabaseClient } from '@/lib/supabase/client';
import { AppProvider } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';

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

function ConsoleLoader() {
    return (
        <div className="min-h-screen grid-bg flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                    <Loader2 size={28} color="white" className="animate-spin" />
                </div>
                <p className="text-theme2 text-sm font-medium">Loading your console…</p>
            </div>
        </div>
    );
}

function ConsoleError({ error }) {
    return (
        <div className="min-h-screen grid-bg flex items-center justify-center p-6">
            <div className="max-w-sm text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#fef2f2' }}>
                    <AlertTriangle size={28} color="#dc2626" />
                </div>
                <h2 className="font-syne font-bold text-xl text-theme mb-2">Something went wrong</h2>
                <p className="text-sm text-theme2 mb-5">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition"
                    style={{ background: 'var(--accent)' }}
                >
                    <RefreshCw size={14} /> Reload
                </button>
            </div>
        </div>
    );
}

function Panel({ id, onNavigate }) {
    switch (id) {
        case 'dashboard': return <DashboardPanel onNavigate={onNavigate} />;
        case 'menu': return <MenuPanel />;
        case 'qr-codes': return <QRPanel />;
        case 'analytics': return <AnalyticsPanel />;
        case 'settings': return <SettingsPanel />;
        default: return (
            <div className="text-center py-20 text-theme2">
                <p className="font-syne font-bold text-xl text-theme mb-2">Coming Soon</p>
                <p>This feature is under development.</p>
            </div>
        );
    }
}


export default function ConsoleShell() {
    return (
        <AppProvider>
            <ConsoleShellInner />
        </AppProvider>
    );
}


function ConsoleShellInner() {

    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [error, setError] = useState(null)

    const { theme, toggleTheme } = useTheme();
    const { loading } = useApp()


    if (loading) return <ConsoleLoader />;
    if (error) return <ConsoleError error={error} />;

    const activeLabel = NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? '';

    return (
        <div className="min-h-screen grid-bg flex">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3500,
                    style: { background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)' },
                }}
            />

            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                open={sidebarOpen}
                setOpen={setSidebarOpen}
            />

            {/* Main content */}
            <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
                {/* Top bar */}
                <header
                    className="sticky top-0 z-20 h-16 flex items-center justify-between px-5 border-b flex-shrink-0"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                >
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-theme2 hover:text-theme transition"
                            aria-label="Open menu"
                        >
                            <Menu size={22} />
                        </button>
                        <h2 className="font-syne font-bold text-theme text-lg">{activeLabel}</h2>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="w-9 h-9 rounded-xl border text-theme2 flex items-center justify-center hover:bg-theme3 transition-all"
                        style={{ borderColor: 'var(--border)' }}
                        aria-label="Toggle theme"
                    >
                        <ThemeIcon dark={theme === 'dark'} />
                    </button>
                </header>

                {/* Page content */}
                <main className="flex-1 p-5 sm:p-6 max-w-5xl w-full mx-auto">
                    <Panel id={activeTab} onNavigate={setActiveTab} />
                </main>
            </div>
        </div>
    );
}