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
// amber - neither should read as an error indicator. No status uses blue or orange: those
// mean Learner and Volunteer across the app.
// Important (!) so they also win over a Tag's own background (TagComponent defaults to
// the viewer's theme tint); written out literally because Tailwind only generates class
// names it can see in source.
const STATUS_PILL_CLASSES: Record<SessionStatus, string> = {
    posted: "!bg-amber-100 !text-amber-900",
    available: "!bg-green-100 !text-green-800",
    booked: "!bg-emerald-100 !text-emerald-800",
    pending: "!bg-yellow-100 !text-yellow-900",
    accepted: "!bg-emerald-100 !text-emerald-800",
    active: "!bg-teal-100 !text-teal-800",
    completed: "!bg-gray-100 !text-gray-800",
    cancelled: "!bg-rose-50 !text-rose-800",
    expired: "!bg-gray-100 !text-gray-600",
    rejected: "!bg-rose-50 !text-rose-800",
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

function hhmmToMinutes(time: string): number {
    const [h, m] = time.slice(0, 5).split(":").map(Number);
    return h * 60 + m;
}

/** True when a slot's end is before its start, i.e. it runs past midnight. */
export function isOvernightRange(start?: string | null, end?: string | null): boolean {
    if (!start || !end) return false;
    return hhmmToMinutes(end) < hhmmToMinutes(start);
}

/**
 * A slot as [startMinutes, endMinutes) on its start day. An end at/before the start crosses
 * midnight, so it's pushed past 1440 - "23:30"-"00:30" is [1410, 1470), not a reversed range.
 */
export function slotMinuteRange(start: string, end: string): [number, number] {
    const s = hhmmToMinutes(start);
    let e = hhmmToMinutes(end);
    if (e <= s) e += 24 * 60;
    return [s, e];
}

/** Half-open overlap of two slotMinuteRange()s; `shift` offsets b (1440 = b is on the next day). */
export function minuteRangesOverlap(a: [number, number], b: [number, number], shift = 0): boolean {
    return a[0] < b[1] + shift && b[0] + shift < a[1];
}

/** "11:30 PM – 12:30 AM (next day)" for an overnight slot, "6:00 PM – 6:45 PM" otherwise. */
/** "11:30 PM – 12:30 AM EDT (next day)" - the zone (optional) goes before the overnight note. */
export function formatTimeRange(start?: string | null, end?: string | null, zone?: string | null): string {
    const range = [formatSessionTime(start), formatSessionTime(end)].filter(Boolean).join(" – ");
    const withZone = zone ? `${range} ${zone}` : range;
    return isOvernightRange(start, end) ? `${withZone} (next day)` : withZone;
}

/** 45 -> "45 min", 60 -> "1 hr", 90 -> "1 hr 30 min". */
export function formatDuration(minutes?: number | null): string {
    if (!minutes || minutes <= 0) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (!hours) return `${mins} min`;
    return mins ? `${hours} hr ${mins} min` : `${hours} hr`;
}

/** Same calendar year as now -> "Oct 7", otherwise "Oct 7, 2027" - for compact rows. */
export function formatShortSessionDate(date?: string | null): string {
    if (!date) return "";
    const d = dayjs(date, "YYYY-MM-DD", true);
    if (!d.isValid()) return "";
    return d.format(d.year() === dayjs().year() ? "MMM D" : "MMM D, YYYY");
}

/**
 * The app-standard one-liner for a session's time: "October 15, 2026 · 6:00 PM – 6:45 PM EDT
 * · 45 min". `date`/`start`/`end` are the viewer's profile-local fields; `timeZoneLabel` is the
 * viewer's profile label (resolved to the abbreviation in effect on that date).
 */
export function formatSessionWhen({
    date,
    start,
    end,
    timeZoneLabel,
}: {
    date?: string | null;
    start?: string | null;
    end?: string | null;
    timeZoneLabel?: string | null;
}): string {
    const range = [formatSessionTime(start), formatSessionTime(end)].filter(Boolean).join(" – ");
    const tz = range && timeZoneLabel ? shortTimeZone(timeZoneLabel, date) : "";
    return [formatSessionDate(date), [range, tz].filter(Boolean).join(" "), formatDuration(getDurationMinutes(start, end))]
        .filter(Boolean)
        .join(" · ");
}

/** Local start/end as dayjs objects (end rolls to the next day for overnight sessions).
 * Parsed in the BROWSER's timezone - display only. For "has it started/ended" decisions use
 * getSessionInstantBounds, which works from the UTC fields. */
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

// Exact picker labels whose abbreviation alone is ambiguous: no-daylight-saving areas share
// MST/CST/AST with zones that DO observe it. Checked before the abbreviation map. Keep in
// sync with src/data/selectiveTimeZones.json and the backend's utils/timezones.py.
const LABEL_TO_IANA: Record<string, string> = {
    "MST - Mountain Standard Time, Arizona - no daylight saving (UTC-07:00)": "America/Phoenix",
    "CST - Central Standard Time, Saskatchewan - no daylight saving (UTC-06:00)": "America/Regina",
    "AST - Atlantic Standard Time, Puerto Rico - no daylight saving (UTC-04:00)": "America/Puerto_Rico",
};

const IANA_NAME = /^[A-Za-z]+\/[A-Za-z_]+/;

/** IANA zone for a profile label ("EST - Eastern Standard Time (UTC-05:00)" -> America/New_York).
 * Also accepts a bare abbreviation or an IANA name. Null when it can't be resolved.
 * `iana`, when given (a stored IANA zone, e.g. "America/Phoenix"), wins over the label: the
 * abbreviation map can't tell Arizona from Denver or Puerto Rico from Halifax. */
export function profileTimeZoneIana(label?: string | null, iana?: string | null): string | null {
    if (iana && IANA_NAME.test(iana.trim())) return iana.trim();
    if (!label) return null;
    if (LABEL_TO_IANA[label.trim()]) return LABEL_TO_IANA[label.trim()];
    const abbr = label.split(" - ")[0].trim();
    if (ABBR_TO_IANA[abbr]) return ABBR_TO_IANA[abbr];
    return IANA_NAME.test(abbr) ? abbr : null;
}

/** "Now" in the profile's timezone (falls back to the browser's when unresolvable). */
export function profileNow(label?: string | null, iana?: string | null): dayjs.Dayjs {
    const zone = profileTimeZoneIana(label, iana);
    return zone ? dayjs().tz(zone) : dayjs();
}

/** Today's date (YYYY-MM-DD) in the profile's timezone. */
export function profileToday(label?: string | null, iana?: string | null): string {
    return profileNow(label, iana).format("YYYY-MM-DD");
}

// Intl has no short name for some zones in en-US and prints an offset instead
// ("GMT+5:30" for India, "GMT-2:30" for Newfoundland summer time).
const OFFSET_ABBREVIATIONS: Record<string, (offsetMinutes: number) => string> = {
    "Asia/Kolkata": () => "IST",
    "Asia/Calcutta": () => "IST",
    "America/St_Johns": (offset) => (offset === -150 ? "NDT" : "NST"),
};

/** Abbreviation for `iana` at the instant `at` ("EDT", "IST", "NDT"); never a "GMT+x" offset
 * when a proper abbreviation exists. */
export function zoneAbbreviation(iana: string, at: dayjs.Dayjs = dayjs()): string {
    const local = at.tz(iana);
    if (!local.isValid()) return "";
    const z = local.format("z");
    if (!/^(GMT|UTC)[+-]/.test(z)) return z;
    const explicit = OFFSET_ABBREVIATIONS[iana];
    return explicit ? explicit(local.utcOffset()) : z;
}

/**
 * Profile timezone labels look like "EST - Eastern Standard Time (UTC-05:00)". Show the
 * abbreviation in effect on `date` (EST -> EDT in summer), so every form and card agrees -
 * cards used to print the stored "EST" while the forms showed "EDT" for the same user.
 * `date` (YYYY-MM-DD) defaults to today; pass the session's date for a session.
 * `iana` (optional stored IANA zone) is preferred over the label's abbreviation mapping.
 */
export function shortTimeZone(label?: string | null, date?: string | null, iana?: string | null): string {
    if (!label && !iana) return "";
    const abbr = label ? label.split(" - ")[0].trim() : "";
    const zone = profileTimeZoneIana(label, iana);
    if (!zone) return abbr;
    const at = date ? dayjs.tz(`${date} 12:00`, zone) : dayjs();
    if (!at.isValid()) return abbr;
    const z = zoneAbbreviation(zone, at);
    return z && !/^(GMT|UTC)[+-]/.test(z) ? z : abbr;
}

/**
 * An absolute instant (e.g. a record's created_at) in the app style, in the PROFILE timezone:
 * "October 7, 2026 · 9:44 AM EDT". A naive ISO string (no Z/offset - how the backend's
 * datetime.utcnow().isoformat() arrives) is read as UTC; one with an offset keeps it. Falls
 * back to the browser's timezone (no abbreviation) when the profile zone is unknown.
 */
export function formatProfileTimestamp(
    value?: string | null,
    timeZoneLabel?: string | null,
    { iana, withZone = true }: { iana?: string | null; withZone?: boolean } = {}
): string {
    if (!value) return "";
    const instant = dayjs.utc(value);
    if (!instant.isValid()) return "";
    const zone = profileTimeZoneIana(timeZoneLabel, iana);
    const local = zone ? instant.tz(zone) : instant.local();
    const text = local.format(`${SESSION_DATE_FORMAT} · h:mm A`);
    const abbr = withZone && zone ? zoneAbbreviation(zone, instant) : "";
    return abbr ? `${text} ${abbr}` : text;
}

// ---------------------------------------------------------------- absolute session time

/** The UTC fields the API stores on sessions (session_*) and on instant-session posts (utc_*). */
export interface SessionInstantFields {
    session_date?: string | null;
    session_start_time?: string | null;
    session_end_time?: string | null;
    utc_start_date?: string | null;
    utc_start_time?: string | null;
    utc_end_date?: string | null;
    utc_end_time?: string | null;
}

/** Profile-local fields to fall back on when a record carries no UTC fields. */
export interface LocalTimeFallback {
    date?: string | null;
    start?: string | null;
    end?: string | null;
    /** The profile timezone the local fields are expressed in. */
    timeZoneLabel?: string | null;
}

function parseUtc(date?: string | null, time?: string | null): dayjs.Dayjs | null {
    if (!date || !time) return null;
    const d = dayjs.utc(`${date} ${time.slice(0, 5)}`, "YYYY-MM-DD HH:mm", true);
    return d.isValid() ? d : null;
}

/**
 * Absolute start/end instants of a session, for every "has it started / ended / is it
 * joinable" decision. Built from the UTC fields - the profile-local copies are wall-clock
 * times in the PROFILE timezone, and parsing them in the browser's timezone (which can
 * differ) made a session starting in 10 minutes look already ended. The end rolls past
 * midnight when it isn't after the start. Falls back to the local fields (interpreted in the
 * profile timezone when known) only when the record has no UTC fields.
 */
export function getSessionInstantBounds(
    session?: SessionInstantFields | null,
    fallback?: LocalTimeFallback
): { start: dayjs.Dayjs; end: dayjs.Dayjs } | null {
    if (session) {
        const postStart = parseUtc(session.utc_start_date, session.utc_start_time);
        if (postStart) {
            let end = parseUtc(session.utc_end_date || session.utc_start_date, session.utc_end_time) ?? postStart;
            if (!end.isAfter(postStart)) {
                end = postStart.add(getDurationMinutes(session.utc_start_time, session.utc_end_time) ?? 0, "minute");
            }
            return { start: postStart, end };
        }
        const start = parseUtc(session.session_date, session.session_start_time);
        if (start) {
            return {
                start,
                end: start.add(getDurationMinutes(session.session_start_time, session.session_end_time) ?? 0, "minute"),
            };
        }
    }
    if (fallback?.date && fallback.start) {
        const iana = profileTimeZoneIana(fallback.timeZoneLabel);
        const text = `${fallback.date} ${fallback.start.slice(0, 5)}`;
        const start = iana ? dayjs.tz(text, "YYYY-MM-DD HH:mm", iana) : dayjs(text, "YYYY-MM-DD HH:mm", true);
        if (!start.isValid()) return null;
        return { start, end: start.add(getDurationMinutes(fallback.start, fallback.end) ?? 0, "minute") };
    }
    return null;
}

/** The session's start in the OTHER participant's time zone ("5:00 PM GMT", with the date when it
 * falls on a different day), or null when they share the viewer's UTC offset / it is unknown. */
export function counterpartTimeNote(
    bounds: { start: dayjs.Dayjs } | null | undefined,
    viewerLabel?: string | null,
    otherLabel?: string | null
): string | null {
    if (!bounds || !otherLabel) return null;
    const otherZone = profileTimeZoneIana(otherLabel);
    if (!otherZone) return null;
    const viewerZone = profileTimeZoneIana(viewerLabel);
    const mine = viewerZone ? bounds.start.tz(viewerZone) : bounds.start.local();
    const theirs = bounds.start.tz(otherZone);
    if (!theirs.isValid() || mine.utcOffset() === theirs.utcOffset()) return null;
    const otherDay = theirs.format("YYYY-MM-DD") !== mine.format("YYYY-MM-DD") ? ` (${theirs.format("MMM D")})` : "";
    return `${theirs.format("h:mm A")}${otherDay} ${zoneAbbreviation(otherZone, bounds.start)}`.trim();
}

/** True once the session's scheduled end has passed (unknown bounds -> false). */
export function hasSessionEnded(
    bounds: { end: dayjs.Dayjs } | null | undefined,
    now: dayjs.Dayjs = dayjs()
): boolean {
    return Boolean(bounds && !bounds.end.isAfter(now));
}

// ---------------------------------------------------------------- levels

const EXPERTISE_LABELS: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    expert: "Expert",
};

