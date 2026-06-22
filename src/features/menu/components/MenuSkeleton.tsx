// features/menu/components/MenuSkeleton.tsx
"use client";

// Simple classname helper — no external dependency needed
function cls(...classes: (string | undefined | false)[]) {
    return classes.filter(Boolean).join(" ");
}

function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <div
            className={cls("animate-pulse rounded-lg", className)}
            style={{ background: "var(--color-border)", ...style }}
        />
    );
}

export function HeroSkeleton() {
    return (
        <header className="px-5 pt-0 pb-6 border-b" style={{ borderColor: "var(--color-border)" }}>
            {/* Cover image placeholder */}
            <Bone className="w-full h-44 mb-0" style={{ borderRadius: 0 }} />

            <div className="max-w-[680px] mx-auto pt-5">
                {/* Logo + name */}
                <div className="flex items-start gap-4 mb-5">
                    <Bone className="w-[60px] h-[60px] rounded-2xl flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                        <Bone className="h-6 w-3/5" />
                        <Bone className="h-4 w-4/5" />
                        <Bone className="h-3 w-2/5" />
                    </div>
                </div>

                {/* Rating / tags */}
                <div className="flex gap-2 mb-4">
                    <Bone className="h-6 w-20 rounded-full" />
                    <Bone className="h-6 w-16 rounded-full" />
                    <Bone className="h-6 w-24 rounded-full" />
                </div>

                {/* Search */}
                <Bone className="h-11 w-full rounded-2xl" />
            </div>
        </header>
    );
}

export function CategoryNavSkeleton() {
    return (
        <div
            className="sticky top-0 z-20 py-3 px-5 border-b overflow-hidden"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
            <div className="flex gap-2 max-w-[680px] mx-auto">
                {[80, 100, 70, 90, 85].map((w, i) => (
                    <Bone key={i} className="h-8 rounded-full flex-shrink-0" style={{ width: w }} />
                ))}
            </div>
        </div>
    );
}

export function ItemCardSkeleton() {
    return (
        <div
            className="flex items-start gap-4 p-4 rounded-2xl border"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
            <Bone className="w-[78px] h-[78px] rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2 py-0.5">
                <div className="flex gap-2 items-center">
                    <Bone className="w-4 h-4 rounded-sm flex-shrink-0" />
                    <Bone className="h-4 w-3/5" />
                </div>
                <Bone className="h-3 w-full" />
                <Bone className="h-3 w-4/5" />
                <div className="flex justify-between pt-1">
                    <Bone className="h-5 w-14" />
                    <Bone className="h-5 w-16 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export function CategorySectionSkeleton() {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3">
                <Bone className="h-5 w-28" />
                <Bone className="h-5 w-8 rounded-full" />
                <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                    <ItemCardSkeleton key={i} />
                ))}
            </div>
        </section>
    );
}

export function MenuPageSkeleton() {
    return (
        <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
            <HeroSkeleton />
            <CategoryNavSkeleton />
            <main className="max-w-[680px] mx-auto px-5 pb-24 pt-7 space-y-10">
                <CategorySectionSkeleton />
                <CategorySectionSkeleton />
            </main>
        </div>
    );
}