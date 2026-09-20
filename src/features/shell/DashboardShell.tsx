'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Menu,
    Bell,
    Sun,
    Moon,
    Search,
    ArrowRight,
} from 'lucide-react';
import Sidebar, { Logo } from './Sidebar';
import { labelForPath } from './navigation';
import { AppProvider } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { NAV_GROUPS } from './navigation';


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
    const router = useRouter();

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    const searchItems = NAV_GROUPS.flatMap((group) =>
        group.items
            .filter((item) => item.href)
            .map((item) => ({
                label: item.label,
                href: item.href!,
                group: group.title,
                icon: item.icon,
            }))
    );

    const filteredItems = searchItems.filter((item) =>
        `${item.label} ${item.group}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setSearchOpen(true);
            }

            if (event.key === 'Escape') {
                setSearchOpen(false);
                setSearchQuery('');
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    function navigateToSearchResult(href: string) {
        setSearchOpen(false);
        setSearchQuery('');
        setSelectedIndex(0);
        router.push(href);
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;

            if (!target.closest('[data-search]')) {
                setSearchOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="min-h-screen grid-bg flex">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            {/* Main content */}
            <div className="flex-1 flex flex-col lg:ml-[240px] min-w-0">
                {/* Top bar */}
                <header
                    className="sticky top-0 z-20 h-[54px] flex items-center gap-4 px-4 sm:px-5 border-b flex-shrink-0"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-theme2 hover:text-theme rounded-md px-1.5 py-1 border border-[var(--border)] transition flex-shrink-0"
                            aria-label="Open menu"
                        >
                            <Menu size={20} />
                        </button>
                        <div className='lg:hidden'>
                            <Logo />
                        </div>
                    </div>

                    <div className="flex-1 max-w-xl hidden md:block">
                        <div className="flex-1 max-w-xl relative">
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="
                                    w-full
                                    h-9
                                    flex items-center
                                    gap-2.5
                                    px-3
                                    rounded-lg
                                    border
                                    text-left
                                    text-sm
                                    text-theme2
                                    hover:text-theme
                                    transition
                                "
                                style={{
                                    background: 'var(--bg)',
                                    borderColor: 'var(--border)',
                                }}
                            >
                                <Search
                                    size={14}
                                    className="flex-shrink-0 text-theme3"
                                />

                                <span className="truncate text-xs">
                                    Search menu items, QR codes, settings...
                                </span>

                                <span
                                    className="
                                        hidden sm:inline-flex
                                        ml-auto
                                        items-center
                                        px-1.5
                                        py-0.5
                                        rounded
                                        border
                                        text-[10px]
                                        text-theme3
                                    "
                                    style={{
                                        borderColor: 'var(--border2)',
                                    }}
                                >
                                    Ctrl K
                                </span>
                            </button>

                            {searchOpen && (
                                <div
                                    className="absolute top-11 left-0 right-0 z-50 rounded-xl border overflow-hidden"
                                    style={{
                                        background: 'var(--card)',
                                        borderColor: 'var(--border)',
                                        boxShadow: 'var(--shadow2)',
                                    }}
                                >
                                    <div
                                        className="flex items-center gap-2 px-3 h-11 border-b"
                                        style={{
                                            borderColor: 'var(--border)',
                                        }}
                                    >
                                        <Search
                                            size={15}
                                            className="text-theme3 flex-shrink-0"
                                        />

                                        <input
                                            autoFocus
                                            value={searchQuery}
                                            onChange={(event) => {
                                                setSearchQuery(event.target.value);
                                                setSelectedIndex(0);
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Escape') {
                                                    setSearchOpen(false);
                                                    setSearchQuery('');
                                                }

                                                if (event.key === 'ArrowDown') {
                                                    event.preventDefault();

                                                    setSelectedIndex((current) =>
                                                        Math.min(
                                                            current + 1,
                                                            filteredItems.length - 1
                                                        )
                                                    );
                                                }

                                                if (event.key === 'ArrowUp') {
                                                    event.preventDefault();

                                                    setSelectedIndex((current) =>
                                                        Math.max(current - 1, 0)
                                                    );
                                                }

                                                if (
                                                    event.key === 'Enter' &&
                                                    filteredItems[selectedIndex]
                                                ) {
                                                    navigateToSearchResult(
                                                        filteredItems[selectedIndex].href
                                                    );
                                                }
                                            }}
                                            placeholder="Search..."
                                            className="
                                                flex-1
                                                bg-transparent
                                                outline-none
                                                text-sm
                                                text-theme
                                                placeholder:text-theme3
                                            "
                                        />

                                        <kbd
                                            className="hidden sm:block text-[10px] px-1.5 py-0.5 rounded border text-theme3"
                                            style={{
                                                borderColor: 'var(--border)',
                                            }}
                                        >
                                            ESC
                                        </kbd>
                                    </div>

                                    <div className="max-h-80 overflow-y-auto p-1.5">
                                        {filteredItems.length > 0 ? (
                                            filteredItems.map((item, index) => {
                                                const Icon = item.icon;
                                                const selected = index === selectedIndex;

                                                return (
                                                    <button
                                                        key={item.href}
                                                        onClick={() =>
                                                            navigateToSearchResult(item.href)
                                                        }
                                                        className={`
                                                                w-full
                                                                flex items-center
                                                                gap-3
                                                                px-3 py-2.5
                                                                rounded-lg
                                                                text-left
                                                                transition
                                                                ${selected
                                                                ? 'bg-theme3'
                                                                : 'hover:bg-theme3'
                                                            }
                                                            `}
                                                    >
                                                        <div
                                                            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                                                            style={{
                                                                background: 'var(--accentlt)',
                                                                color: 'var(--accent)',
                                                            }}
                                                        >
                                                            <Icon size={14} />
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium text-theme">
                                                                {item.label}
                                                            </p>

                                                            <p className="text-[11px] text-theme3">
                                                                {item.group}
                                                            </p>
                                                        </div>

                                                        {selected && (
                                                            <ArrowRight
                                                                size={14}
                                                                className="text-theme3"
                                                            />
                                                        )}
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <div className="px-3 py-8 text-center">
                                                <Search
                                                    size={20}
                                                    className="mx-auto mb-2 text-theme3"
                                                />

                                                <p className="text-sm font-medium text-theme">
                                                    No results found
                                                </p>

                                                <p className="text-xs text-theme2 mt-1">
                                                    Try another search term.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="ml-auto flex gap-3 sm:gap-4 flex-shrink-0">
                        <button
                            className="w-9 h-8 rounded-lg border text-theme flex items-center justify-center hover:bg-theme3 transition-all"
                            style={{ borderColor: 'var(--border)' }}
                            aria-label="Notifications"
                        >
                            <Bell size={16} />
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="w-9 h-8 rounded-lg border text-theme flex items-center justify-center hover:bg-theme3 transition-all"
                            style={{ borderColor: 'var(--border)' }}
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Moon size={17} /> : <Sun size={17} />}

                        </button>

                        <div className="hidden sm:block px-3">
                            <button
                                className="
                                  w-full
                                  flex items-center
                                  gap-2
                                  px-2 py-1.5
                                  rounded-md
                                  border
                                  text-left
                                  transition
                                  hover:bg-theme3
                                "
                                style={{
                                    borderColor: 'var(--border)',
                                    background: 'var(--card)',
                                }}
                            >
                                <div
                                    className="
                                    w-5 h-5
                                    rounded-[4px]
                                    flex items-center justify-center
                                    flex-shrink-0
                                  "
                                    style={{
                                        background: 'var(--accent)',
                                        color: 'white',
                                    }}
                                >
                                    <span className="text-[10px] font-bold">V</span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium truncate">
                                        Vijayshree Chaats
                                    </p>
                                </div>

                            </button>
                        </div>
                    </div>


                </header>

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-6 max-w-full w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
