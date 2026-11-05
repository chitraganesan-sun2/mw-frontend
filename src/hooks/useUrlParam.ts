"use client";

import { useCallback, useSyncExternalStore } from "react";

const URL_PARAM_EVENT = "mw-url-param-change";

function readParam(key: string): string | null {
    return new URLSearchParams(window.location.search).get(key);
}

function subscribe(onChange: () => void) {
    window.addEventListener("popstate", onChange);
    window.addEventListener(URL_PARAM_EVENT, onChange);
    return () => {
        window.removeEventListener("popstate", onChange);
        window.removeEventListener(URL_PARAM_EVENT, onChange);
    };
}

/**
 * Reads/writes one URL query parameter without calling Next's useSearchParams().
 *
 * The public pages used nuqs' useQueryState, whose adapter calls useSearchParams(); that makes
 * Next fall back to client-side rendering for the whole page, so the server sent only the loading
 * spinner and search engines saw no content. This hook renders `null` on the server and during
 * hydration (identical to the old first render), then reads the real value on the client, and
 * keeps every instance in sync through a small window event. Same [value, setValue] shape as
 * useQueryState for plain string params.
 */
export function useUrlParam(key: string): [string | null, (value: string | null) => void] {
    const value = useSyncExternalStore(
        subscribe,
        () => readParam(key),
        () => null
    );

    const setValue = useCallback(
        (next: string | null) => {
            const url = new URL(window.location.href);
            if (next === null || next === "") url.searchParams.delete(key);
            else url.searchParams.set(key, next);
            window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
            window.dispatchEvent(new Event(URL_PARAM_EVENT));
        },
        [key]
    );

    return [value, setValue];
}
