import { useMemo, useSyncExternalStore } from "react";

interface WindowSize {
    width: number;
    height: number;
}

function subscribe(onChange: () => void) {
    window.addEventListener("resize", onChange);
    return () => window.removeEventListener("resize", onChange);
}

// The server has no window, so it renders with 0. useSyncExternalStore uses the server
// snapshot while hydrating (so the first client render matches the server HTML) and then
// re-renders with the real size; components that mount later get the real size at once.
export function useWindowSize(): WindowSize {
    const width = useSyncExternalStore(subscribe, () => window.innerWidth, () => 0);
    const height = useSyncExternalStore(subscribe, () => window.innerHeight, () => 0);
    return useMemo(() => ({ width, height }), [width, height]);
}
