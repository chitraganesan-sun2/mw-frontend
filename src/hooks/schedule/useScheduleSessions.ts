"use client";
import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getCookie } from "@/utils/auth";
import type { ScheduleRole } from "@/components/schedule/Dashboard/scheduleCategories";

export interface ScheduleSession {
    session_id: string;
    session_title?: string;
    session_description?: string;
    session_expectations?: string | null;
    requested_level?: string | null;
    requested_skills?: string[] | null;
    academic_skills?: string[] | null;
    non_academic_skills?: string[] | null;
    status?: string;
    session_type?: string | null;
    origin?: string | null;
    initiated_by?: string | null;
    meet_link?: string | null;
    volunteer_id?: string;
    learner_id?: string;
    volunteer_full_name?: string | null;
    learner_first_name?: string | null;
    learner_last_name?: string | null;
    volunteer_start_date?: string | null;
    volunteer_start_time?: string | null;
    volunteer_end_time?: string | null;
    learner_start_date?: string | null;
    learner_start_time?: string | null;
    learner_end_time?: string | null;
    session_date?: string;
    session_start_time?: string;
    session_end_time?: string;
    /** This session is a pending request to move the session with this id. */
    reschedules_session_id?: string | null;
    /** This accepted session already has a reschedule request waiting for an answer. */
    reschedule_pending?: boolean | null;
    /** Participants' profile time zone labels (e.g. "PST - Pacific Standard Time (UTC-08:00)"). */
    learner_timezone?: string | null;
    volunteer_timezone?: string | null;
}

export const scheduleSessionsKey = (role: ScheduleRole, when: "upcoming" | "past") =>
    [`${role}-schedule-sessions`, when] as const;

/** Page size the dashboard asks for; the API caps pages at 100. */
const PAGE_SIZE = { upcoming: 100, past: 30 } as const;
/** Past history is loaded in steps of this many sessions ("Show more"), up to the API's cap. */
export const PAST_STEP = 30;
export const MAX_PAGE_SIZE = 100;

/**
 * The caller's sessions for the Schedule dashboard. One request per window feeds every
 * tab and availability grouping (they are split client-side by scheduleCategories), and the
 * backend narrows the query by date and only decrypts names for the returned page.
 */
export function useScheduleSessions(
    role: ScheduleRole,
    when: "upcoming" | "past",
    enabled = true,
    size: number = PAGE_SIZE[when]
) {
    // Deferred cookie read - see Sidebar/index.tsx for the SSR hydration reason.
    const [userId, setUserId] = useState<string | undefined>(undefined);
    useEffect(() => {
        setUserId(getCookie(role === "volunteer" ? "volunteer_id" : "learner_id"));
    }, [role]);

    return useQuery({
        queryKey: [...scheduleSessionsKey(role, when), userId, size],
        // Keep the rows on screen while "Show more" fetches the larger page.
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const res: any = await GET_API(endpoints.session.getScheduleSessions(role, userId as string, when, size));
            return {
                items: (res?.data?.items || []) as ScheduleSession[],
                total: Number(res?.data?.total ?? 0),
            };
        },
        enabled: enabled && Boolean(userId),
        // Bookings/cancellations happen in the other participant's browser - same 30s
        // self-refresh cadence as the calendar and the header bell.
        refetchInterval: when === "upcoming" ? 30000 : false,
    });
}
