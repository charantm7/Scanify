import Link from 'next/link'
import Image from 'next/image'
import { FaLinkedin } from 'react-icons/fa'
import { SiGmail } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";


const footerCols = [
  {
    title: 'Product',
    links: [
      { label: 'How It Works', href: '#how' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Benefits', href: '#benefits' },
    ],
  },
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

export default function Footer() {
  return (
    <footer id="contact" className="bg-theme border-t border-theme pt-16 pb-9 px-7">
      <div className="max-w-[1360px] mx-auto">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-12 mb-12">

          <div className="sm:col-span-2 md:col-span-1">
            <Link href="#" className="inline-flex items-center gap-2 font-syne text-[17px] font-extrabold text-theme no-underline tracking-tight">
              <Image
                src="/scanify_logo.png"
                alt="Logo"
                width={50}
                height={50}
              />
              Scanify
            </Link>
            <p className="text-sm text-theme3 mt-3 leading-[1.65] max-w-[240px]">
              Smart, simple, cost-effective digital menus for modern restaurants and hotels.
            </p>
            <div className=" mt-5 flex items-center gap-6 text-theme2">

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
              <h5 className="text-xs font-bold tracking-[1px] uppercase text-theme3 mb-4">{col.title}</h5>
              <ul className="flex flex-col gap-2.5 list-none">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-theme2 no-underline transition-colors duration-200 hover:text-accent-t">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-theme flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-theme3">© 2025 Scanify. All rights reserved.</p>
          <p className="text-[13px] text-accent-t">Made with care for restaurants ♥</p>
        </div>
      </div>
    </footer>
  )
}
