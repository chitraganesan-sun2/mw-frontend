/**
 * How the Schedule dashboard groups a user's sessions. A session's origin is read from the
 * fields the backend stores on it (GET /session/{role}/{id} returns them):
 *
 * - origin "learner_request"       -> a learner posted a request and a volunteer accepted it
 * - session_type "instant_session" -> a volunteer posted an instant session, a learner claimed it
 * - neither                        -> a direct session between a specific learner and volunteer;
 *   initiated_by "volunteer" = the volunteer proposed it to that learner, otherwise the learner
 *   booked one of the volunteer's availability slots (initiated_by "learner" or missing on
 *   sessions created before that field existed).
 */

export type ScheduleRole = "learner" | "volunteer";
export type ScheduleTab = "posted" | "accepted" | "direct";
/** Volunteer-only availability groupings shown in the Availability card. */
export type VolunteerSlotGroup = "offering" | "taken";

export interface ScheduleSessionLike {
    session_type?: string | null;
    origin?: string | null;
    initiated_by?: string | null;
}

type Origin = "learner_posting" | "volunteer_posting" | "learner_booked_slot" | "volunteer_proposed";

export function getSessionOrigin(session: ScheduleSessionLike): Origin {
    if (session.origin === "learner_request") return "learner_posting";
    if (session.session_type === "instant_session") return "volunteer_posting";
    if (session.initiated_by === "volunteer") return "volunteer_proposed";
    return "learner_booked_slot";
}

/** Which My Schedule tab a session belongs to, from the viewer's side. Null = not shown in
 * the tabs (a volunteer's slot bookings live under "Volunteer Slots I'm Offering"). */
export function getScheduleTab(session: ScheduleSessionLike, role: ScheduleRole): ScheduleTab | null {
    const origin = getSessionOrigin(session);
    if (role === "volunteer") {
        if (origin === "volunteer_posting") return "posted";
        if (origin === "learner_posting") return "accepted";
        if (origin === "volunteer_proposed") return "direct";
        return null;
    }
    if (origin === "learner_posting") return "posted";
    if (origin === "volunteer_posting") return "accepted";
    return "direct";
}

export function getVolunteerSlotGroup(session: ScheduleSessionLike): VolunteerSlotGroup | null {
    const origin = getSessionOrigin(session);
    if (origin === "learner_booked_slot") return "offering";
    if (origin === "learner_posting") return "taken";
    return null;
}

/** Terminology from the product reference - keep these exact strings. */
export const SCHEDULE_LABELS = {
    availabilityHeading: "Availability",
    myAvailabilitySchedule: "My Availability Schedule",
    slotsOffering: "Volunteer Slots I'm Offering (accepted by learners)",
    slotsTaken: "Volunteer Slots I've Taken (from learner postings)",
    mySchedule: "My Sessions",
    scheduleAvailability: "Schedule my availability",
    viewCalendar: "View my calendar",
} as const;

export const SCHEDULE_TAB_LABELS: Record<ScheduleRole, Record<ScheduleTab, string>> = {
    volunteer: {
        posted: "My Posted Sessions (accepted by learners)",
        accepted: "My Accepted Sessions (from learner postings)",
        direct: "My Direct Sessions (with specific learner)",
    },
    learner: {
        posted: "My Posted Sessions (accepted by volunteers)",
        accepted: "My Accepted Sessions (from volunteer postings)",
        direct: "My Direct Sessions (with specific volunteer)",
    },
};

export const SCHEDULE_TAB_EMPTY: Record<ScheduleRole, Record<ScheduleTab, string>> = {
    volunteer: {
        posted: "No posted sessions have been accepted by learners yet.",
        accepted: "No accepted sessions yet.",
        direct: "No direct sessions with a specific learner yet.",
    },
    learner: {
        posted: "None of your posted requests have been accepted yet.",
        accepted: "No accepted sessions yet.",
        direct: "No direct sessions with a specific volunteer yet.",
    },
};
