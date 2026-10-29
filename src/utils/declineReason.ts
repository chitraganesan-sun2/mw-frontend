export type DeclineReasonCode = "schedule_conflict" | "not_a_good_fit" | "not_taking_sessions" | "other";

export const DECLINE_NOTE_MAX_LENGTH = 200;

// `pickerLabel` is the decliner's voice; `shownLabel` is how the other person reads it.
export const DECLINE_REASONS: { value: DeclineReasonCode; pickerLabel: string; shownLabel: string }[] = [
    { value: "schedule_conflict", pickerLabel: "I have a scheduling conflict", shownLabel: "Scheduling conflict" },
    { value: "not_a_good_fit", pickerLabel: "I'm not the right fit for this request", shownLabel: "Not the right fit for this request" },
    { value: "not_taking_sessions", pickerLabel: "I'm not taking new sessions right now", shownLabel: "Not taking new sessions right now" },
    { value: "other", pickerLabel: "Something else", shownLabel: "Another reason" },
];

/** The body fields for declining: nothing when no reason was picked, and a note only with a reason. */
export function buildDeclinePayload(reason: string, note: string): { decline_reason?: DeclineReasonCode; decline_note?: string } {
    const match = DECLINE_REASONS.find((r) => r.value === reason);
    if (!match) return {};
    const trimmed = note.trim().slice(0, DECLINE_NOTE_MAX_LENGTH);
    return trimmed ? { decline_reason: match.value, decline_note: trimmed } : { decline_reason: match.value };
}

/** "Scheduling conflict - back next week" for a declined session, or null when nothing was said
 *  (or the code is one this version doesn't know). */
export function declineReasonText(code?: string | null, note?: string | null): string | null {
    const match = DECLINE_REASONS.find((r) => r.value === code);
    if (!match) return null;
    const extra = (note ?? "").trim();
    return extra ? `${match.shownLabel} - ${extra}` : match.shownLabel;
}
