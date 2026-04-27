'use client';

import { useState } from "react";
import UtilsNavbar from "./Navbar";
import UtilsFooter from "./Footer";

const categories = ["All", "Product", "Restaurant Tips", "Industry", "Engineering", "Company"];

const posts = [
    {
        id: 1,
        category: "Product",
        title: "Introducing real-time menu availability — update in seconds, not days",
        excerpt: "Restaurant menus change constantly. A dish sells out. A price goes up. A seasonal special goes live. We built real-time availability so your customers always see exactly what you have right now.",
        author: "Arjun Mehta",
        role: "Head of Product",
        date: "April 22, 2026",
        readTime: "4 min read",
        featured: true,
        initials: "AM",
    },
    {
        id: 2,
        category: "Restaurant Tips",
        title: "How Café Mirai increased average order value by 23% with better menu photography",
        excerpt: "Photos aren't decoration. For a digital menu, they're the difference between a customer ordering one dish or three. Here's exactly what Café Mirai changed — and what happened next.",
        author: "Priya Nair",
        role: "Customer Success",
        date: "April 18, 2026",
        readTime: "6 min read",
        featured: true,
        initials: "PN",
    },
    {
        id: 3,
        category: "Industry",
        title: "The paper menu is dying. Here's why that's actually great for restaurants.",
        excerpt: "Printing menus costs money. Updating them costs more. And yet thousands of restaurants still hand out laminated sheets every single day. The economics don't add up anymore.",
        author: "Rohan Desai",
        role: "CEO",
        date: "April 12, 2026",
        readTime: "5 min read",
        featured: false,
        initials: "RD",
    },
    {
        id: 4,
        category: "Engineering",
        title: "How we built our QR rendering engine to handle 10,000 scans per minute",
        excerpt: "When a restaurant runs a busy Saturday service, every table scans at the same time. Here's the technical architecture we built to handle it without breaking a sweat.",
        author: "Sneha Rao",
        role: "Engineering Lead",
        date: "April 8, 2026",
        readTime: "8 min read",
        featured: false,
        initials: "SR",
    },
    {
        id: 5,
        category: "Restaurant Tips",
        title: "5 things to fix on your digital menu before the weekend rush",
        excerpt: "Friday is coming. Your menu hasn't been updated in three weeks. Here are the five things that matter most — and how to fix them in under 20 minutes.",
        author: "Priya Nair",
        role: "Customer Success",
        date: "April 4, 2026",
        readTime: "3 min read",
        featured: false,
        initials: "PN",
    },
    {
        id: 6,
        category: "Company",
        title: "Scanify's first year: what we built, what we learned, what's next",
        excerpt: "One year ago we launched with three restaurants in Bangalore. Today we serve thousands across India. Here's an honest look at everything that happened in between.",
        author: "Rohan Desai",
        role: "CEO",
        date: "March 28, 2026",
        readTime: "9 min read",
        featured: false,
        initials: "RD",
    },
];

const colorMap = {
    Product: { bg: "#0f2027", color: "#38bdf8" },
    "Restaurant Tips": { bg: "#0f1f14", color: "#4ade80" },
    Industry: { bg: "#1c1209", color: "#fb923c" },
    Engineering: { bg: "#130f1e", color: "#a78bfa" },
    Company: { bg: "#1a0f0f", color: "#f87171" },
};

