"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { POSTHOG_API_KEY, POSTHOG_HOST } from "@/definitions";
import { isNativePlatform } from "@/utils/platform";

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        // Skip PostHog on native platforms - use Firebase Analytics instead
        if (isNativePlatform()) return;

        if (typeof window !== "undefined" && !posthog.__loaded && POSTHOG_API_KEY) {
            posthog.init(POSTHOG_API_KEY, {
                api_host: POSTHOG_HOST,
                capture_pageview: false,
                // This app collects PII (onboarding, special-needs data, chat).
                // Don't let autocapture / session recording hoover up form text,
                // only build profiles for identified users, and strip query
                // strings (e.g. the OAuth ?code=) from any captured URL.
                autocapture: false,
                disable_session_recording: true,
                person_profiles: "identified_only",
                sanitize_properties: (props) => {
                    for (const key of ["$current_url", "$referrer", "$pathname"]) {
                        const val = props[key];
                        if (typeof val === "string") {
                            try {
                                const u = new URL(val);
                                props[key] = u.origin + u.pathname;
                            } catch {
                                /* leave non-URL strings as-is */
                            }
                        }
                    }
                    return props;
                },
            });
        }
    }, []);

    useEffect(() => {
        if (isNativePlatform()) return;
        posthog.capture("$pageview");
    }, [pathname]);

    return <>{children}</>;
}
