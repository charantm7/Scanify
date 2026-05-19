'use client';
import { useState, useEffect } from "react";
import UtilsNavbar from "./Navbar";
import UtilsFooter from "./Footer";

const categories = [
    {
        id: "getting-started",
        icon: "⬡",
        label: "Getting Started",
        color: "#38bdf8",
        bg: "#0c1e2a",
        articles: [
            { title: "How to create your Scanify account", views: "12.4k" },
            { title: "Setting up your first digital menu", views: "9.8k" },
            { title: "Generating and downloading your QR code", views: "8.1k" },
            { title: "Inviting team members to your dashboard", views: "3.2k" },
        ],
    },
    {
        id: "menu-management",
        icon: "⬢",
        label: "Menu Management",
        color: "#4ade80",
        bg: "#0b1c0f",
        articles: [
            { title: "Adding, editing, and deleting menu items", views: "11.2k" },
            { title: "Uploading photos to your menu", views: "7.6k" },
            { title: "Setting item availability in real time", views: "6.4k" },
            { title: "Organising items into categories and sections", views: "4.9k" },
        ],
    },
    {
        id: "orders",
        icon: "◈",
        label: "Orders & Payments",
        color: "#fb923c",
        bg: "#1c1209",
        articles: [
            { title: "How customer orders reach your dashboard", views: "10.1k" },
            { title: "Accepting and managing live orders", views: "7.3k" },
            { title: "Setting up payment collection via Razorpay", views: "6.8k" },
            { title: "Understanding your payout schedule", views: "3.1k" },
        ],
    },
    {
        id: "qr-codes",
        icon: "◉",
        label: "QR Codes",
        color: "#a78bfa",
        bg: "#130f1e",
        articles: [
            { title: "Customising your QR code design and branding", views: "5.4k" },
            { title: "Printing QR codes for tables", views: "4.9k" },
            { title: "Managing multiple QR codes for different areas", views: "3.7k" },
            { title: "Replacing a QR code without losing data", views: "2.3k" },
        ],
    },
    {
        id: "billing",
        icon: "◇",
        label: "Billing & Subscription",
        color: "#f9a8d4",
        bg: "#1a0f16",
        articles: [
            { title: "Understanding Scanify's pricing plans", views: "8.7k" },
            { title: "How to upgrade or downgrade your plan", views: "4.2k" },
            { title: "Downloading your invoices and receipts", views: "3.6k" },
            { title: "Cancelling your subscription", views: "2.8k" },
        ],
    },
    {
        id: "troubleshooting",
        icon: "◎",
        label: "Troubleshooting",
        color: "#fbbf24",
        bg: "#1a1509",
        articles: [
            { title: "QR code not scanning — what to do", views: "9.2k" },
            { title: "Menu not updating after changes", views: "6.1k" },
            { title: "Login issues and password reset", views: "5.7k" },
            { title: "Orders not appearing on the dashboard", views: "4.4k" },
        ],
    },
];

const allArticles = categories.flatMap((c) => c.articles.map((a) => ({ ...a, category: c.label, color: c.color })));