export default function BlogPage() {
    const [active, setActive] = useState("All");
    const featured = posts.filter((p) => p.featured);
    const all = active === "All" ? posts : posts.filter((p) => p.category === active);
    const rest = all.filter((p) => !p.featured || active !== "All");

    return (
        <div className="font-blog bg-white dark:bg-black text-neutral-900 dark:text-white min-h-screen" >

            <UtilsNavbar />


            <section className="max-w-[1160px] mx-auto px-6 sm:px-6 md:px-8 py-16 border-b border-neutral-200 dark:border-neutral-800">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">

                    {/* Left */}
                    <div>
                        <h1 className="font-serif text-[clamp(40px,6vw,64px)] text-neutral-900 dark:text-neutral-200 leading-[1.05] tracking-[-0.02em]">
                            The Scanify Blog
                        </h1>

                        <p className="text-base text-neutral-500 dark:text-neutral-400 mt-3 leading-relaxed">
                            Product updates, restaurant insights, and things we've learned along the way.
                        </p>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:max-w-[380px]">

                        <input
                            placeholder="your@email.com"
                            className="flex-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-500 focus:border-neutral-500 dark:focus:border-neutral-600 outline-none transition-colors"
                        />

                        <button className="bg-neutral-900 dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 transition">
                            Subscribe
                        </button>

                    </div>

                </div>

            </section>

            {/* Featured */}
            < section className="max-w-[1160px] mx-auto px-6 sm:px-6 md:px-8 pt-14">

                <p className="text-[11px] text-neutral-600 dark:text-neutral-500 tracking-[0.12em] uppercase mb-6">
                    Featured
                </p>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {featured.map((post) => {
                        const c = colorMap[post.category] || { bg: "#111", color: "#888" };

                        return (
                            <a
                                key={post.id}
                                href={`/blog/${post.id}`}
                                className="block bg-white/80 dark:bg-black/80 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700 hover:-translate-y-[2px]"
                            >

                                <div className="p-7 flex flex-col h-full">

                                    {/* Category */}
                                    <span
                                        className="text-[11px] px-2.5 py-1 rounded tracking-[0.05em] uppercase font-medium mb-5 w-fit"
                                        style={{ background: c.bg, color: c.color }}
                                    >
                                        {post.category}
                                    </span>

                                    {/* Title */}
                                    <h2 className="font-serif text-xl text-neutral-900 dark:text-neutral-200 leading-snug tracking-[-0.01em] mb-3 flex-1">
                                        {post.title}
                                    </h2>

                                    {/* Excerpt */}
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                                        {post.excerpt}
                                    </p>

                                    {/* Author */}
                                    <div className="flex items-center gap-2.5">

                                        <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-xs font-semibold text-neutral-500">
                                            {post.initials}
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                {post.author}
                                            </div>
                                            <div className="text-xs text-neutral-500">
                                                {post.date} · {post.readTime}
                                            </div>
                                        </div>

                                    </div>

                                </div>

                            </a>
                        );
                    })}
                </div>

            </section>

            {/* All Posts */}
            <section className="max-w-[1160px] mx-auto px-6 sm:px-6 md:px-8 pt-14 pb-24">

                {/* Header */}
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">

                    <p className="text-[11px] text-neutral-600 dark:text-neutral-500 tracking-[0.12em] uppercase">
                        All posts
                    </p>

                    <div className="flex gap-1.5 flex-wrap">
                        {categories.map((c) => (
                            <button
                                key={c}
                                onClick={() => setActive(c)}
                                className={`px-3 py-1 text-xs rounded-md border transition-all duration-200 ${active === c
                                    ? "bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-900 dark:border-white"
                                    : "border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10"
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                </div>

                {/* Posts */}
                <div className="flex flex-col">

                    {rest.map((post, i) => {
                        const c = colorMap[post.category] || { bg: "#111", color: "#888" };

                        return (
                            <a
                                key={post.id}
                                href={`/blog/${post.id}`}
                                className={`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 px-4 sm:px-6 py-4 sm:py-5 border border-neutral-200 dark:border-neutral-800 transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-white/10 ${i === 0 ? "rounded-t-xl" : ""} ${i === rest.length - 1 ? "rounded-b-xl" : ""} `}
                            >

                                {/* Category */}
                                <span
                                    className="text-[10px] px-2 py-1 rounded uppercase tracking-[0.05em] font-medium min-w-[80px] sm:min-w-[100px] text-center"
                                    style={{ background: c.bg, color: c.color }}
                                >
                                    {post.category}
                                </span>

                                {/* Title */}
                                <div className="flex-1 min-w-[200px]">
                                    <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-300 tracking-[-0.01em] leading-snug">
                                        {post.title}
                                    </h3>
                                </div>

                                {/* Right */}
                                <div className="flex items-center gap-2 sm:gap-3 shrink-0">

                                    {/* Avatar */}
                                    <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-xs font-semibold text-neutral-500">
                                        {post.initials}
                                    </div>

                                    <div>
                                        <div className="text-xs text-neutral-600 dark:text-neutral-400">
                                            {post.author}
                                        </div>
                                        <div className="text-[11px] text-neutral-500">
                                            {post.readTime}
                                        </div>
                                    </div>

                                    <span className="text-sm text-neutral-500 ml-3">
                                        →
                                    </span>

                                </div>

                            </a>
                        );
                    })}

                </div>

            </section>
            <UtilsFooter />
        </div >
    );
}