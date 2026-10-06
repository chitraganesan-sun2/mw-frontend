"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getCookie } from "@/utils/auth";

export const UNREAD_MESSAGES_QUERY_KEY = ["chat-unread-count"] as const;

/**
 * Total unread chat messages for the signed-in learner/volunteer. Every consumer (sidebar
 * badge, new-message alert) shares this query key, so it is a single 30s poll - the same
 * cadence as the header bell's session-notification poll.
 */
export function useUnreadMessages() {
    // Deferred cookie read: reading it during render would differ between SSR and the
    // first client render (see Sidebar/index.tsx).
    const [role, setRole] = useState<string | undefined>(undefined);
    useEffect(() => {
        setRole(getCookie("role"));
    }, []);

    const { data } = useQuery({
        queryKey: UNREAD_MESSAGES_QUERY_KEY,
        queryFn: async () => {
            const res: any = await GET_API(endpoints.chat.unreadCount);
            return Number(res?.data?.unread_count || 0);
        },
        enabled: role === "learner" || role === "volunteer",
        refetchInterval: 30000,
    });

    return { unreadMessages: data ?? 0, role };
}
