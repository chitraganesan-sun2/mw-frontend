import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

/**
 * One vocabulary for session / slot states across the app. Before this, the same state
 * had several names depending on the screen ("Open" vs "Posted", "Claimed" vs "Booked",
 * "Unavailable" for a declined request) and the same label had different colours.
 *
 * - posted:    a volunteer's instant session nobody has claimed yet (backend: "open")
 * - available: an unclaimed instant session / free slot as seen by a learner
 * - booked:    someone has claimed it (backend: "claimed" / is_accepted)
 * - pending, accepted, active, completed, cancelled, expired: session/request statuses
 * - rejected:  shown as "Declined"
 */
export type SessionStatus =
    | "posted"
    | "available"
    | "booked"
    | "pending"
    | "accepted"
    | "active"
    | "completed"
    | "cancelled"
    | "expired"
    | "rejected";

const STATUS_ALIASES: Record<string, SessionStatus> = {
    open: "posted",
    claimed: "booked",
    instant_session_open: "posted",
};

const STATUS_LABELS: Record<SessionStatus, string> = {
    posted: "Posted",
    available: "Available",
    booked: "Booked",
    pending: "Pending",
    accepted: "Accepted",
    active: "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
    expired: "Expired",
    rejected: "Declined",
};

// Pill colours. Cancelled/declined use a muted rose, not the error red, and pending uses
// amber - neither should read as an error indicator.
const STATUS_PILL_CLASSES: Record<SessionStatus, string> = {
    posted: "bg-amber-100 text-amber-900",
    available: "bg-green-100 text-green-800",
    booked: "bg-sky-100 text-sky-800",
    pending: "bg-yellow-100 text-yellow-900",
    accepted: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-rose-50 text-rose-800",
    expired: "bg-gray-100 text-gray-600",
    rejected: "bg-rose-50 text-rose-800",
};

export function normalizeStatus(status?: string | null): SessionStatus | null {
    if (!status) return null;
    const key = status.toLowerCase();
    if (key in STATUS_LABELS) return key as SessionStatus;
    return STATUS_ALIASES[key] ?? null;
}

export function getStatusLabel(status?: string | null): string {
    const normalized = normalizeStatus(status);
    return normalized ? STATUS_LABELS[normalized] : status ?? "";
}

export function getStatusPillClass(status?: string | null): string {
    const normalized = normalizeStatus(status);
    return normalized ? STATUS_PILL_CLASSES[normalized] : "bg-gray-100 text-gray-700";
}

// ---------------------------------------------------------------- dates, times, durations

/** "October 15, 2026" - explicit dates instead of "Tomorrow"/"In 2 days". */
export const SESSION_DATE_FORMAT = "MMMM D, YYYY";

export function formatSessionDate(date?: string | null): string {
    if (!date) return "";
    const d = dayjs(date, "YYYY-MM-DD", true);
    return d.isValid() ? d.format(SESSION_DATE_FORMAT) : "";
}

/** "18:00" -> "6:00 PM". */
export function formatSessionTime(time?: string | null): string {
    if (!time) return "";
    const t = dayjs(time.slice(0, 5), "HH:mm", true);
    return t.isValid() ? t.format("h:mm A") : "";
}

/** Minutes between two HH:MM times on the same session; an end at/before the start means
 * the session runs past midnight. */
export function getDurationMinutes(start?: string | null, end?: string | null): number | null {
    if (!start || !end) return null;
    const s = dayjs(start.slice(0, 5), "HH:mm", true);
    const e = dayjs(end.slice(0, 5), "HH:mm", true);
    if (!s.isValid() || !e.isValid()) return null;
    let diff = e.diff(s, "minute");
    if (diff <= 0) diff += 24 * 60;
    return diff;
}

/** 45 -> "45 min", 60 -> "1 hr", 90 -> "1 hr 30 min". */
export function formatDuration(minutes?: number | null): string {
    if (!minutes || minutes <= 0) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (!hours) return `${mins} min`;
    return mins ? `${hours} hr ${mins} min` : `${hours} hr`;
}

/** Local start/end as dayjs objects (end rolls to the next day for overnight sessions). */
export function getLocalSessionBounds(date?: string | null, start?: string | null, end?: string | null) {
    if (!date || !start) return null;
    const startAt = dayjs(`${date} ${start.slice(0, 5)}`, "YYYY-MM-DD HH:mm", true);
    if (!startAt.isValid()) return null;
    const minutes = getDurationMinutes(start, end) ?? 0;
    return { start: startAt, end: startAt.add(minutes, "minute") };
}

// Profile abbreviations -> IANA zones, for daylight-saving-aware labels.
const ABBR_TO_IANA: Record<string, string> = {
    AKST: "America/Anchorage", AKDT: "America/Anchorage",
    AST: "America/Halifax", ADT: "America/Halifax",
    CST: "America/Chicago", CDT: "America/Chicago", CT: "America/Chicago",
    EST: "America/New_York", EDT: "America/New_York", ET: "America/New_York",
    HST: "Pacific/Honolulu", HDT: "Pacific/Honolulu",
    MST: "America/Denver", MDT: "America/Denver", MT: "America/Denver",
    NST: "America/St_Johns", NDT: "America/St_Johns",
    PST: "America/Los_Angeles", PDT: "America/Los_Angeles", PT: "America/Los_Angeles",
    IST: "Asia/Kolkata",
};

/**
 * Profile timezone labels look like "EST - Eastern Standard Time (UTC-05:00)". Show the
 * abbreviation in effect on `date` (EST -> EDT in summer), so every form and card agrees -
 * cards used to print the stored "EST" while the forms showed "EDT" for the same user.
 * `date` (YYYY-MM-DD) defaults to today; pass the session's date for a session.
 */
export function shortTimeZone(label?: string | null, date?: string | null): string {
    if (!label) return "";
    const abbr = label.split(" - ")[0].trim();
    const iana = ABBR_TO_IANA[abbr];
    if (!iana) return abbr;
    const at = date ? dayjs.tz(`${date} 12:00`, iana) : dayjs().tz(iana);
    return at.isValid() ? at.format("z") : abbr;
}

// ---------------------------------------------------------------- join rule

interface JoinableSession {
    status?: string | null;
    meet_link?: string | null;
}

/**
 * Whether to show a Join button. Mirrors the existing product rule (there is no
 * "too early to join" window anywhere in the app): a participant may join an accepted /
 * in-progress session that has a Meet link until it ends. Never for cancelled, declined,
 * completed, expired or pending sessions. The API only returns a Meet link to the
 * session's own participants, so a missing link also covers "not authorised".
 */
export function canJoinSession(
    session: JoinableSession,
    endsAt: dayjs.Dayjs | null | undefined,
    now: dayjs.Dayjs = dayjs()
): boolean {
    const status = normalizeStatus(session.status);
    if (!session.meet_link) return false;
    if (status !== "accepted" && status !== "active" && status !== "booked") return false;
    if (endsAt && !endsAt.isAfter(now)) return false;
    return true;
}
