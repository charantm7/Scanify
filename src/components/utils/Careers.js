'use client';

import { useState } from "react";
import UtilsNavbar from "./Navbar";
import UtilsFooter from "./Footer";



const departments = ["All", "Engineering", "Design", "Operations", "Sales", "Support"];

const jobs = [
    {
        id: 1,
        title: "Senior Full-Stack Engineer",
        department: "Engineering",
        location: "Bangalore, India",
        type: "Full-time",
        experience: "4–7 years",
        description:
            "Own and scale the core Scanify platform. Work across our Next.js frontend and Node.js backend to ship features used by thousands of restaurants every day.",
        tags: ["Next.js", "Node.js", "PostgreSQL", "AWS"],
    },
    {
        id: 2,
        title: "Product Designer",
        department: "Design",
        location: "Bangalore / Remote",
        type: "Full-time",
        experience: "3–5 years",
        description:
            "Design end-to-end product experiences for restaurant owners and their customers. You'll own everything from research to shipped pixels.",
        tags: ["Figma", "UX Research", "Prototyping", "Design Systems"],
    },
    {
        id: 3,
        title: "DevOps Engineer",
        department: "Engineering",
        location: "Bangalore, India",
        type: "Full-time",
        experience: "3–6 years",
        description:
            "Build and maintain the infrastructure that keeps Scanify online and fast. Own our CI/CD pipelines, monitoring stack, and cloud architecture.",
        tags: ["AWS", "Docker", "Kubernetes", "Terraform"],
    },
    {
        id: 4,
        title: "Restaurant Partnerships Manager",
        department: "Sales",
        location: "Mumbai, India",
        type: "Full-time",
        experience: "2–5 years",
        description:
            "Build relationships with restaurants and food businesses across your city. Help them get onboarded and see real value from Scanify.",
        tags: ["Sales", "Onboarding", "CRM", "F&B Industry"],
    },
    {
        id: 5,
        title: "Customer Support Specialist",
        department: "Support",
        location: "Remote, India",
        type: "Full-time",
        experience: "1–3 years",
        description:
            "Be the first line of help for our restaurant partners. Resolve issues quickly, document feedback, and help shape the product through what you learn.",
        tags: ["Customer Support", "Troubleshooting", "Documentation"],
    },
    {
        id: 6,
        title: "Operations Associate",
        department: "Operations",
        location: "Bangalore, India",
        type: "Full-time",
        experience: "1–3 years",
        description:
            "Keep the business running smoothly. Manage vendor relationships, internal processes, and cross-team coordination across a fast-growing team.",
        tags: ["Operations", "Coordination", "Process Design"],
    },
];

const perks = [
    { icon: "◈", title: "Remote-friendly", desc: "Most roles support hybrid or fully remote work across India." },
    { icon: "◉", title: "Equity", desc: "Early-stage equity so you share in what you help build." },
    { icon: "◎", title: "Health insurance", desc: "Full medical coverage for you and your immediate family." },
    { icon: "◆", title: "Learning budget", desc: "₹50,000 annually for courses, books, and conferences." },
    { icon: "◇", title: "Flexible hours", desc: "Own your schedule. We care about output, not clock-in times." },
    { icon: "○", title: "Annual retreats", desc: "Whole-team offsite once a year. Good food guaranteed." },
];

