/**
 * Shared user-facing terms and help text, so the same concept reads the same everywhere.
 * Each help line was written from how the feature actually behaves (see the notes beside it);
 * if the behavior changes, change the text here. Legal copy (components/consents) and
 * product-reference labels in components/schedule/Dashboard/scheduleCategories.ts live elsewhere.
 */

/** Approved names for the three ways of getting a session. */
export const TERMS = {
    /** The booking section in the menu: Instant Sessions and Book for Later live under it (WingTime stays separate). */
    bookSession: "Book a Session",
    /** Start a session right now / today or tomorrow. */
    instantSessions: "Instant Sessions",
    /** Pick one of a volunteer's open times; the volunteer then accepts or declines. */
    bookForLater: "Book for Later",
    /** Learner asks for a session today/tomorrow; any volunteer can accept. */
    requestInstantSession: "Request an Instant Session",
    /** Volunteer opens a session today/tomorrow; any learner can join. */
    postInstantSession: "Post an Instant Session",
    /** Volunteer proposes a 30-minute group session; an admin approves it before learners see it. */
    proposeWingTime: "Propose a WingTime",
} as const;

export const HELP = {
    bookSession: "Two ways to get a session: connect right away with an Instant Session, or choose a future date and time with Book for Later.",
    instantSessionsLearner: "Need help soon? Request a session for today or tomorrow, or join one a volunteer has posted. Any available volunteer can accept.",
    instantSessionsVolunteer: "Free right now? Post a session for today or tomorrow, or accept a learner's request. Learners can join straight away.",
    bookForLaterLearner: "Plan ahead. Pick one of a volunteer's open times on the date you prefer; the volunteer then accepts or declines.",
    bookForLaterVolunteer: "Plan ahead. Propose a session to a learner for a future date and time, and set the weekly hours learners can book.",
    bookForLater: "Request a session with a volunteer at one of their open times. The volunteer has to accept before it is confirmed.",
    viewCalendar: "See your sessions and availability on a monthly calendar.",
    scheduleAvailability: "Set the weekly times you are free for sessions.",

    mySessions: "Everything you have scheduled, in one place: sessions, instant sessions and WingTimes, in date order.",
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
    myVolunteers: "Volunteers you have had sessions with, and how many sessions you have taken together.",
    myLearners: "Learners you have had sessions with, and how many sessions you have had together.",
    matchesLearner:
        "We compare your profile with volunteers and suggest the best fit. You can ask for a new suggestion after a short wait.",
    matchesVolunteer:
        "We compare your profile with learners and suggest the best fit. You can ask for a new suggestion after a short wait.",
} as const;

/**
 * "This session is recorded / transcribed" notices. Each describes only what the system does (see
 * RECORDING-CONSENT-AND-MEET-SETTINGS-2026-11-13.md section D) and is shown only while that capture is on
 * (components/common/RecordingNotice). Wording is a working draft for the owner's lawyer.
 */
export const RECORDING_NOTICE = {
    wingtimeLearner:
        "This session will be recorded and transcribed for safety. A recording may be shared with MelodyWings members after our team has reviewed it. When Google Meet asks you to agree, please click Agree, otherwise you will not appear in the recording.",
    wingtimeHost:
        "Your session will be recorded and transcribed for safety. A recording is only shared in Resources after our team has reviewed and approved it. When Google Meet asks you to agree, please click Agree, otherwise you will not appear in the recording.",
    oneToOne: "This session will be transcribed (not recorded) for safety. If Google Meet asks you to agree, please click Agree.",
} as const;

/** Empty-state wording: say why the list is empty and what to try. */
export const EMPTY = {
    noResultsForFilters: (things: string) => `No ${things} match your search or filters. Try removing a filter or searching for something else.`,
    noneYet: (things: string, hint?: string) => (hint ? `No ${things} yet. ${hint}` : `No ${things} yet.`),
} as const;

export const ERRORS = {
    load: (things: string) => `Couldn't load ${things}. Check your connection and try again.`,
} as const;
