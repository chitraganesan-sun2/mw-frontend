"use client";
import type dayjs from "dayjs";
import JoinButton from "@/components/common/JoinButton";
import { joinNames } from "@/utils/joinNames";
import { safeHref } from "@/utils/safeHref";
import {
    formatSessionDate,
    formatSessionTime,
    getSessionInstantBounds,
    joinState,
    shortTimeZone,
} from "@/utils/sessionDisplay";
import type { ScheduleSession } from "@/hooks/schedule/useScheduleSessions";
import type { ScheduleRole } from "./scheduleCategories";

function localTimes(session: ScheduleSession, role: ScheduleRole) {
    return role === "volunteer"
        ? { date: session.volunteer_start_date, start: session.volunteer_start_time, end: session.volunteer_end_time }
        : { date: session.learner_start_date, start: session.learner_start_time, end: session.learner_end_time };
}

/** The accepted session that starts (or is running) soonest, or null. */
export function findNextSession(
    sessions: ScheduleSession[],
    role: ScheduleRole,
    timeZoneLabel: string | undefined,
    now: dayjs.Dayjs
): ScheduleSession | null {
    let best: { session: ScheduleSession; start: dayjs.Dayjs } | null = null;
    for (const session of sessions) {
        if (session.status !== "accepted") continue;
        const bounds = getSessionInstantBounds(session, { ...localTimes(session, role), timeZoneLabel });
        if (!bounds || !bounds.end.isAfter(now)) continue;
        if (!best || bounds.start.isBefore(best.start)) best = { session, start: bounds.start };
    }
    return best?.session ?? null;
}

function startsIn(start: dayjs.Dayjs, end: dayjs.Dayjs, now: dayjs.Dayjs): string {
    if (!start.isAfter(now)) return end.isAfter(now) ? "In progress now" : "";
    const minutes = Math.max(1, Math.ceil(start.diff(now, "minute", true)));
    if (minutes < 60) return `Starts in ${minutes} min`;
    if (minutes < 24 * 60) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `Starts in ${h} h${m ? ` ${m} min` : ""}`;
    }
    return "";
}

interface NextSessionBannerProps {
    session: ScheduleSession;
    role: ScheduleRole;
    timeZoneLabel?: string;
    now: dayjs.Dayjs;
}

/** One line above the session list: what's next, when, and Join when it's time. */
const NextSessionBanner: React.FC<NextSessionBannerProps> = ({ session, role, timeZoneLabel, now }) => {
    const { date, start, end } = localTimes(session, role);
    const bounds = getSessionInstantBounds(session, { date, start, end, timeZoneLabel });
    const counterpart =
        role === "learner" ? session.volunteer_full_name?.trim() : joinNames(session.learner_first_name, session.learner_last_name);
    const href = safeHref(session.meet_link);
    const state = href ? joinState(session, bounds, now) : "none";
    const countdown = bounds ? startsIn(bounds.start, bounds.end, now) : "";
    const tz = timeZoneLabel ? ` ${shortTimeZone(timeZoneLabel, date)}` : "";

    return (
        <div
            role="region"
            aria-label="Next session"
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
        >
            <div className="min-w-0 text-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Next session{countdown && <span className="ml-2 normal-case tracking-normal text-gray-700">· {countdown}</span>}
                </p>
                <p className="font-semibold text-gray-900 truncate">
                    {session.session_title || "Session"}
                    {counterpart && <span className="font-normal text-gray-700"> with {counterpart}</span>}
                </p>
                <p className="text-xs text-gray-700">
                    {formatSessionDate(date)} · {formatSessionTime(start)}
                    {tz}
                </p>
            </div>
            <JoinButton state={state} href={href} contextLabel={session.session_title || "next session"} />
        </div>
    );
};

export default NextSessionBanner;
