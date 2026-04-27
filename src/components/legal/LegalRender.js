"use client";
// react-markdown does client-side rendering, so this MUST be "use client".
// Without this, Next.js App Router will throw a hydration error because
// react-markdown uses browser APIs during render.

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Converts a heading string into a valid HTML id for anchor links.
 * e.g. "1. Definitions" → "1-definitions"
 */
function slugify(text) {
    return String(text)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")   // remove special chars except hyphens
        .trim()
        .replace(/\s+/g, "-");      // spaces → hyphens
}

export default function LegalRender({ content }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                h1: () => null,

                h2: ({ children }) => {
                    const id = slugify(children);
                    return (
                        <h2
                            id={id}
                            className="text-xl font-semibold mt-10 mb-3 text-neutral-900 dark:text-white scroll-mt-24"
                        >
                            {children}
                        </h2>
                    );
                },

                h3: ({ children }) => {
                    const id = slugify(children);
                    return (
                        <h3
                            id={id}
                            className="text-base font-semibold mt-6 mb-2 text-neutral-800 dark:text-neutral-200 scroll-mt-24"
                        >
                            {children}
                        </h3>
                    );
                },

                p: ({ children }) => (
                    <p className="text-neutral-600 dark:text-neutral-400 leading-7">
                        {children}
                    </p>
                ),

                ul: ({ children }) => (
                    <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                        {children}
                    </ul>
                ),

                ol: ({ children }) => (
                    <ol className="list-decimal pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                        {children}
                    </ol>
                ),

                li: ({ children }) => (
                    <li className="leading-7">{children}</li>
                ),

                strong: ({ children }) => (
                    <strong className="text-neutral-900 dark:text-white font-semibold">
                        {children}
                    </strong>
                ),

                em: ({ children }) => (
                    <em className="text-neutral-700 dark:text-neutral-300 italic">
                        {children}
                    </em>
                ),

                hr: () => (
                    <hr className="border-neutral-200 dark:border-neutral-800 my-8" />
                ),

                blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-neutral-300 dark:border-neutral-700 pl-4 py-1 my-4 text-neutral-600 dark:text-neutral-400 italic bg-neutral-100 dark:bg-neutral-900 rounded-r-md">
                        {children}
                    </blockquote>
                ),

                a: ({ href, children }) => (
                    <a
                        href={href}
                        className="text-neutral-700 dark:text-neutral-300 underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors"
                    >
                        {children}
                    </a>
                ),

                table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                        <table className="w-full text-sm text-neutral-600 dark:text-neutral-400 border-collapse">
                            {children}
                        </table>
                    </div>
                ),

                thead: ({ children }) => (
                    <thead className="border-b border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                        {children}
                    </thead>
                ),

                tbody: ({ children }) => (
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {children}
                    </tbody>
                ),

                tr: ({ children }) => (
                    <tr className="hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                        {children}
                    </tr>
                ),

                th: ({ children }) => (
                    <th className="text-left px-3 py-2 font-semibold text-neutral-800 dark:text-neutral-200">
                        {children}
                    </th>
                ),

                td: ({ children }) => (
                    <td className="px-3 py-2">{children}</td>
                ),

                code: ({ children }) => (
                    <code className="bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 rounded px-1 py-0.5 text-sm font-mono">
                        {children}
                    </code>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
}