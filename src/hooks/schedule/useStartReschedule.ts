"use client";
import { useRouter } from "next/navigation";
import { useScheduleSessions } from "@/hooks/schedule/useScheduleSessions";
import type { ScheduleRole } from "@/components/schedule/Dashboard/scheduleCategories";

interface ReschedulableSession {
    session_id: string;
    volunteer_id?: string | null;
    learner_id?: string | null;
}

/**
 * Reschedule = the booking form in "reschedule" mode (?reschedule=<id>): same person, new time.
 * One implementation for every place that offers it (My Sessions cards, Availability rows,
 * the calendar preview). `view` keeps the user on the calendar when they came from it.
 */
export function useStartReschedule(role: ScheduleRole) {
    const router = useRouter();
    return (session: ReschedulableSession, view?: string | null) => {
        const counterpartId = role === "learner" ? session.volunteer_id : session.learner_id;
        if (!counterpartId) return;
        const modal = role === "learner" ? "add_new_meeting" : "add_new_session";
        const counterpartParam = role === "learner" ? "volunteerId" : "learnerId";
        const params = new URLSearchParams();
        if (view) params.set("view", view);
        params.set("modal", modal);
        params.set("reschedule", session.session_id);
        params.set(counterpartParam, counterpartId);
        router.push(`/${role}/schedule?${params.toString()}`);
    };
}

/** True when this accepted session already has a reschedule request waiting for an answer.
 * Read from the My Sessions "upcoming" query (shared cache, no extra request) - the calendar's
 * own events don't carry the flag. */
export function useIsReschedulePending(role: ScheduleRole, sessionId?: string | null): boolean {
    const { data } = useScheduleSessions(role, "upcoming");
    if (!sessionId) return false;
    return Boolean(data?.items.find((s) => s.session_id === sessionId)?.reschedule_pending);
}
