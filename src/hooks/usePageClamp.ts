import { useEffect } from "react";
import { pageToClamp } from "@/utils/pagination";

/**
 * Safety net for paged lists: if the server reports matches (`total > 0`) but the current page
 * is empty, move to the last page that exists instead of showing a false "no results".
 * Pass `enabled: false` while the query is loading/fetching so stale data is never acted on.
 */
export function usePageClamp({
    page,
    size,
    total,
    itemCount,
    setPage,
    enabled = true,
}: {
    page: number;
    size: number;
    total: number | null | undefined;
    itemCount: number;
    setPage: (page: number) => void;
    enabled?: boolean;
}) {
    useEffect(() => {
        if (!enabled) return;
        const target = pageToClamp({ page, size, total, itemCount });
        if (target !== null && target !== page) setPage(target);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, page, size, total, itemCount]);
}
