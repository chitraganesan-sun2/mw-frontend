// Self-contained (no imports) so the node unit tests can load it directly.

/**
 * The origin a redirect Location should point at: the origin the visitor actually used.
 *
 * - The scheme comes from the first x-forwarded-proto value (set by Vercel / any TLS-terminating
 *   proxy) when it is http or https, otherwise from the request URL itself - never forced to https.
 * - The host is the request's own (never x-forwarded-host, which a client could aim at another site).
 */
export function resolveRequestOrigin(input: {
    forwardedProto?: string | null;
    host?: string | null;
    nextUrlOrigin: string;
}): string {
    let fallback: URL;
    try {
        fallback = new URL(input.nextUrlOrigin);
    } catch {
        return input.nextUrlOrigin;
    }
    const proto = (input.forwardedProto || "").split(",")[0].trim().toLowerCase();
    const scheme = proto === "http" || proto === "https" ? proto : fallback.protocol.replace(":", "");
    const host = input.host && /^[a-z0-9.\-]+(:\d{1,5})?$/i.test(input.host.trim()) ? input.host.trim() : fallback.host;
    return `${scheme}://${host}`;
}
