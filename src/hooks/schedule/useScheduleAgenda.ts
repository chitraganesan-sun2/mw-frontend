"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { WINGTIME_ENABLED } from "@/config/wingtime";
import { joinNames } from "@/utils/joinNames";
import { getStatusLabel, profileTimeZoneIana } from "@/utils/sessionDisplay";
import { wingtimeHasEnded, wingtimePill, type WingTime } from "@/utils/wingtime";
import { agendaTabOf, type AgendaEntry, type AgendaTab } from "@/utils/scheduleAgenda";
import { getDisplayStatus, isAwaitingMyResponse } from "@/components/schedule/Dashboard/ScheduleSessionCard";
import { getSessionKind, type ScheduleRole } from "@/components/schedule/Dashboard/scheduleCategories";
import { useScheduleSessions, type ScheduleSession } from "./useScheduleSessions";

/** An instant session that has no session behind it yet: a learner's request nobody accepted, or a
 * volunteer's posting nobody claimed. Accepted/claimed ones are regular sessions in the sessions API. */
export interface OpenInstantRow {
    id: string;
    title: string;
    /** "Waiting for a volunteer to accept" / "Waiting for a learner to claim". */
    waitingNote: string;
    /** Start in the viewer's zone. */
    date: string;
    start: string;
    end?: string;
    subjects: string;
    status: string;
}

export type AgendaData =
    | { type: "session"; session: ScheduleSession }
    | { type: "wingtime"; wingtime: WingTime }
    | { type: "instant"; row: OpenInstantRow };

export type ScheduleAgendaEntry = AgendaEntry<AgendaData>;

/** WingTimes and open instant items are fetched in one page; sessions are paged by their own query. */
const EXTRAS_PAGE = 50;

const hhmm = (t?: string | null) => (t ? t.slice(0, 5) : "");
const lower = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(" ").toLowerCase();

function sessionEntry(
    session: ScheduleSession,
    role: ScheduleRole,
    tzLabel: string | undefined,
    now: dayjs.Dayjs,
    /** From the server's past window (finished, cancelled, declined) rather than its upcoming one. */
    ended: boolean
): ScheduleAgendaEntry {
    const mine = role === "volunteer";
    const date = (mine ? session.volunteer_start_date : session.learner_start_date) || "";
    const time = hhmm(mine ? session.volunteer_start_time : session.learner_start_time);
    const status = getDisplayStatus(session, role, tzLabel, now);
    const person = role === "learner" ? session.volunteer_full_name : joinNames(session.learner_first_name, session.learner_last_name);
    return {
        key: `session:${session.session_id}`,
        kind: getSessionKind(session),
        tab: agendaTabOf(status, ended),
        date,
        time,
        needsResponse: !ended && isAwaitingMyResponse(session, role),
        status,
        statusLabel: getStatusLabel(status),
        searchText: lower(
            session.session_title,
            person,
            ...(session.requested_skills || []),
            ...(session.academic_skills || []),
            ...(session.non_academic_skills || [])
        ),
        data: { type: "session", session },
    };
}

/** The status a WingTime shows on My Schedule, in the same words as its card's pill. */
function wingtimeStatus(w: WingTime, now: dayjs.Dayjs): { status: string; label: string } {
    const { label } = wingtimePill(w, now);
    return { status: label.toLowerCase(), label };
}

function wingtimeEntry(w: WingTime, iana: string, now: dayjs.Dayjs): ScheduleAgendaEntry {
    const start = dayjs.utc(w.start_utc).tz(iana);
    const ended = wingtimeHasEnded(w, now);
    // A proposal nobody approved before its time passed never took place.
    const lapsed = ended && w.status === "pending_approval";
    const { status, label } = lapsed ? { status: "expired", label: "Expired" } : wingtimeStatus(w, now);
    return {
        key: `wingtime:${w.wingtime_id}`,
        kind: "wingtime",
        // Ended is decided by the end time in absolute UTC; cancelled / declined / expired never happen.
        tab: agendaTabOf(status, ended),
        date: start.format("YYYY-MM-DD"),
        time: start.format("HH:mm"),
        needsResponse: false,
        status,
        statusLabel: label,
        searchText: lower(w.topic, w.host_name, ...(w.tags || [])),
        data: { type: "wingtime", wingtime: w },
    };
}

function openInstantRow(role: ScheduleRole, raw: any): OpenInstantRow {
    if (role === "learner") {
        const skills = Array.isArray(raw.skills) ? raw.skills.join(", ") : "";
        return {
            id: String(raw.request_id),
            title: raw.session_type === "academic" ? "Academic Session" : "Arts & Life Skills Session",
            waitingNote: "Waiting for a volunteer to accept",
            date: raw.availability_date || "",
            start: hhmm(raw.availability_start_time),
            subjects: skills,
            status: "pending",
        };
    }
    return {
        id: String(raw.session_id),
        title: raw.session_title || "Instant session",
        waitingNote: "Waiting for a learner to claim",
        date: raw.volunteer_start_date || "",
        start: hhmm(raw.volunteer_start_time),
        end: hhmm(raw.volunteer_end_time),
        subjects: "",
        status: "open",
    };
}

