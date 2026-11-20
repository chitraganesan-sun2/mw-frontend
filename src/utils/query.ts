// Self-contained (no imports) so the node unit tests can load it directly.

/** Builds "?a=1&b=2" from the params that have a value (empty string when none). Values are encoded. */
export function buildQueryString(params: Record<string, string | number | boolean | null | undefined>): string {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === "") continue;
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
    return parts.length ? `?${parts.join("&")}` : "";
}
