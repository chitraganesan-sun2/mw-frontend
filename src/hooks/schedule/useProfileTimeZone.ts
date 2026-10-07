"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getCookie } from "@/utils/auth";
import { useAppStore } from "@/store/useAppStore";
import { profileToday } from "@/utils/sessionDisplay";
import type { ScheduleRole } from "@/components/schedule/Dashboard/scheduleCategories";

/**
 * The signed-in user's PROFILE timezone label ("EST - Eastern Standard Time (UTC-05:00)").
 * Reads the persisted store value the schedule pages keep in sync, and otherwise fetches the
 * profile under the same query key (and data shape) those pages use, so it is usually cached.
 * `role` defaults to the role cookie (read after mount - see Sidebar for the hydration reason).
 */
export function useProfileTimeZone(role?: ScheduleRole): string | undefined {
    const { learnerTimeZone, volunteerTimeZone } = useAppStore();
    const [resolved, setResolved] = useState<{ role?: ScheduleRole; id?: string }>({ role });
    useEffect(() => {
        const r = (role ?? getCookie("role")) as ScheduleRole | undefined;
        setResolved({ role: r, id: getCookie(r === "volunteer" ? "volunteer_id" : "learner_id") });
    }, [role]);

    const isVolunteer = resolved.role === "volunteer";
    const stored = isVolunteer ? volunteerTimeZone : resolved.role === "learner" ? learnerTimeZone : undefined;

    const { data } = useQuery<any>({
        queryKey: [isVolunteer ? "volunteer-details" : "learner-details", resolved.id],
        queryFn: async () => {
            const res: any = await GET_API(
                isVolunteer
                    ? endpoints.volunteer.getIndividualVolunteer(resolved.id as string)
                    : endpoints.learner.getIndividualLearner(resolved.id as string)
            );
            return res?.data ?? null;
        },
        enabled: Boolean(resolved.role && resolved.id) && !stored,
        staleTime: 5 * 60 * 1000,
    });

    const fetched = isVolunteer
        ? data?.volunteer_contact_details?.timezone
        : data?.learner_personal_info?.learner_contact_details?.timezone;
    return stored || fetched || undefined;
}

/**
 * Today's date (YYYY-MM-DD) in the user's PROFILE timezone - for "no past dates" gates on
 * date pickers, which used the browser's clock (wrong whenever the two zones are on different
 * dates). Re-evaluated every minute and on window focus, so it rolls over at midnight.
 * Starts from the browser date until mounted, matching the server render.
 */
export function useProfileToday(role?: ScheduleRole): string {
    const label = useProfileTimeZone(role);
    const [today, setToday] = useState(() => dayjs().format("YYYY-MM-DD"));
    useEffect(() => {
        const update = () => setToday(profileToday(label));
        update();
        const timer = setInterval(update, 60 * 1000);
        window.addEventListener("focus", update);
        return () => {
            clearInterval(timer);
            window.removeEventListener("focus", update);
        };
    }, [label]);
    return today;
}

/** A dayjs "now" that re-renders the caller every `intervalMs` (default 1 min), so time-based
 * UI (Join / Complete availability) updates without a reload. */
export function useNow(intervalMs = 60 * 1000): dayjs.Dayjs {
    const [now, setNow] = useState(() => dayjs());
    useEffect(() => {
        const timer = setInterval(() => setNow(dayjs()), intervalMs);
        return () => clearInterval(timer);
    }, [intervalMs]);
    return now;
}
