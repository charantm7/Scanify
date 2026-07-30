"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

interface AppErrorFallbackProps {
    error?: Error;
    reset?: () => void;
}

export default function AppErrorFallback({
    error,
    reset,
}: AppErrorFallbackProps) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-sm">

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-7 w-7 text-red-600" />
                </div>

                <h2 className="text-xl font-semibold text-gray-900">
                    Something went wrong
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                    The application encountered an unexpected error.
                    Please try again or refresh the page.
                </p>

                {error?.message && (
                    <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3">
                        <p className="text-sm text-red-700 break-words">
                            {error.message}
                        </p>
                    </div>
                )}

                <div className="mt-6 flex gap-3">
                    {reset && (
                        <button
                            onClick={reset}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                        >
                            <RefreshCcw className="h-4 w-4" />
                            Try Again
                        </button>
                    )}

                    <button
                        onClick={() => window.location.reload()}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        </div>
    );
}