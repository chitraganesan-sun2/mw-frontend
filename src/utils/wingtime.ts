import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
    formatSessionWhen,
    getStatusLabel,
    getStatusPillClass,
    joinState,
    profileTimeZoneIana,
    zoneAbbreviation,
} from "@/utils/sessionDisplay";

dayjs.extend(utc);
dayjs.extend(timezone);

export type WingTimeStatus = "pending_approval" | "approved" | "rejected" | "cancelled" | "completed";

/** A WingTime as the API returns it. `meeting_link` is only present for the host, registered
 * learners and admins; `reject_reason` only for the host and admins. */
export interface WingTime {
    wingtime_id: string;
    topic: string;
    description: string;
    materials: string;
    tags: string[];
    host_name: string | null;
    date: string;
    start_time: string;
    end_time: string;
    timezone: string;
    start_utc: string;
    end_utc: string;
    duration_minutes: number;
    capacity: number;
    registered_count: number;
    spots_left: number;
    status: WingTimeStatus;
    is_host: boolean;
    is_registered: boolean;
    meeting_link?: string | null;
    reject_reason?: string | null;
}

export interface WingTimePage {
    items: WingTime[];
    total: number;
    page: number;
    size: number;
}

// Same words as the session status pills (sessionDisplay): Pending, Declined, Cancelled, Completed.
export const WINGTIME_STATUS_LABEL: Record<WingTimeStatus, string> = {
    pending_approval: "Pending",
    approved: "Approved",
    rejected: "Declined",
    cancelled: "Cancelled",
    completed: "Completed",
};

// Same palette rules as the session status pills: no blue or orange (those mean Learner and
// Volunteer), and declined / cancelled use a muted rose rather than the error red.
export const WINGTIME_STATUS_PILL: Record<WingTimeStatus, string> = {
    pending_approval: "!bg-yellow-100 !text-yellow-900",
    approved: "!bg-emerald-100 !text-emerald-800",
    rejected: "!bg-rose-50 !text-rose-800",
    cancelled: "!bg-rose-50 !text-rose-800",
    completed: "!bg-gray-100 !text-gray-800",
};

/** "October 29, 2026 · 3:00 PM – 3:30 PM EDT · 30 min" - in the VIEWER's profile time zone (the
 * API sends UTC; the host typed the time in their own zone, which may differ). */
export function wingtimeWhen(w: Pick<WingTime, "start_utc" | "end_utc">, tzLabel?: string | null): string {
    const iana = profileTimeZoneIana(tzLabel) ?? dayjs.tz.guess();
    const start = dayjs.utc(w.start_utc).tz(iana);
    const end = dayjs.utc(w.end_utc).tz(iana);
    const text = formatSessionWhen({
        date: start.format("YYYY-MM-DD"),
        start: start.format("HH:mm"),
        end: end.format("HH:mm"),
        timeZoneLabel: tzLabel,
    });
    // No profile label yet: still say which zone the time is in rather than leave it ambiguous.
    return tzLabel ? text : text.replace(/( · \d+ min)$/, ` ${zoneAbbreviation(iana, start)}$1`);
}

export function wingtimeBounds(w: Pick<WingTime, "start_utc" | "end_utc">) {
    return { start: dayjs.utc(w.start_utc), end: dayjs.utc(w.end_utc) };
}

/** Join button state, reusing the app's one rule (opens 3 minutes before the start, closes at the
 * end). Only an approved WingTime with a link can be joined. */
export function wingtimeJoinState(w: WingTime, now?: dayjs.Dayjs) {
    return joinState(
        { status: w.status === "approved" ? "accepted" : w.status, meet_link: w.meeting_link },
        wingtimeBounds(w),
        now
    );
}

export function spotsText(w: Pick<WingTime, "spots_left" | "capacity">): string {
    if (w.spots_left <= 0) return "Full";
    return w.spots_left === 1 ? "1 spot left" : `${w.spots_left} spots left`;
}

/**
 * The status pill a viewer sees, in the app's one status vocabulary (sessionDisplay): a host sees
 * where their proposal stands; a learner sees Available / Booked / Cancelled (or Full).
 */
export function wingtimePill(w: WingTime): { label: string; className: string } {
    if (w.status === "cancelled") return { label: "Cancelled", className: getStatusPillClass("cancelled") };
    if (w.is_host) return { label: WINGTIME_STATUS_LABEL[w.status], className: WINGTIME_STATUS_PILL[w.status] };
    if (w.is_registered) return { label: getStatusLabel("booked"), className: getStatusPillClass("booked") };
    if (w.spots_left <= 0) return { label: "Full", className: getStatusPillClass("expired") };
    return { label: getStatusLabel("available"), className: getStatusPillClass("available") };
}

/** Can the host still cancel it? (proposed or approved, and not started yet) */
export function canHostCancel(w: Pick<WingTime, "status" | "start_utc">, now: dayjs.Dayjs = dayjs()): boolean {
    return (w.status === "pending_approval" || w.status === "approved") && dayjs.utc(w.start_utc).isAfter(now);
}
