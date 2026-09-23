/**
 * Shown the instant a dashboard tab is clicked, while the next route's RSC
 * payload is still in flight.
 *
 * Without a loading boundary here the App Router has nothing to paint during
 * that round trip, so the old tab stays on screen and the click reads as
 * "nothing happened" for as long as the server takes. It also lets Next
 * prefetch these routes on link hover — a dynamic route with no loading
 * boundary is not prefetchable at all.
 *
 * Deliberately not a spinner: a skeleton of the shape that is about to arrive
 * reads as faster than the same wait behind a spinner.
 */
export default function DashboardLoading() {
    return (
        <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Loading">
            <div
                className="h-24 rounded-2xl"
                style={{ background: 'var(--card)', border: '1.5px solid var(--border)' }}
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-24 rounded-2xl"
                        style={{ background: 'var(--card)', border: '1.5px solid var(--border)' }}
                    />
                ))}
            </div>

            <div
                className="h-64 rounded-2xl"
                style={{ background: 'var(--card)', border: '1.5px solid var(--border)' }}
            />
        </div>
    );
}
