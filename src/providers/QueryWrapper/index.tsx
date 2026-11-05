"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "../ThemeProvider";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,   // 5 minutes — prevents redundant refetches on navigation
            gcTime: 10 * 60 * 1000,     // 10 minutes — cache retained longer before GC
            retry: false,
            refetchOnWindowFocus: false,
        },
    },
});

export default function QueryProvider ({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {/* NuqsAdapter is NOT here: it reads useSearchParams(), which forced the whole public site to
                render client-side only (empty HTML for search engines). It wraps the signed-in layout instead. */}
            <ThemeProvider>
                {children}
            </ThemeProvider>
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} buttonPosition='bottom-left' />
            )}
        </QueryClientProvider>
    );
}
