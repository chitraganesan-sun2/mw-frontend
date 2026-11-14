"use client";
import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import { showToast } from "@/components/common/Toast";
import { isNativePlatform } from "@/utils/platform";
import { isBrowserNoise } from "@/utils/errorNoise";
import { isStartupQuiet } from "@/utils/startupQuiet";

/** One toast per this long, however many errors fire (a failing poll must not spam). */
const TOAST_COOLDOWN_MS = 30_000;
let lastToastAt = 0;
/** When this code was loaded, i.e. roughly when the app was launched. */
const STARTED_AT = Date.now();

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

interface ApiErrorLike {
    message?: string;
    status?: number;
}

const isApiErrorLike = (value: unknown): value is ApiErrorLike =>
    typeof value === "object" && value !== null && !(value instanceof Error) && typeof (value as ApiErrorLike).status === "number";

function notifyUser(reason?: unknown) {
    if (typeof document !== "undefined" && document.hidden) return;
    if (isStartupQuiet(isNativePlatform(), STARTED_AT, Date.now())) {
        // Nobody has tapped anything yet, so a toast would only worry them. Real Errors still reach Sentry (tagged,
        // so these are easy to find); API failures were already reported above.
        console.warn("[App] Error during startup (no toast shown):", reason);
        if (reason instanceof Error) {
            Sentry.captureException(reason, { tags: { source: "startup-quiet" } });
        }
        return;
    }
    const now = Date.now();
    if (now - lastToastAt < TOAST_COOLDOWN_MS) return;
    lastToastAt = now;
    showToast({ type: "error", message: GENERIC_MESSAGE });
}

/**
 * Last line of defence for errors nobody caught: unhandled promise rejections (a raw API call
 * with no .catch) and uncaught errors in event handlers. Sentry already hears about them, but
 * the user saw nothing and an API failure arrives as a plain {message,status} object, which
 * Sentry files as an unnamed "non-Error rejection" - so those are re-reported as real Errors.
 *
 * Deliberately quiet: 401 (the client already redirects to sign-in), 403 (already toasted),
 * offline (the network banner covers it) and other 4xx (a caller's business) stay silent; the
 * rest show one generic toast per 30 seconds.
 */
export default function useGlobalErrorReporting() {
    useEffect(() => {
        const onRejection = (event: PromiseRejectionEvent) => {
            const reason = event.reason;
            if (isBrowserNoise(reason)) return;
            if (isApiErrorLike(reason)) {
                const status = reason.status as number;
                if (status === 401 || status === 403) return;
                const serverSide = status >= 500;
                if (serverSide) {
                    Sentry.captureException(new Error(`Unhandled API error ${status}: ${reason.message || "unknown"}`), {
                        tags: { source: "unhandledrejection", kind: "api" },
                    });
                }
                if (serverSide && navigator.onLine) notifyUser(reason);
                return;
            }
            if (!(reason instanceof Error)) return; // already reported by Sentry's own handler
            notifyUser(reason);
        };

        const onError = (event: ErrorEvent) => {
            // Cross-origin "Script error." arrives with no Error object - nothing to act on.
            if (!(event.error instanceof Error) || isBrowserNoise(event.error)) return;
            notifyUser(event.error);
        };

        window.addEventListener("unhandledrejection", onRejection);
        window.addEventListener("error", onError);
        return () => {
            window.removeEventListener("unhandledrejection", onRejection);
            window.removeEventListener("error", onError);
        };
    }, []);
}
