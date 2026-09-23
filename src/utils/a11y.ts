import type { KeyboardEvent } from "react";

/**
 * For a `role="button"` element that can't be a real `<button>` (it contains its own
 * nested interactive content, e.g. a link - HTML disallows interactive-in-interactive
 * nesting), this wires up the same Enter/Space activation a real button gets for free.
 * Prefer an actual `<button>` wherever the content allows it; reach for this only when
 * it doesn't.
 */
export function onEnterOrSpace(handler: () => void) {
    return (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handler();
        }
    };
}
