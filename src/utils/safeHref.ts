/**
 * Returns `url` only if it is an absolute URL with a safe scheme, otherwise
 * `undefined`. Use this anywhere a URL that came from API data (resource curated
 * links, admin-managed tutorial links, demo links, ...) is about to become an
 * `href` or a `window.open` target — a `javascript:` / `data:` value there
 * executes in the app origin, and the auth cookie is readable from JS.
 */
const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

export function safeHref(url: unknown): string | undefined {
    if (typeof url !== "string") return undefined;
    const trimmed = url.trim();
    if (!trimmed) return undefined;
    let parsed: URL;
    try {
        parsed = new URL(trimmed);
    } catch {
        return undefined;
    }
    return SAFE_PROTOCOLS.has(parsed.protocol) ? parsed.href : undefined;
}

/**
 * Remote hosts next/image is allowed to load from. Keep in sync with
 * `images.remotePatterns` in next.config.mjs — next/image THROWS at render time
 * for any other host (and for non-http(s) values like `javascript:`), which
 * takes the whole page down into the error boundary.
 */
const IMAGE_HOSTS = new Set(["res.cloudinary.com"]);

/**
 * Returns `url` only if next/image can safely render it: an https URL on an
 * allowed host (see IMAGE_HOSTS) or a same-origin absolute path ("/foo.png").
 * Anything else (API data with a bad scheme, an unconfigured host, empty,
 * non-string) yields `undefined`, so callers can do
 * `src={safeImageSrc(url) || FallbackImg}` or skip the image entirely.
 */
export function safeImageSrc(url: unknown): string | undefined {
    if (typeof url !== "string") return undefined;
    const trimmed = url.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
    let parsed: URL;
    try {
        parsed = new URL(trimmed);
    } catch {
        return undefined;
    }
    if (parsed.protocol !== "https:") return undefined;
    return IMAGE_HOSTS.has(parsed.hostname) ? parsed.href : undefined;
}
