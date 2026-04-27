"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ScrollButtons() {
    const [showTop, setShowTop] = useState(false);
    const [showBottom, setShowBottom] = useState(true);
    const pathname = usePathname();

    const isHome = pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const maxScroll =
                document.documentElement.scrollHeight - window.innerHeight;

            setShowTop(scrollY > 200);
            setShowBottom(scrollY < maxScroll - 200);
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () =>
        window.scrollTo({ top: 0, behavior: "smooth" });

    const scrollToBottom = () =>
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
        });

    const baseStyle =
        "w-10 h-10 rounded-full flex items-center justify-center shadow-md transition hover:scale-105";

    const themeStyle = isHome
        ? "bg-submit text-white hover:bg-orange-600"
        : "bg-neutral-900 text-white dark:bg-white dark:text-black";

    return (
        <div className="fixed right-6 bottom-6 flex flex-col gap-3 z-50">

            {showBottom && (
                <button
                    onClick={scrollToBottom}
                    className={`${baseStyle} ${themeStyle}`}
                >
                    ↓
                </button>
            )}

            {showTop && (
                <button
                    onClick={scrollToTop}
                    className={`${baseStyle} ${themeStyle}`}
                >
                    ↑
                </button>
            )}

        </div>
    );
}