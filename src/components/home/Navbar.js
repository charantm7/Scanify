'use client';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link'
import Image from 'next/image';
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

import { getSupabaseClient } from '@/lib/supabase/client';


export default function Navbar({ user: initialUser }) {

  const [user, setUser] = useState(initialUser)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { theme, toggleTheme } = useTheme();

  const supabase = getSupabaseClient();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => data.subscription.unsubscribe();
  }, []);



  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      const close = () => setMobileOpen(false)
      window.addEventListener('scroll', close, { passive: true })
      return () => window.removeEventListener('scroll', close)
    }
  }, [mobileOpen])

  async function handleSignOut() {
    setLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Logout failed");
      setLoading(false);
    } else {
      toast.success("Logged out");
      window.location.href = "/";
    }

  }

  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest(".profile-wrapper")) {
        setOpen(false);
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const navLinks = [
    { href: '#how', label: 'How It Works' },
    { href: '#benefits', label: 'Benefits' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#contact', label: 'Contact' },
    { href: '/blog', label: 'Blog' },
    { href: '/careers', label: 'Careers' },

  ]

  return (
    <div className="relative profile-wrapper">
      <Toaster position="top-center" />
      <div className="fixed top-3 left-0 right-0 z-50 w-full px-3  flex justify-center pointer-events-none">
        <nav className={`pointer-events-auto w-full max-w-[1360px] px-5 sm:px-5 py-1 rounded-full border border-white/10 backdrop-blur-xl shadow-lg transition-all z-50 duration-300 ${scrolled ? 'shadow-xl' : ''}`}
          style={{ background: scrolled ? 'var(--nav)' : 'var(--nav)' }}>
          <div className="h-14 flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2 font-syne font-base sm:text-lg font-extrabold text-theme no-underline tracking-wide flex-shrink-0">
              <Image
                loading="eager"
                src="/scanify_logo.png"
                alt="Logo"
                width={40}
                height={40}
              />
              Scanify
            </Link>

            <ul className="hidden md:flex items-center gap-3 list-none flex-1 justify-center">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm font-medium text-theme2 no-underline px-3 py-1.5 rounded-lg hover:text-theme hover:bg-theme3 transition-all duration-200">{l.label}</Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-5 flex-shrink-0 z-60">
              <button onClick={toggleTheme} aria-label="Toggle theme"
                className="w-9 h-9 rounded-[10px] border border-theme2 bg-card text-theme2 cursor-pointer flex items-center justify-center hover:bg-theme3 hover:text-theme transition-all duration-200">
                {theme === 'dark' ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                )}
              </button>

              {user ? (
                <>

                  <button
                    onClick={() => setOpen(!open)}
                    className="hidden w-9 h-9 rounded-full bg-[var(--accent)] text-white md:flex items-center justify-center"
                  >
                    {user.email?.[0].toUpperCase()}
                  </button>


                </>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:inline-flex px-4 py-2 text-sm rounded-full text-white bg-[var(--accent)] hover:bg-[var(--accent2)] transition"
                >
                  Get Started
                </Link>
              )}
              <button
                className="md:hidden w-9 h-9 rounded-[10px] border border-theme2 bg-card text-theme2 flex items-center justify-center hover:bg-theme3 transition-all duration-200 z-50"
                onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                {mobileOpen ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                )}
              </button>
            </div>
          </div>
        </nav>

        {mobileOpen && (
          <div className="md:hidden absolute top-[64px] left-0 right-0 flex justify-center z-50">
            <div
              className="w-[92%] max-w-5xl pointer-events-auto rounded-2xl border border-theme2 backdrop-blur-xl shadow-lg overflow-hidden"
              style={{ background: 'var(--card)' }}
            >
              <div className="px-3 py-3 flex flex-col gap-1">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-medium text-theme2 no-underline px-4 py-3 rounded-xl hover:text-theme hover:bg-theme3 transition-all duration-200"
                  >
                    {l.label}
                  </Link>
                ))}

                <div className="mt-1 pt-2 border-t border-theme">
                  {user ? (
                    <div className='flex gap-3'>
                      <Link
                        href="/console"
                        className="w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-white"
                        style={{ background: 'var(--accent)' }}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          handleSignOut();
                        }}
                        className="w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-white"
                        style={{ background: 'var(--accent)' }}
                      >
                        {signingOut ? 'Logging out…' : 'Logout'}
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block text-center px-4 py-3 rounded-xl text-sm font-semibold text-white no-underline"
                      style={{ background: 'var(--accent)' }}
                    >
                      Get Started
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      {open && (
        <div className="absolute right-5 mt-20 rounded-xl bg-[var(--card)] border border-theme shadow-lg p-2 z-50">

          <div className=" flex item-center gap-2 p-3 border-b border-theme">
            <User size={16} />
            <p className="text-sm font-semibold text-theme">
              {user.email}
            </p>
          </div>


          <div className="mt-2 flex flex-col gap-1">
            <div className='flex items-center hover:bg-[var(--hover)] rounded-lg px-3'>
              <LayoutDashboard size={15} />
              <Link
                href="/console"
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg text-sm hover:bg-theme3"
              >
                Dashboard
              </Link>
            </div>
            <div className='flex items-center hover:bg-[var(--hover)] rounded-lg px-3'>
              <LogOut size={15} />
              <button
                onClick={() => {
                  setOpen(false);
                  handleSignOut();
                }}
                className="px-3 py-2 rounded-lg text-sm"
              >
                Logout
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
