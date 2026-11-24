"use client";
import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getCookie } from "@/utils/auth";
import { mergeSessionPages, nextSessionsPage, type SessionsPage } from "@/utils/schedulePages";
import type { ScheduleRole } from "@/components/schedule/Dashboard/scheduleCategories";

export interface ScheduleSession {
    session_id: string;
    session_title?: string;
    session_description?: string;
    session_expectations?: string | null;
    /** The learner's optional "what should the volunteer know or prepare?" note. */
    preparation_details?: string | null;
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
    /** Why the other person declined, when they said (preset code + optional short note). */
    decline_reason?: string | null;
    decline_note?: string | null;
    /** Participants' profile time zone labels (e.g. "PST - Pacific Standard Time (UTC-08:00)"). */
    learner_timezone?: string | null;
    volunteer_timezone?: string | null;
    /** Set once each participant has left feedback on a completed session. */
    feedback_collected_from_learner?: boolean | null;
    feedback_collected_from_volunteer?: boolean | null;
}

export const scheduleSessionsKey = (role: ScheduleRole, when: "upcoming" | "past") =>
    [`${role}-schedule-sessions`, when] as const;

// Module-level so the select result stays referentially stable between renders.
const selectMerged = (data: { pages: SessionsPage<ScheduleSession>[] }) => mergeSessionPages(data.pages);

/** Page size the dashboard asks for; the API caps pages at 100. */
const PAGE_SIZE = { upcoming: 100, past: 30 } as const;

/**
 * The caller's sessions for the Schedule dashboard. One request series per window feeds every
 * tab and availability grouping (they are split client-side by scheduleCategories), and the
 * backend narrows the query by date and only decrypts names for the returned page. Longer
 * histories are reached with `fetchNextPage` (real `page` paging - the API caps a page at 100
 * rows); `data` is always the merged `{ items, total }` of the pages loaded so far.
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

    return useInfiniteQuery({
        queryKey: [...scheduleSessionsKey(role, when), userId, size],
        initialPageParam: 1,
        queryFn: async ({ pageParam }) => {
            const res: any = await GET_API(
                endpoints.session.getScheduleSessions(role, userId as string, when, size, pageParam)
            );
            return {
                items: (res?.data?.items || []) as ScheduleSession[],
                total: Number(res?.data?.total ?? 0),
            } as SessionsPage<ScheduleSession>;
        },
        getNextPageParam: (_last, all) => nextSessionsPage(all),
        // Same { items, total } shape every consumer already reads.
        select: selectMerged,
        enabled: enabled && Boolean(userId),
        // Bookings/cancellations happen in the other participant's browser - same 30s
        // self-refresh cadence as the calendar and the header bell.
        refetchInterval: when === "upcoming" ? 30000 : false,
    });
}
