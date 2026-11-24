/**
 * Wall-clock -> UTC conversion for availability slots, as plain minute arithmetic (no date
 * library, so it is unit tested and cannot throw on a missing plugin/offset).
 */

/** Minutes east of UTC for "+05:30" / "-09:00" / "+0530" / "Z"; null when it isn't an offset. */
export function parseOffsetMinutes(offset: string | null | undefined): number | null {
    if (typeof offset !== "string") return null;
    const text = offset.trim();
    if (/^(z|utc)$/i.test(text)) return 0;
    const m = text.match(/^(?:UTC)?([+-])(\d{1,2})(?::?(\d{2}))?$/i);
    if (!m) return null;
    const hours = Number(m[2]);
    const minutes = Number(m[3] ?? 0);
    if (hours > 14 || minutes > 59) return null;
    return (m[1] === "-" ? -1 : 1) * (hours * 60 + minutes);
}

export interface UtcTime {
    /** HH:mm in UTC. */
    time: string;
    /** -1 / 0 / +1: the UTC time falls on the previous / same / next calendar day. */
    dayShift: -1 | 0 | 1;
}

/**
 * `time` ("HH:mm", wall clock in a zone `utcOffset` minutes east of UTC) as UTC, with the day
 * shift it caused. A missing or unreadable `utcOffset` uses `fallbackOffsetMinutes` (the profile
 * zone's offset, when the caller has it) and otherwise the browser's offset - never throws and
 * never silently treats the time as already UTC. Returns null for an unreadable `time`.
 */
export function toUtcTime(
    utcOffset: string | null | undefined,
    time: string,
    fallbackOffsetMinutes?: number | null
): UtcTime | null {
    const t = typeof time === "string" ? time.match(/^(\d{1,2}):(\d{2})/) : null;
    if (!t) return null;
    const wall = Number(t[1]) * 60 + Number(t[2]);
    if (Number(t[1]) > 23 || Number(t[2]) > 59) return null;
    const offset =
        parseOffsetMinutes(utcOffset) ??
        (typeof fallbackOffsetMinutes === "number" && Number.isFinite(fallbackOffsetMinutes)
            ? fallbackOffsetMinutes
            : -new Date().getTimezoneOffset());
    const utc = wall - offset;
    const dayShift = (utc < 0 ? -1 : utc >= 1440 ? 1 : 0) as -1 | 0 | 1;
    const norm = ((utc % 1440) + 1440) % 1440;
    const hh = String(Math.floor(norm / 60)).padStart(2, "0");
    const mm = String(norm % 60).padStart(2, "0");
    return { time: `${hh}:${mm}`, dayShift };
}
