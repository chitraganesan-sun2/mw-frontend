/**
 * Cursor paging for GET /post/notifications/all (`?before=<id of the last loaded item>&size=N`).
 * Pure helpers, unit tested.
 */

export const NOTIFICATIONS_PAGE_SIZE = 20;

export interface CursorItem {
    notification_id?: string;
}

/** The `before` cursor for the next page: the last item's id, or undefined when the list is over
 * (a page shorter than `size` is the last one; an empty page or an item without an id ends it). */
export function nextNotificationCursor(items: CursorItem[] | undefined | null, size: number): string | undefined {
    if (!items || items.length === 0 || items.length < size) return undefined;
    return items[items.length - 1]?.notification_id || undefined;
}

/** Query string for one page. `before` is omitted on the first page. */
export function notificationsQuery({
    before,
    size = NOTIFICATIONS_PAGE_SIZE,
    includeRead = false,
}: {
    before?: string | null;
    size?: number;
    includeRead?: boolean;
}): string {
    const params = new URLSearchParams();
    if (before) params.set("before", before);
    params.set("size", String(size));
    params.set("include_read", includeRead ? "true" : "false");
    return params.toString();
}

/** An unknown `before` cursor comes back as 404 - that just means "no more", not an error. */
export function isEndOfList(err: unknown): boolean {
    return (err as { status?: number } | null)?.status === 404;
}

/** Label for a collapsed burst of chat messages ("3 messages"), or null for an ordinary item. */
export function messageCountLabel(count: unknown): string | null {
    const n = Number(count);
    return Number.isInteger(n) && n > 1 ? `${n} messages` : null;
}
