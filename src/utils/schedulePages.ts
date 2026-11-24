/**
 * Paging helpers for the Schedule dashboard's session lists (pure, unit tested). The API caps a
 * page at 100 rows, so anything longer has to be fetched page by page.
 */

export interface SessionsPage<T> {
    items: T[];
    total: number;
}

/** One list from the pages loaded so far; a session that moved between pages is kept once. */
export function mergeSessionPages<T extends { session_id?: string }>(
    pages: SessionsPage<T>[] | undefined
): SessionsPage<T> {
    if (!pages || pages.length === 0) return { items: [], total: 0 };
    const seen = new Set<string>();
    const items: T[] = [];
    for (const page of pages) {
        for (const item of page.items) {
            const id = item.session_id;
            if (id) {
                if (seen.has(id)) continue;
                seen.add(id);
            }
            items.push(item);
        }
    }
    const lastTotal = pages[pages.length - 1].total;
    return { items, total: Math.max(lastTotal, items.length) };
}

/** The next 1-based page to request, or undefined when everything is loaded (or a page came back empty). */
export function nextSessionsPage<T>(pages: SessionsPage<T>[]): number | undefined {
    const last = pages[pages.length - 1];
    if (!last || last.items.length === 0) return undefined;
    const loaded = pages.reduce((n, p) => n + p.items.length, 0);
    return loaded < last.total ? pages.length + 1 : undefined;
}
