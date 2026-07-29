"use client";

export default function PanelErrorFallback({ error }) {
    return (
        <div className="p-4 rounded-lg border border-red-300 bg-red-50">
            <h2 className="text-red-600 font-semibold">
                Panel crashed
            </h2>

            <p className="text-sm text-gray-700 mt-2">
                {error?.message || "Unknown error"}
            </p>
        </div>
    );
}