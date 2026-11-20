// Self-contained (no imports) so the node unit tests can load it directly.

export const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
/** How long the lastActivity cookie lives. Must be >= the session itself (1 day), NOT the idle
 *  timeout: a cookie that expires after 30 minutes disappears exactly when it should trigger. */
export const LAST_ACTIVITY_COOKIE_DAYS = 1;

/**
 * True when the stored last-activity timestamp (ms since epoch, as a string) is older than the
 * timeout. A missing or unparsable value is NOT treated as expired - the caller seeds a fresh one.
 */
export function isIdleExpired(
    lastActivity: string | undefined | null,
    now: number,
    timeoutMs: number = INACTIVITY_TIMEOUT_MS
): boolean {
    if (!lastActivity) return false;
    const last = Number.parseInt(lastActivity, 10);
    if (!Number.isFinite(last)) return false;
    return now - last > timeoutMs;
}
