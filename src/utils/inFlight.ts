// Self-contained (no imports) so the node unit tests can load it directly.

/**
 * Re-entry guard for submit handlers. A `saving` React state is not enough: a fast double-click
 * (or a double Enter) fires the handler twice before the first re-render disables the button,
 * which created duplicate records / duplicate emails. This flag flips synchronously.
 *
 *   const guard = createInFlightGuard();
 *   guard.run(() => api.post(...))   // 2nd call while the 1st is pending resolves to `undefined`
 */
export function createInFlightGuard() {
    let busy = false;
    return {
        get busy() {
            return busy;
        },
        /** Runs `fn` unless one is already pending; resolves to `undefined` when skipped. */
        async run<T>(fn: () => Promise<T> | T): Promise<T | undefined> {
            if (busy) return undefined;
            busy = true;
            try {
                return await fn();
            } finally {
                busy = false;
            }
        },
    };
}