export default function HelpCenterPage() {
    const [query, setQuery] = useState("");
    const [popular, setPopular] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);

    const filtered = query.trim().length > 1
        ? allArticles.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase()))
        : [];

    useEffect(() => {
        const shuffled = [...allArticles]
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);

        setPopular(shuffled);
    }, []);

    const displayCategories = activeCategory ? categories.filter((c) => c.id === activeCategory) : categories;

    return (
        <div className="font-help utils-bg utils-text-theme min-h-screen" >


            <UtilsNavbar />

            {/* Hero / Search */}
            <section className="bg-gradient-to-b from-[#0d0d0d] to-[#060606] border-b border-neutral-800 px-8 pt-20 pb-16">

                <div className="max-w-[680px] mx-auto text-center">

                    {/* Status */}
                    <div className="mb-3 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-xs text-neutral-500 tracking-[0.06em]">
                            All systems operational
                        </span>
                    </div>

                    {/* Heading */}
                    <h1 className="font-semibold text-[clamp(32px,5vw,52px)] text-neutral-200 tracking-[-0.03em] leading-[1.1] mb-3">
                        How can we help?
                    </h1>

                    {/* Subtext */}
                    <p className="text-[15px] text-neutral-500 leading-relaxed mb-9">
                        Search our documentation or browse by topic below.
                    </p>

                    {/* Search */}
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                            ⌕
                        </span>

                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search articles, guides, troubleshooting…"
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-sm text-neutral-200 placeholder:text-neutral-500 outline-none focus:border-neutral-600 transition-colors"
                        />
                    </div>

                    {/* Search results */}
                    {filtered.length > 0 && (
                        <div className="mt-3 flex flex-col gap-1 text-left">

                            {filtered.map((a, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="flex items-center justify-between gap-4 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition"
                                >
                                    <div>
                                        <div className="text-sm font-medium text-neutral-200">
                                            {a.title}
                                        </div>
                                        <div className="text-xs text-neutral-500 mt-0.5">
                                            {a.category}
                                        </div>
                                    </div>

                                    <span className="text-sm text-neutral-600">
                                        →
                                    </span>
                                </a>
                            ))}

                        </div>
                    )}

                    {/* No results */}
                    {query.length > 1 && filtered.length === 0 && (
                        <div className="mt-3 p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-500">
                            No results for{" "}
                            <span className="text-neutral-300">{query}</span> — try a different search or browse below.
                        </div>
                    )}

                </div>

            </section>

            {/* Category pills */}
            <section className="max-w-[1120px] mx-auto px-8 pt-9">

                <div className="flex gap-2 flex-wrap">

                    {/* All topics */}
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 flex items-center gap-2
        ${activeCategory === null
                                ? "bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-900 dark:border-white"
                                : "border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10"
                            }`}
                    >
                        All topics
                    </button>

                    {/* Categories */}
                    {categories.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
                            className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 flex items-center gap-2
          ${activeCategory === c.id
                                    ? "bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-900 dark:border-white"
                                    : "border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10"
                                }`}
                        >
                            <span style={{ color: c.color }}>{c.icon}</span>
                            {c.label}
                        </button>
                    ))}

                </div>

            </section>

            {/* Category Cards */}
            <section className="max-w-[1120px] mx-auto px-8 pt-8">

                <div className="grid gap-3.5 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">

                    {displayCategories.map((cat) => (
                        <div
                            key={cat.id}
                            className="bg-white/80 dark:bg-black/80 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden"
                        >

                            {/* Header */}
                            <div className="px-5 pt-5 pb-4 flex items-center gap-3">

                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                                    style={{ background: cat.bg, color: cat.color }}
                                >
                                    {cat.icon}
                                </div>

                                <div>
                                    <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 tracking-[-0.01em]">
                                        {cat.label}
                                    </div>
                                    <div className="text-xs text-neutral-500 mt-0.5">
                                        {cat.articles.length} articles
                                    </div>
                                </div>

                            </div>

                            {/* Articles */}
                            {cat.articles.map((article, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="flex items-center justify-between px-5 py-3 text-sm border-t border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-white/10 transition"
                                >
                                    <span className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                        {article.title}
                                    </span>
                                    <span className="text-xs text-neutral-400 ml-3 shrink-0">
                                        {article.views}
                                    </span>
                                </a>
                            ))}

                            {/* Footer */}
                            <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800">
                                <a
                                    href="#"
                                    className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                >
                                    View all {cat.label} articles →
                                </a>
                            </div>

                        </div>
                    ))}

                </div>

            </section>

            {/* Popular Articles */}
            <section className="max-w-[1120px] mx-auto px-8 pt-14">

                <p className="text-[11px] text-neutral-600 dark:text-neutral-500 tracking-[0.1em] uppercase mb-5">
                    Most read this week
                </p>

                <div className="flex flex-col">

                    {popular.map((a, i) => (
                        <a
                            key={i}
                            href="#"
                            className={`flex items-center gap-4 px-5 py-3.5 border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/80 transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-white/10 ${i === 0 ? "rounded-t-xl" : ""} ${i === popular.length - 1 ? "rounded-b-xl" : ""} `}
                        >

                            {/* Index */}
                            <span className="text-xs font-semibold text-neutral-500 w-5 text-center shrink-0">
                                {String(i + 1).padStart(2, "0")}
                            </span>

                            {/* Title */}
                            <span className="text-sm text-neutral-600 dark:text-neutral-400 flex-1">
                                {a.title}
                            </span>

                            {/* Views */}
                            <span className="text-xs text-neutral-500 shrink-0">
                                {a.views} views
                            </span>

                        </a>
                    ))}

                </div>

            </section>

            {/* Contact */}
            <section className="max-w-[1120px] mx-auto px-8 pt-14 pb-24">

                <p className="text-[11px] text-neutral-600 dark:text-neutral-500 tracking-[0.1em] uppercase mb-5">
                    Still need help?
                </p>

                <div className="grid gap-3.5 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">

                    {[
                        {
                            icon: "✉",
                            title: "Email support",
                            desc: "Get help from a real person. We respond within a few hours on business days.",
                            action: "mailto:support@scanify.co.in",
                            label: "Send an email",
                        },
                        {
                            icon: "⊡",
                            title: "WhatsApp support",
                            desc: "Prefer a quick message? Reach our support team directly on WhatsApp.",
                            action: "https://wa.me/919999999999",
                            label: "Message on WhatsApp",
                        },
                        {
                            icon: "◱",
                            title: "Submit a request",
                            desc: "File a detailed support ticket and track its status from your dashboard.",
                            action: "#",
                            label: "Open a ticket",
                        },
                    ].map((c) => (
                        <div
                            key={c.title}
                            className="bg-white/80 dark:bg-black/80 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-white/10 hover:shadow-sm"
                        >

                            {/* Icon */}
                            <div className="text-xl text-neutral-600 dark:text-neutral-400 mb-3">
                                {c.icon}
                            </div>

                            {/* Title */}
                            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 tracking-[-0.01em] mb-2">
                                {c.title}
                            </div>

                            {/* Description */}
                            <div className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
                                {c.desc}
                            </div>

                            {/* CTA */}
                            <a
                                href={c.action}
                                className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors mt-auto"
                            >
                                {c.label} →
                            </a>

                        </div>
                    ))}

                </div>

            </section>

            <UtilsFooter />
        </div>
    );
}