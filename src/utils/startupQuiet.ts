/**
 * How long after launch the native app stays quiet about errors nobody caused.
 *
 * In the first moments of a launch no one has tapped anything, so a "Something went wrong" toast tells the person
 * nothing they can act on - it only worries them. Errors in that window are still reported to Sentry; they just
 * don't pop up. Anything that happens later (or on the web) is shown as before.
 */
export const STARTUP_QUIET_MS = 8000;

export const isStartupQuiet = (
    native: boolean,
    startedAt: number,
    now: number,
    windowMs: number = STARTUP_QUIET_MS,
): boolean => native && now >= startedAt && now - startedAt < windowMs;
