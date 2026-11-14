"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/api/constants";
import { GET_API } from "@/api/request";
import { DEFAULT_MIN_NOTICE_MINUTES, sanitizeNoticeMinutes } from "@/utils/wingtimeNotice";

export type WingTimeRules = {
    /** How far ahead a WingTime has to start, in minutes. */
    minNoticeMinutes: number;
};

const FALLBACK: WingTimeRules = { minNoticeMinutes: DEFAULT_MIN_NOTICE_MINUTES };

/**
 * The scheduling rules the server enforces, so the proposal form says the same thing as the backend. Until the answer
 * arrives (or if it never does) the form uses the long default of 3 hours: the safe side, since the server decides.
 */
export function useWingTimeRules(): WingTimeRules {
    const { data } = useQuery({
        queryKey: ["wingtime-rules"],
        queryFn: async (): Promise<WingTimeRules> => {
            const res: any = await GET_API(endpoints.wingtime.rules);
            return { minNoticeMinutes: sanitizeNoticeMinutes(res?.data?.min_lead_minutes) };
        },
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
    return data ?? FALLBACK;
}
