// No "use client" — this is a Server Component.
// There is no interactivity here; removing "use client" reduces JS sent to browser.

import Link from "next/link";
import UtilsNavbar from "../utils/Navbar";
import UtilsFooter from "../utils/Footer";

export default function LegalLayout({ title, lastUpdated, children }) {
    return (
        <div className="min-h-screen utils-bg utils-text-theme">

            <UtilsNavbar />

            {/* Page content */}
            <main className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-2 utils-text-theme">{title}</h1>

                {lastUpdated && (
                    <p className="text-sm utils-text-theme mb-8">
                        Last updated: {lastUpdated}
                    </p>
                )}

                <div className="space-y-10 leading-relaxed utils-text-theme">
                    {children}
                </div>
            </main>

            <UtilsFooter />
        </div>
    );
}