"use client";

import { useCallback, useState } from "react";
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
    // One guard per component instance (lazy state initialiser: created once, never replaced).
    const [guard] = useState(createInFlightGuard);
    const [pending, setPending] = useState(false);

    const run = useCallback(async <T,>(fn: () => Promise<T> | T): Promise<T | undefined> => {
        if (guard.busy) return undefined;
        setPending(true);
        try {
            return await guard.run(fn);
        } finally {
            setPending(false);
        }
    }, [guard]);

    return { run, pending };
}

export default useInFlight;