function instantEntry(row: OpenInstantRow): ScheduleAgendaEntry {
    return {
        key: `instant:${row.id}`,
        kind: "instant",
        tab: "upcoming",
        date: row.date,
        time: row.start,
        needsResponse: false,
        status: row.status,
        statusLabel: getStatusLabel(row.status),
        searchText: lower(row.title, row.subjects),
        data: { type: "instant", row },
    };
}

/**
 * Everything the viewer has scheduled, as one list of agenda entries: sessions (direct and
 * instant), WingTimes, and instant sessions still waiting for the other person. Every entry says
 * which view it belongs to (`tab`); the section filters, sorts and groups. Upcoming data is always
 * loaded (it feeds the tab count and the Next Session banner); the past window only once the
 * Completed or Cancelled view is opened. `sessions` is the paged query of the chosen window (its
 * "Show More").
 */
export function useScheduleAgenda(
    role: ScheduleRole,
    tab: AgendaTab,
    tzLabel: string | undefined,
    today: string,
    now: dayjs.Dayjs
) {
    const needsPast = tab !== "upcoming";
    const upcomingSessions = useScheduleSessions(role, "upcoming");
    const pastSessions = useScheduleSessions(role, "past", needsPast);
    const sessions = needsPast ? pastSessions : upcomingSessions;

    // A learner's registrations (the upcoming window, and the past one - which an older backend ignores:
    // the end-time rule below keeps each item in the right view either way) / a host's own WingTimes in
    // any status (one list, so it is fetched once).
    const fetchWingtimes = (when: "upcoming" | "past") => async () => {
        const base = role === "learner" ? endpoints.wingtime.myRegistrations : endpoints.wingtime.hosted;
        const res: any = await GET_API(`${base}?page=1&size=${EXTRAS_PAGE}${role === "learner" ? `&when=${when}` : ""}`);
        return (res?.data?.items ?? []) as WingTime[];
    };
    const wingtimesUpcoming = useQuery({
        queryKey: ["wingtime", "schedule", role, "upcoming"],
        enabled: WINGTIME_ENABLED,
        queryFn: fetchWingtimes("upcoming"),
        refetchInterval: 60000,
    });
    const wingtimesPast = useQuery({
        queryKey: ["wingtime", "schedule", role, "past"],
        enabled: WINGTIME_ENABLED && needsPast && role === "learner",
        queryFn: fetchWingtimes("past"),
    });

    // Open instant items matter while they are still plans; once accepted / claimed they are sessions.
    const openInstant = useQuery({
        queryKey: ["instant", "schedule-open", role],
        queryFn: async () => {
            const url =
                role === "learner"
                    ? endpoints.session.getLearnerRequests(1, EXTRAS_PAGE, undefined, "pending")
                    : endpoints.session.getMyInstantSessions(1, EXTRAS_PAGE, undefined, "open");
            const res: any = await GET_API(url);
            return (res?.data?.items ?? []) as any[];
        },
        refetchInterval: 30000,
    });

    const upcomingItems = upcomingSessions.data?.items;
    const pastItems = pastSessions.data?.items;
    const wingtimeUpcomingItems = wingtimesUpcoming.data;
    const wingtimePastItems = wingtimesPast.data;
    const openItems = openInstant.data;

    const entries = useMemo(() => {
        const iana = profileTimeZoneIana(tzLabel) ?? dayjs.tz.guess();
        const out: ScheduleAgendaEntry[] = [
            ...(upcomingItems || []).map((s) => sessionEntry(s, role, tzLabel, now, false)),
            ...(pastItems || []).map((s) => sessionEntry(s, role, tzLabel, now, true)),
        ];

        // The two windows can overlap (a host's list is one list), so a WingTime is added once.
        const seen = new Set<string>();
        [...(wingtimeUpcomingItems || []), ...(wingtimePastItems || [])].forEach((w) => {
            if (seen.has(w.wingtime_id)) return;
            seen.add(w.wingtime_id);
            out.push(wingtimeEntry(w, iana, now));
        });

        (openItems || []).forEach((raw) => {
            const row = openInstantRow(role, raw);
            // An unclaimed post / unanswered request whose day has passed is not a plan any more.
            if (row.date && today && row.date < today) return;
            out.push(instantEntry(row));
        });
        return out;
    }, [upcomingItems, pastItems, wingtimeUpcomingItems, wingtimePastItems, openItems, role, tzLabel, today, now]);

    const wingtimeError =
        WINGTIME_ENABLED &&
        ((wingtimesUpcoming.isError && !wingtimesUpcoming.data) || (wingtimesPast.isError && !wingtimesPast.data));

    return {
        entries,
        sessions,
        upcomingSessions,
        /** The past window has been fetched, so the Completed / Cancelled counts mean something. */
        pastLoaded: Boolean(pastSessions.data),
        /** More past sessions exist than the pages loaded so far (the counts are then "at least"). */
        pastHasMore: Boolean(pastSessions.hasNextPage),
        extras: {
            wingtimeError,
            instantError: openInstant.isError && !openInstant.data,
            retry: () => {
                if (wingtimesUpcoming.isError) wingtimesUpcoming.refetch();
                if (wingtimesPast.isError) wingtimesPast.refetch();
                if (openInstant.isError) openInstant.refetch();
            },
        },
    };
}
