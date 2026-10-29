import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { profileNow } from "@/utils/sessionDisplay";

export interface UpcomingSlot {
    /** YYYY-MM-DD in the viewer's profile timezone. */
    date: string;
    volunteer_slot_id: string;
    start_time: string;
    end_time: string;
    /** Set by the server for a learner: this time overlaps a session they already have. */
    conflicts_with_my_schedule?: boolean;
}

/**
 * A volunteer's bookable slots for the next weeks, in the viewer's profile timezone - the
 * options of the booking form's availability dropdown. Under the "available-slots" key
 * prefix so invalidateScheduleViews refreshes it after any booking. Slots that started while
 * the form was open are dropped client-side (the server re-checks on submit).
 */
export function useUpcomingSlots(
    volunteerId: string | undefined,
    profileTimeZone?: string,
    /** The session being rescheduled: it doesn't count as a conflict with its own replacement. */
    excludeSessionId?: string | null
) {
    const query = useQuery({
        queryKey: ["available-slots", "upcoming", volunteerId, excludeSessionId ?? null],
        queryFn: async () => {
            const res: any = await GET_API(endpoints.volunteer_slot.upcomingSlots(volunteerId as string, excludeSessionId));
            return {
                slots: (Array.isArray(res?.data?.slots) ? res.data.slots : []) as UpcomingSlot[],
                // Set only when the volunteer has paused new requests or is at their limit.
                unavailableReason:
                    res?.data?.accepting_requests === false && typeof res?.data?.unavailable_reason === "string"
                        ? (res.data.unavailable_reason as string)
                        : null,
            };
        },
        enabled: Boolean(volunteerId),
        staleTime: 30 * 1000,
    });

    const slots = useMemo(() => {
        const now = profileNow(profileTimeZone).format("YYYY-MM-DD HH:mm");
        return (query.data?.slots ?? []).filter((s) => `${s.date} ${s.start_time}` > now);
    }, [query.data, profileTimeZone]);

    return { ...query, slots, unavailableReason: query.data?.unavailableReason ?? null };
}
