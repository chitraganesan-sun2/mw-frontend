/**
 * Shared user-facing terms and help text, so the same concept reads the same everywhere.
 * Each help line was written from how the feature actually behaves (see the notes beside it);
 * if the behavior changes, change the text here. Legal copy (components/consents) and
 * product-reference labels in components/schedule/Dashboard/scheduleCategories.ts live elsewhere.
 */

/** Approved names for the three ways of getting a session. */
export const TERMS = {
    /** Pick one of a volunteer's open times; the volunteer then accepts or declines. */
    bookForLater: "Book for Later",
    /** Learner asks for a session today/tomorrow; any volunteer can accept. */
    requestInstantSession: "Request an Instant Session",
    /** Volunteer opens a session today/tomorrow; any learner can join. */
    postInstantSession: "Post an Instant Session",
} as const;

export const HELP = {
    bookForLater: "Request a session with a volunteer at one of their open times. The volunteer has to accept before it is confirmed.",
    viewCalendar: "See your sessions and availability on a monthly calendar.",
    scheduleAvailability: "Set the weekly times you are free for sessions.",

    mySessions: "Your upcoming sessions, grouped by how they were arranged. Past sessions are under Past.",
    availabilityVolunteer:
        "The weekly and one-time hours you offer. Learners can book these times; booked times show under Volunteer Slots I'm Offering.",
    availabilityLearner: "The weekly times you are usually free for sessions.",

    /** Per-column explanations; derived from getScheduleTab() in scheduleCategories.ts. */
    sessionColumn: {
        volunteer: {
            posted: "Instant sessions you posted that a learner joined.",
            accepted: "Sessions a learner requested that you accepted.",
            direct: "Sessions you proposed to one specific learner.",
        },
        learner: {
            posted: "Sessions you requested that a volunteer accepted.",
            accepted: "Instant sessions posted by a volunteer that you joined.",
            direct: "Sessions with one specific volunteer, booked from their open times or proposed by them.",
        },
    },

    browseVolunteers:
        "Browse volunteers in your country. Filter by language, skill or available time, then open a profile to message the volunteer or book a session.",
    browseLearners:
        "Browse learners. Filter by language, disability type or skill to learn, then open a profile to message the learner or propose a session.",
    matchesLearner:
        "We compare your profile with volunteers and suggest the best fit. You can ask for a new suggestion after a short wait.",
    matchesVolunteer:
        "We compare your profile with learners and suggest the best fit. You can ask for a new suggestion after a short wait.",
} as const;

/** Empty-state wording: say why the list is empty and what to try. */
export const EMPTY = {
    noResultsForFilters: (things: string) => `No ${things} match your search or filters. Try removing a filter or searching for something else.`,
    noneYet: (things: string, hint?: string) => (hint ? `No ${things} yet. ${hint}` : `No ${things} yet.`),
} as const;

export const ERRORS = {
    load: (things: string) => `Couldn't load ${things}. Check your connection and try again.`,
} as const;
