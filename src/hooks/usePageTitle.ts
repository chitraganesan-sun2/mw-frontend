"use client";
import { useEffect } from "react";

/**
 * Names the browser tab / history entry ("Settings | MelodyWings").
 *
 * Next resets <title> to the site default after a client-side navigation, and that can land AFTER a
 * component's own effect, so setting it once is not enough: a small observer puts it back whenever the
 * default is applied over it, until the page changes or unmounts.
 */
export function usePageTitle(title?: string | null) {
    useEffect(() => {
        if (!title) return;
        const wanted = `${title} | MelodyWings`;
        const apply = () => {
            if (document.title !== wanted) document.title = wanted;
        };
        apply();
        const observer = new MutationObserver(apply);
        observer.observe(document.head, { childList: true, subtree: true, characterData: true });
        return () => observer.disconnect();
    }, [title]);
}