export default function CareersPage() {
    const [active, setActive] = useState("All");
    const [selected, setSelected] = useState(null);



    const filtered = active === "All" ? jobs : jobs.filter((j) => j.department === active);

    return (
        <div className="font-career utils-bg utils-text-theme min-h-screen">

            <UtilsNavbar />


            <section className="max-w-[1100px] mx-auto px-8 pt-24 pb-20">

                <div className="flex items-center gap-1.5 mb-6">
                    <span className="w-[6px] h-[6px] rounded-full bg-green-500 inline-block"></span>
                    <span className="text-[13px] text-neutral-500 tracking-[0.06em] uppercase">
                        We're hiring
                    </span>
                </div>

                <h1 className="font-serif text-[clamp(48px,7vw,80px)] leading-[1.05] utils-text-theme mb-6 tracking-[-0.02em] max-w-[700px]">
                    Build the future of <br />
                    <em className="utils-text-theme-3">restaurant tech.</em>
                </h1>

                <p className="font-inter text-[17px] text-neutral-500 max-w-[520px] leading-[1.7] mb-10">
                    We're a small, focused team building software that helps thousands of restaurants across India serve their customers better.
                </p>

                <div className="flex gap-8">
                    {[["0", "Open roles"], ["2", "Cities"], ["~3", "Team size"]].map(([n, l]) => (
                        <div key={l}>
                            <div className="font-serif text-4xl utils-text-theme leading-none">{n}</div>
                            <div className="text-[13px] text-neutral-600 mt-1">{l}</div>
                        </div>
                    ))}
                </div>

            </section>

            <hr className="divider-soft" />


            <section className="max-w-[1100px] mx-auto px-8 py-20">

                <p className="text-xs utils-text-theme tracking-[0.1em] uppercase mb-10">
                    Why Scanify
                </p>

                <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
                    {perks.map((p) => (
                        <div key={p.title} className="utils-bg-card utils-border-2 shadow-[0_1px_2px_rgba(0,0,0,0.08)] rounded-xl p-5">

                            <div className="text-xl mb-3 utils-text-theme">{p.icon}</div>

                            <div className="text-[15px] font-medium utils-text-theme mb-2">
                                {p.title}
                            </div>

                            <div className="text-sm text-neutral-500 leading-[1.6]">
                                {p.desc}
                            </div>

                        </div>
                    ))}
                </div>

            </section>

            <hr className="divider-soft" />

            {/* Jobs */}
            <section className="max-w-[1100px] mx-auto px-8 pb-24 pt-16">

                <div className="flex justify-between items-start mb-10 flex-wrap gap-5">

                    <p className="text-xs utils-text-theme tracking-[0.1em] uppercase">
                        Open positions
                    </p>

                    <div className="flex gap-2 flex-wrap">
                        {departments.map((d) => (
                            <button
                                key={d}
                                onClick={() => setActive(d)}
                                className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${active === d
                                    ? "utils-text-theme utils-border-high bg-white/5 dark:bg-white/10"
                                    : "utils-text-theme-2 utils-border-low hover:utils-text-theme hover:border-neutral-500"
                                    }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>

                </div>

                <div className="flex flex-col gap-3">
                    {filtered.map((job) => (
                        <div
                            key={job.id}
                            onClick={() => setSelected(selected === job.id ? null : job.id)}
                            className="rounded-xl p-5 utils-bg-card utils-border-2 cursor-pointer transition-all duration-200 hover:utils-hover"
                        >

                            <div className="flex justify-between gap-4">

                                <div className="flex-1">

                                    <div className="flex gap-2 mb-2 flex-wrap">
                                        <span className="text-xs px-2 py-1 utils-hover rounded">{job.department}</span>
                                        <span className="text-xs px-2 py-1 utils-hover rounded">{job.type}</span>
                                        <span className="text-xs px-2 py-1 utils-hover rounded">{job.location}</span>
                                    </div>

                                    <h3 className="text-lg utils-text-theme tracking-[-0.01em]">
                                        {job.title}
                                    </h3>

                                    <p className="text-xs text-neutral-600 mt-1">
                                        {job.experience} experience
                                    </p>

                                </div>

                                <div className="text-xl text-neutral-500">
                                    {selected === job.id ? "−" : "+"}
                                </div>

                            </div>

                            {selected === job.id && (
                                <div className="mt-6 pt-6 border-t border-neutral-800">

                                    <p className="utils-text-theme leading-[1.7] mb-5">
                                        {job.description}
                                    </p>

                                    <div className="flex gap-2 flex-wrap mb-6">
                                        {job.tags.map((t) => (
                                            <span key={t} className="text-xs px-2 py-1 border border-neutral-700 rounded utils-text-theme">
                                                {t}
                                            </span>
                                        ))}
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.location.href = `mailto:careers@scanify.co.in?subject=Application: ${job.title}`;
                                        }}
                                        className="text-sm utils-text-theme underline underline-offset-4 hover:text-neutral-500"
                                    >
                                        Apply for this role →
                                    </button>

                                </div>
                            )}

                        </div>
                    ))}
                </div>

            </section>


            <UtilsFooter />
        </div>
    );
}