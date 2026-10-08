"use client";

import { useEffect } from "react";
import { showToast } from "@/components/common/Toast";

/**
 * Shown once after an automatic sign-out (inactivity timeout or an expired/invalid token),
 * which both redirect to "/?session=expired". Before this, users were silently dropped on
 * the homepage with no explanation. Strips the param so a refresh doesn't repeat it.
 *
 * Reads window.location directly on mount: this is mounted in the root layout, where
 * useSearchParams() didn't reflect the query on the statically rendered landing page.
 */
// Module-level, not effect cleanup: React StrictMode (dev) runs this effect twice, and the
// second run no longer sees the param the first one already stripped.
let noticeScheduled = false;

export default function SessionExpiredNotice() {
    useEffect(() => {
        const url = new URL(window.location.href);
        if (noticeScheduled || url.searchParams.get("session") !== "expired") return;
        noticeScheduled = true;
        url.searchParams.delete("session");
        window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
        // Deferred: this mounts before the Toaster (inside QueryProvider) subscribes, and a
        // toast fired in that window never rendered.
        setTimeout(() => {
            showToast({ type: "info", message: "You were logged out because your session expired. Please log in again." });
            noticeScheduled = false;
        }, 500);
    }, []);

    return null;
}
