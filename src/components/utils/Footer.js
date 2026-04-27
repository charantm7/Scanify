'use client';

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { FaLinkedin } from 'react-icons/fa'
import { SiGmail } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";

export default function UtilsFooter() {
    const { theme } = useTheme();


    const footerCols = [

        {
            title: 'Company',
            links: [
                { label: 'About Us', href: '/about-us' },
                { label: 'Blog', href: '/blog' },
                { label: 'Careers', href: '/careers' },
            ],
        },
        {
            title: 'Support',
            links: [
                { label: 'Help Center', href: '/help' },
                { label: 'Contact Us', href: 'mailto:hello@scanify.co.in' },
                { label: 'Privacy Policy', href: 'privacy-policy' },
            ],
        },
        {
            title: 'Legal',
            links: [
                { label: 'Terms & Condition', href: '/terms-&-conditions' },
                { label: 'Cookies Policy', href: '/cookie-policy' },
                { label: 'Refund Policy', href: '/refund-policy' },
            ],
        },
    ]

    return (
        < footer id="contact" className="utils-bg border-t  border-neutral-200 dark:border-neutral-800 pt-5 pb-9 px-7" >
            <div className="max-w-[1360px] mx-auto">

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-12 mb-12">

                    <div className="sm:col-span-2 md:col-span-1">
                        <Link href="#" className="inline-flex items-center gap-2 font-syne text-[17px] font-extrabold utils-text-theme no-underline tracking-tight">
                            <Image
                                src={theme === "dark" ? "/scanify_logo_dark.png" : "/scanify_logo_light.png"}
                                alt="Logo"
                                width={40}
                                height={40}
                            />
                            Scanify
                        </Link>
                        <p className="text-sm utils-text-theme-2 mt-3 leading-[1.65] max-w-[240px]">
                            Smart, simple, cost-effective digital menus for modern restaurants and hotels.
                        </p>
                        <div className=" mt-5 flex items-center gap-4 text-neutral-500 dark:text-neutral-400">


                            <a href="https://www.linkedin.com/company/scanifycompany" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-white transition">
                                <FaLinkedin size={20} />
                            </a>

                            <a href="mailto:support@scanify.co.in" className="hover:text-neutral-900 dark:hover:text-white transition">
                                <SiGmail size={20} />
                            </a>

                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-white transition">
                                <FaXTwitter size={20} />
                            </a>
                        </div>
                    </div>

                    {footerCols.map((col) => (
                        <div key={col.title}>
                            <h5 className="text-xs font-bold tracking-[1px] uppercase mb-4">{col.title}</h5>
                            <ul className="flex flex-col gap-2.5 list-none">
                                {col.links.map((l) => (
                                    <li key={l.label}>
                                        <Link href={l.href} className="text-sm utils-text-theme-3 no-underline transition-colors duration-200 hover:text-neutral-700 dark:hover:text-white hover:underline">
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t  border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[13px] utils-text-theme-3">© 2025 Scanify. All rights reserved.</p>
                </div>
            </div>
        </footer >
    )
}