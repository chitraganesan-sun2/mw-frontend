/**
 * Errors that say nothing about whether the app is working, so the "Something went wrong" toast must not fire for them:
 *  - cancelled requests (AbortError) and layout-observer chatter,
 *  - cross-origin "Script error." with no detail and chunk-load noise,
 *  - React hydration mismatches: React discards the server HTML and redraws the page on the client by itself
 *    (the person sees a normal page); the error is still reported to Sentry, but a toast would only worry them.
 */
const NOISE_MESSAGE =
    /ResizeObserver loop|Script error\.?$|Load failed|Failed to fetch dynamically imported|Hydration failed|hydrat(e|ion) (error|mismatch)|There was an error while hydrating|Text content does not match server-rendered HTML|Minified React error #(418|419|422|423|425)\b/i;

export const isBrowserNoise = (reason: unknown): boolean => {
    const name = (reason as { name?: string } | null)?.name;
    const message =
        typeof reason === "string" ? reason : (reason as { message?: string } | null)?.message || "";
    return name === "AbortError" || NOISE_MESSAGE.test(message);
};
