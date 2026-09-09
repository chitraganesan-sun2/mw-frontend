import * as Sentry from "@sentry/capacitor";
import * as SentryReact from "@sentry/react";
import { isNativePlatform } from "@/utils/platform";

/**
 * Crash/error reporting for the frontend - previously nothing at all caught JS
 * exceptions, unhandled promise rejections, or (on native) actual app crashes;
 * the only signal was a bad Play Store review. Shares the backend's existing
 * Sentry project (by choice, to avoid managing a second one) - `environment` is
 * set explicitly so mobile/web frontend events stay filterable from backend
 * events in that shared project instead of blending together.
 *
 * @sentry/capacitor wraps @sentry/react: on native platforms it also installs
 * the underlying native Android/iOS SDKs (via `npx cap sync`) for real crash
 * capture outside the WebView's JS context, not just JS-layer errors. On web
 * it behaves as a plain @sentry/react setup.
 */
export const initSentry = () => {
    Sentry.init(
        {
            dsn: "https://787da0141334a28cf0259b60b40ffa1b@o4509625850658816.ingest.us.sentry.io/4509625854984192",
            environment: isNativePlatform() ? "mobile-native" : "mobile-web",
            release: `melodywings-frontend@${process.env.NEXT_PUBLIC_CURRENT_VERSION || "unknown"}`,
            // Request/response bodies, cookies, and IP can carry the same PII this
            // app's field-level encryption is meant to protect - don't forward it
            // by default, matching the backend's Sentry setup (main.py).
            sendDefaultPii: false,
            tracesSampleRate: 0.2,
            beforeBreadcrumb(breadcrumb) {
                // Strip the Authorization header value from any captured
                // fetch/XHR breadcrumbs - method/url/status stay, the JWT doesn't.
                if (breadcrumb.category === "fetch" || breadcrumb.category === "xhr") {
                    if (breadcrumb.data?.request_headers) {
                        delete breadcrumb.data.request_headers;
                    }
                }
                return breadcrumb;
            },
        },
        SentryReact.init
    );
};
