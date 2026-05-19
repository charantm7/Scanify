"use client";

export default function GlobalError({ error, reset }) {
    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <h1 className="text-3xl font-bold">
                        Something went wrong
                    </h1>

                    <p className="mt-4">
                        {error?.message}
                    </p>

                    <button
                        onClick={() => reset()}
                        className="mt-4 px-4 py-2 border rounded"
                    >
                        Try Again
                    </button>
                </div>
            </body>
        </html>
    );
}