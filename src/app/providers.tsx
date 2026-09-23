'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * Defaults matter more than they look here: with the stock zero `staleTime`,
 * every mount of every query refetches, so leaving a tab and coming back
 * re-pays the full network cost for data that was correct a second ago.
 *
 * 60s of freshness covers the "click around the dashboard" case without ever
 * showing data old enough to matter, and `refetchOnWindowFocus: false` stops a
 * burst of refetches every time the owner alt-tabs back from their POS.
 */
function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60_000,
                gcTime: 5 * 60_000,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                retry: 1,
            },
        },
    });
}

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    const [queryClient] = useState(makeQueryClient);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
