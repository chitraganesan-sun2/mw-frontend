"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Copies text to the clipboard and exposes a transient `copied` flag for
 * "Copied!" feedback UI. Falls back to a hidden textarea + execCommand when
 * the async Clipboard API is unavailable (e.g. insecure context, older
 * WebViews) instead of silently failing.
 */
export function useCopyToClipboard(resetAfterMs = 2000) {
    const [copied, setCopied] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const copy = useCallback(
        async (text: string) => {
            let succeeded = false;
            try {
                if (navigator?.clipboard?.writeText) {
                    await navigator.clipboard.writeText(text);
                    succeeded = true;
                } else {
                    throw new Error("Clipboard API unavailable");
                }
            } catch {
                try {
                    const textarea = document.createElement("textarea");
                    textarea.value = text;
                    textarea.style.position = "fixed";
                    textarea.style.opacity = "0";
                    document.body.appendChild(textarea);
                    textarea.focus();
                    textarea.select();
                    succeeded = document.execCommand("copy");
                    document.body.removeChild(textarea);
                } catch {
                    succeeded = false;
                }
            }

            if (succeeded) {
                setCopied(true);
                clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => setCopied(false), resetAfterMs);
            }

            return succeeded;
        },
        [resetAfterMs]
    );

    return { copied, copy };
}

export default useCopyToClipboard;
