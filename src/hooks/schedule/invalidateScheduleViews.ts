import type { QueryClient } from "@tanstack/react-query";
import type { ScheduleRole } from "@/components/schedule/Dashboard/scheduleCategories";

/**
 * Every cached view a session mutation (book / accept / decline / claim / cancel / complete /
 * withdraw / feedback / slot edit) can change, for one role. Session mutations used to
 * invalidate only the calendar (`${role}-events`) and the bell, so the Schedule dashboard
 * (`${role}-schedule-sessions`) kept showing the old status until its 30s poll.
 *
 * Prefix keys: each matches every window/month/page variant of that query. Invalidating a key
 * with no active query just marks it stale, so the broad list costs nothing extra.
 */
export function invalidateScheduleViews(queryClient: QueryClient, role: ScheduleRole) {
    const keys: string[] = [
        // Schedule dashboard (both the upcoming and past windows) + calendars.
        `${role}-schedule-sessions`,
        `${role}-events`,
        `${role}-accepted-sessions`,
        // Header bell / approval drawer.
        role === "learner" ? "learner-approval-notifications" : "approval-notifications",
        "unread-count",
        // Availability (weekly + one-time slots, per-date slot lists, bookable days).
        role === "volunteer" ? "volunteer_slot" : "learner_slot",
        "availableDays",
        "available-slots",
        // Instant-session pages.
        ...(role === "learner"
            ? ["learner-instant-sessions", "learner-accepted-instant-sessions", "learner-my-requests"]
            : ["volunteer-my-instant-sessions", "volunteer-learner-requests", "my-open-instant-sessions-overlap"]),
    ];
    keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
}
