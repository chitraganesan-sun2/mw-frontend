"use client";

import { useCallback, useRef, useState } from "react";
import { createInFlightGuard } from "@/utils/inFlight";

/**
 * Wraps an async submit handler so a second call while the first is pending is ignored
 * (synchronously, via a ref) and exposes `pending` to disable / show a spinner on the button.
 *
 *   const { run, pending } = useInFlight();
 *   const onSubmit = () => run(async () => { await POST_API(...); });
 *   <Button disabled={pending} loading={pending} />
 */
export function useInFlight() {
    const guardRef = useRef<ReturnType<typeof createInFlightGuard> | null>(null);
    if (!guardRef.current) guardRef.current = createInFlightGuard();
    const [pending, setPending] = useState(false);

    const run = useCallback(async <T,>(fn: () => Promise<T> | T): Promise<T | undefined> => {
        const guard = guardRef.current as ReturnType<typeof createInFlightGuard>;
        if (guard.busy) return undefined;
        setPending(true);
        try {
            return await guard.run(fn);
        } finally {
            setPending(false);
        }
    }, []);

    return { run, pending };
}

export default useInFlight;