/** Display label for a stored level: "beginner" -> "Beginner"; grades ("Grade 7") as-is. */
export function formatLevel(level?: string | null): string {
    if (!level) return "";
    const trimmed = level.trim();
    return EXPERTISE_LABELS[trimmed.toLowerCase()] ?? trimmed;
}

/** Accepting a learner request stores "Requested level: <level>" as the description, which
 * only repeats the level line already on the card. */
export function isRedundantLevelDescription(description?: string | null, level?: string | null): boolean {
    if (!description || !level) return false;
    const match = description.trim().match(/^Requested level:\s*(.+)$/i);
    return Boolean(match && match[1].trim().toLowerCase() === level.trim().toLowerCase());
}

// ---------------------------------------------------------------- join rule

interface JoinableSession {
    status?: string | null;
    meet_link?: string | null;
}

/** Join opens this many minutes before the scheduled start (product rule, everywhere). */
export const JOIN_OPENS_MINUTES_BEFORE = 3;

interface JoinBounds {
    start?: dayjs.Dayjs | null;
    end?: dayjs.Dayjs | null;
}

/** The moment Join becomes available (3 minutes before the start), or null if the start is unknown. */
export function joinOpensAt(bounds: JoinBounds | null | undefined): dayjs.Dayjs | null {
    return bounds?.start ? bounds.start.subtract(JOIN_OPENS_MINUTES_BEFORE, "minute") : null;
}

