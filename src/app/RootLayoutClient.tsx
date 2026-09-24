"use client";

import dynamic from "next/dynamic";
import * as SentryReact from "@sentry/react";
import QueryProvider from "@/providers/QueryWrapper";
import { Suspense, useEffect } from "react";
import useAutoLogout from "@/hooks/useAutoLogout";
import useMobileInit from "@/hooks/useMobileInit";
import { useRouter } from "next/navigation";
import RouteGuard from "@/components/guards/RouteGuard";
import NetworkStatus from "@/components/common/NetworkStatus";
import { initSentry } from "@/services/sentry";
import { captureUtmParams } from "@/utils/utm";

// Module scope, not component body - runs exactly once per page load rather
// than on every render.
initSentry();

const LottieLoader = dynamic(
    () => import("@/components/common/Loader/Lottie").then((m) => m.default),
    { ssr: false }
);

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    useAutoLogout(router);
    useMobileInit();

    useEffect(() => {
        captureUtmParams();
    }, []);

    return (
        <SentryReact.ErrorBoundary
            fallback={
                <div className="h-[100vh] w-[100vw] flex-center flex-col gap-2 text-center px-4">
                    <p className="text-lg font-medium">Something went wrong.</p>
                    <p className="text-sm text-gray-500">Please close and reopen the app.</p>
                </div>
            }
        >
            <a href="#main-content" className="skip-to-content">
                Skip to main content
            </a>
            <Suspense
                fallback={
                    <div className="h-[100vh] w-[100vw] flex-center">
                        <LottieLoader isLoading={true} />
                    </div>
                }
            >
                <NetworkStatus />
                <QueryProvider>
                    <RouteGuard>
                        <main id="main-content">{children}</main>
                    </RouteGuard>
                </QueryProvider>
            </Suspense>
        </SentryReact.ErrorBoundary>
    );
}