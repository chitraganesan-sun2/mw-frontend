import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

const LABELS: Record<string, string> = {
    prev: "Previous page",
    next: "Next page",
    "jump-prev": "Previous 5 pages",
    "jump-next": "Next 5 pages",
};

/**
 * `itemRender` for an antd <Table pagination> / <Pagination>: the previous / next arrows are
 * icon-only, so give them an accessible name (F12). Page-number items already read as their number.
 */
export function antdPaginationItemRender(_page: number, type: string, originalElement: ReactNode): ReactNode {
    const label = LABELS[type];
    if (label && isValidElement(originalElement)) {
        return cloneElement(originalElement as ReactElement<{ "aria-label"?: string }>, { "aria-label": label });
    }
    return originalElement;
}