/** True while it is too early to join (more than 3 minutes before the start). */
export function isJoinTooEarly(bounds: JoinBounds | null | undefined, now: dayjs.Dayjs = dayjs()): boolean {
    const opensAt = joinOpensAt(bounds);
    return Boolean(opensAt && now.isBefore(opensAt));
}

export type JoinState = "open" | "early" | "none";

/**
 * What the Join button should do. "none": no Join at all (not a live session, no Meet link, or
 * already ended). "early": the session can be joined but not yet - the button stays visible and
 * disabled until 3 minutes before the scheduled start. "open": joinable now (from 3 minutes
 * before the start until it ends). The API only returns a Meet link to the session's own
 * participants, so a missing link also covers "not authorised". Unknown bounds do not block
 * (there is nothing to compare against).
 */
export function joinState(
    session: JoinableSession,
    bounds: JoinBounds | null | undefined,
    now: dayjs.Dayjs = dayjs()
): JoinState {
    const status = normalizeStatus(session.status);
    if (!session.meet_link) return "none";
    if (status !== "accepted" && status !== "active" && status !== "booked") return "none";
    if (bounds?.end && !bounds.end.isAfter(now)) return "none";
    return isJoinTooEarly(bounds, now) ? "early" : "open";
}

/** True only while the session can be joined right now. */
export function canJoinSession(
    session: JoinableSession,
    bounds: JoinBounds | null | undefined,
    now: dayjs.Dayjs = dayjs()
): boolean {
    return joinState(session, bounds, now) === "open";
}

/**
 * Whether to offer "Mark as completed": only for a live (accepted / in-progress / booked)
 * session whose scheduled END has passed - the backend rejects completion before that.
 */
export function canCompleteSession(
    session: { status?: string | null },
    bounds: { end: dayjs.Dayjs } | null | undefined,
    now: dayjs.Dayjs = dayjs()
): boolean {
    const status = normalizeStatus(session.status);
    if (status !== "accepted" && status !== "active" && status !== "booked") return false;
    return hasSessionEnded(bounds, now);
}
