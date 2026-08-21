import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getCookie } from "@/utils/auth";

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

type UserType = "volunteer" | "learner";

interface EventResponse {
    session_title: string;
    session_date: string;
    session_start_time: string;
    session_end_time: string;
    session_description: string;
    meet_link: string;
    session_id: string;
    volunteer_id: string;
    volunteer_full_name: string;
    learner_id: string;
    learner_first_name: string;
    learner_last_name: string;
    learner_picture: string;
    status: string;
    feedback_collected_from_learner: boolean;
    feedback_collected_from_volunteer: boolean;
    learner_start_time: string;
    learner_end_time: string;
    learner_start_date: string;
}

export interface CalendarEvent {
    title: string;
    date: string;
    start: string;
    end: string;
    backgroundColor: string;
    classNames: string[];
    textColor: string;
    borderColor: string;
    status: string;
    extendedProps: {
        description?: string;
        meetLink?: string;
        sessionId?: string;
        volunteerId?: string;
        volunteer_full_name?: string;
        learner?: {
            id: string;
            firstName: string;
            lastName: string;
            picture: string;
        };
        feedBackCollectedFromLearner?: boolean;
        feedBackCollectedFromVolunteer?: boolean;
        volunteer_slot_id?: string;
        isAvailableSlot?: boolean;
    };
}

/**
 * Single API call for calendar: volunteer uses slots_and_sessions for the month,
 * learner uses session calendar events. No per-slot or repeated calls.
 */
export const getCalendarEvents = async (
    userId: string,
    userType: "volunteer" | "learner",
    currentMonth?: string
): Promise<CalendarEvent[]> => {
    const monthParam = currentMonth
        ? dayjs(currentMonth).format("YYYY-MM")
        : dayjs().format("YYYY-MM");
    const role = getCookie("role") as UserType | undefined;

    const endpoint =
        role === "volunteer"
            ? endpoints.volunteer_slot.getAllSlotsForMonth(monthParam)
            : endpoints.session.getCalendarEvents(userId, role as UserType, monthParam);

    const response = await GET_API(endpoint);
    const data = response?.data;

    if (role === "volunteer") {
        return mapVolunteerSlotsToEvents(data);
    }
    return mapLearnerSessionsToEvents(data);
};

/** One GET per slot when you need instant session details (e.g. modal). Do not call in a loop for calendar. */
export const getVolunteerInstantSession = async (
    volunteer_slot_id: string,
    date: string,
    volunteer_id: string
) => {
    const url = endpoints.session.getVolunteerInstantSession(volunteer_slot_id, date, volunteer_id);
    return GET_API(url);
};

function mapVolunteerSlotsToEvents(data: any[] | undefined): CalendarEvent[] {
    if (!Array.isArray(data)) return [];
    const events: CalendarEvent[] = [];

    for (const dayData of data) {
        const slots = dayData?.slots ?? [];
        const dayDate = dayData?.date;

        for (const slot of slots) {
            if (slot.session_details) {
                const sd = slot.session_details;
                events.push({
                    title: sd.session_title,
                    date: sd.volunteer_start_date,
                    start: dayjs(`${sd.volunteer_start_date} ${sd.volunteer_start_time}`).format(),
                    end: dayjs(`${sd.volunteer_start_date} ${sd.volunteer_end_time}`).format(),
                    backgroundColor: "var(--success-light-color)",
                    classNames: ["event-item", "rounded-md", "py-1", "my-0.5"],
                    textColor: "var(--success-color)",
                    borderColor: "var(--success-color)",
                    status: sd.status,
                    extendedProps: {
                        description: sd.session_description,
                        meetLink: sd.meet_link,
                        sessionId: sd.session_id,
                        volunteerId: sd.volunteer_id,
                        volunteer_full_name: sd.volunteer_full_name,
                        learner: {
                            id: sd.learner_id,
                            firstName: sd.learner_full_name,
                            lastName: sd.learner_last_name,
                            picture: sd.learner_picture,
                        },
                        feedBackCollectedFromLearner: sd.feedback_collected_from_learner,
                        feedBackCollectedFromVolunteer: sd.feedback_collected_from_volunteer,
                    },
                });
            } else if (dayDate) {
                events.push({
                    title: slot.title || "No Event",
                    date: dayDate,
                    start: dayjs(`${dayDate} ${slot.start_time}`).format(),
                    end: dayjs(`${dayDate} ${slot.end_time}`).format(),
                    backgroundColor: "var(--gray-100)",
                    classNames: ["event-item", "rounded-md", "py-1", "my-0.5"],
                    textColor: "var(--gray-500)",
                    borderColor: "var(--gray-300)",
                    status: "available",
                    extendedProps: {
                        volunteer_slot_id: slot.volunteer_slot_id,
                        isAvailableSlot: true,
                    },
                });
            }
        }
    }
    return events;
}

function mapLearnerSessionsToEvents(data: any): CalendarEvent[] {
    const items = data?.items;
    if (!Array.isArray(items)) return [];
    return items.map((item: EventResponse) => ({
        title: item.session_title,
        date: item.learner_start_date,
        start: dayjs(`${item.learner_start_date} ${item.learner_start_time}`).format(),
        end: dayjs(`${item.learner_start_date} ${item.learner_end_time}`).format(),
        backgroundColor: "var(--success-light-color)",
        classNames: ["event-item", "rounded-md", "py-1", "my-0.5"],
        textColor: "var(--success-color)",
        borderColor: "var(--success-color)",
        status: item.status,
        extendedProps: {
            description: item.session_description,
            meetLink: item.meet_link,
            sessionId: item.session_id,
            volunteerId: item.volunteer_id,
            volunteer_full_name: item.volunteer_full_name,
            learner: {
                id: item.learner_id,
                firstName: item.learner_first_name,
                lastName: item.learner_last_name,
                picture: item.learner_picture,
            },
            feedBackCollectedFromLearner: item.feedback_collected_from_learner,
            feedBackCollectedFromVolunteer: item.feedback_collected_from_volunteer,
        },
    }));
}

export const getTime = (date: Date): string => {
    if (!date) return "";

    return dayjs(date).format("h:mm A");
};

// Optional: Add a helper function for full date-time formatting
export const formatDateTime = (date: string | Date): string => {
    return dayjs(date).format("MMMM D, YYYY h:mm A");
};

// Fun: Converts railway time(24 hrs) to normal time(12 hrs)
export const formatTime = (railwayTimeString: string) =>
    dayjs(railwayTimeString, "HH:mm").format("hh:mm A");

export const formatDate = (date: string) => dayjs(date).format("YYYY-MM-DD");

// Fun: Converts date into day with month i.e. 12th Apr
export const formatDateSuffix = (date: Date | string) => dayjs(date).format("Do MMM");

export const checkCalendarScope = async () => {
    const response = await GET_API(endpoints.auth.checkCalendarScope);
    return response;
};

export const revokeGoogleAuth = async () => {
    const response = await GET_API(endpoints.auth.revokeGoogleAuth);
    return response;
};
