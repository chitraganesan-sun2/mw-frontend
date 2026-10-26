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
}

/**
 * A volunteer's bookable slots for the next weeks, in the viewer's profile timezone - the
 * options of the booking form's availability dropdown. Under the "available-slots" key
 * prefix so invalidateScheduleViews refreshes it after any booking. Slots that started while
 * the form was open are dropped client-side (the server re-checks on submit).
 */
export function useUpcomingSlots(volunteerId: string | undefined, profileTimeZone?: string) {
    const query = useQuery({
        queryKey: ["available-slots", "upcoming", volunteerId],
        queryFn: async () => {
            const res: any = await GET_API(endpoints.volunteer_slot.upcomingSlots(volunteerId as string));
            return (Array.isArray(res?.data?.slots) ? res.data.slots : []) as UpcomingSlot[];
        },
        enabled: Boolean(volunteerId),
        staleTime: 30 * 1000,
    });

    const slots = useMemo(() => {
        const now = profileNow(profileTimeZone).format("YYYY-MM-DD HH:mm");
        return (query.data ?? []).filter((s) => `${s.date} ${s.start_time}` > now);
    }, [query.data, profileTimeZone]);

    return { ...query, slots };
}
