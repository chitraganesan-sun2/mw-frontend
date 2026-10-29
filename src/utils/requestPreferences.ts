export const MAX_PAUSE_DAYS = 90;
export const MAX_PENDING_CAP = 50;

export interface RequestPreferencesForm {
    paused: boolean;
    /** YYYY-MM-DD, or "" for "until I turn it back on". */
    pausedUntil: string;
    /** The cap as typed; "" means no limit. */
    capText: string;
}

const dayNumber = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86_400_000;

/** A message for the form, or null when it can be saved. `today` is YYYY-MM-DD. */
export function validateRequestPreferences(form: RequestPreferencesForm, today: string): string | null {
    if (form.capText.trim() !== "") {
        const n = Number(form.capText);
        if (!Number.isInteger(n) || n < 1 || n > MAX_PENDING_CAP) {
            return `The limit must be a whole number from 1 to ${MAX_PENDING_CAP}, or empty for no limit.`;
        }
    }
    if (form.paused && form.pausedUntil) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(form.pausedUntil)) return "Choose a valid date to resume.";
        const days = dayNumber(form.pausedUntil) - dayNumber(today);
        if (days < 0) return "The resume date can't be in the past.";
        if (days > MAX_PAUSE_DAYS) return `You can pause for up to ${MAX_PAUSE_DAYS} days at a time. Pause again after that.`;
    }
    return null;
}

/** The PUT body. A date only means something while paused; an empty limit is "no limit" (null). */
export function buildRequestPreferencesPayload(form: RequestPreferencesForm) {
    return {
        requests_paused: form.paused,
        requests_paused_until: form.paused && form.pausedUntil ? form.pausedUntil : null,
        max_pending_requests: form.capText.trim() === "" ? null : Number(form.capText),
    };
}
