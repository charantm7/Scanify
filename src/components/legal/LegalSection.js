// LegalSection.js
// ─────────────────────────────────────────────────────────────────────────────
// WHEN TO USE THIS:
//   Use LegalSection if you want to write legal content directly as JSX
//   (e.g. hardcoding specific sections with custom UI, dynamic data, etc.)
//
// WHEN NOT TO USE THIS:
//   If you're rendering from a .md file using LegalRender, you do NOT need
//   LegalSection — LegalRender handles all heading and section rendering
//   automatically from markdown. Using both at the same time will cause
//   inconsistent styling.
//
// CURRENT SETUP (page.js) uses LegalRender (markdown-based), so LegalSection
// is not used. Keep this file for future use or remove it to avoid confusion.
// ─────────────────────────────────────────────────────────────────────────────

export default function LegalSection({ id, title, children }) {
    return (
        <section id={id} className="scroll-mt-24">
            <h2 className="text-xl font-semibold mb-3 text-theme">
                {title}
            </h2>

            <div className="space-y-4 text-neutral-400 text-[15px] leading-7">
                {children}
            </div>
        </section>
    );
}