/**
 * Pagination helpers shared by the filterable lists (no React, no path aliases - unit tested).
 */

/** URL params that hold a list's page number; a new search/filter must drop all of them. */
export const PAGE_PARAM_KEYS = ["page", "requests_page", "sessions_page"] as const;

/**
 * When the server says there are matches (`total > 0`) but the requested page came back
 * empty - the user was on page N and then searched/filtered/deleted down to fewer pages -
 * return the page to jump to (the last one that exists). Returns null when no jump is needed.
 */
export function pageToClamp({
    page,
    size,
    total,
    itemCount,
}: {
    page: number;
    size: number;
    total: number | null | undefined;
    itemCount: number;
}): number | null {
    const p = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
    const s = Number.isFinite(size) && size >= 1 ? Math.floor(size) : 1;
    const t = Number(total);
    if (!Number.isFinite(t) || t <= 0) return null;
    if (itemCount > 0) return null;
    const last = Math.max(1, Math.ceil(t / s));
    return p > last ? last : null;
}
