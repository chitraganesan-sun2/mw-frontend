// Self-contained (no imports) so the node unit tests can load it directly.

/** Matches the API's limit on a chat message (422 above this). */
export const MESSAGE_MAX_LENGTH = 5000;

/** Show a "n / max" counter only when the writer is getting close to the limit. */
export function messageCounterText(length: number, max: number = MESSAGE_MAX_LENGTH): string | null {
    return length >= Math.floor(max * 0.9) ? `${length} / ${max}` : null;
}
