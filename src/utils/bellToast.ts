/**
 * Decides whether the header bell should pop its "new notification" toast.
 *
 * `prev` is the last count seen, or null before the FIRST real response. `current` is undefined
 * while the first response is still loading (the badge count then reads as 0, which must not be
 * taken as the baseline - the first real N > 0 would look like an increase and toast on every
 * page load).
 */
export function nextBellState(
    prev: number | null,
    current: number | undefined
): { prev: number | null; toast: boolean } {
    if (current === undefined) return { prev, toast: false };
    if (prev === null) return { prev: current, toast: false };
    return { prev: current, toast: current > prev };
}
