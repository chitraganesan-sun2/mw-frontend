"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getCookie } from "@/utils/auth";
import { formatTime } from "@/utils/calender";
import { useAppStore } from "@/store/useAppStore";

dayjs.extend(customParseFormat);

interface AcceptedSession {
    session_id: string;
    session_title: string;
    volunteer_full_name?: string;
    learner_first_name?: string;
    learner_last_name?: string;
    volunteer_start_date?: string;
    volunteer_start_time?: string;
    volunteer_end_time?: string;
    learner_start_date?: string;
    learner_start_time?: string;
    learner_end_time?: string;
    meet_link?: string;
}

interface AcceptedSessionsListProps {
    role: "volunteer" | "learner";
}

interface NormalizedSession {
    raw: AcceptedSession;
    start: dayjs.Dayjs | null;
    end: dayjs.Dayjs | null;
    date?: string;
    startTime?: string;
    endTime?: string;
    counterpartName?: string;
}

const parseDateTime = (date?: string, time?: string): dayjs.Dayjs | null => {
    if (!date || !time) return null;
    const d = dayjs(`${date} ${time.slice(0, 5)}`, "YYYY-MM-DD HH:mm");
    return d.isValid() ? d : null;
};

// Split accepted sessions into Upcoming / Past instead of one flat list. A session counts as
// upcoming until its end time passes (so an in-progress session still shows under Upcoming).
// Reuses the existing session/volunteer/{id} and session/learner/{id} routes with
// status=accepted - no new backend endpoint.
const AcceptedSessionsList: React.FC<AcceptedSessionsListProps> = ({ role }) => {
    const userId = getCookie(role === "volunteer" ? "volunteer_id" : "learner_id");
    const { volunteerTimeZone, learnerTimeZone } = useAppStore();
    const tzLabel = role === "volunteer" ? volunteerTimeZone : learnerTimeZone;

    const { data, isFetching } = useQuery({
        queryKey: [`${role}-accepted-sessions`, userId],
        queryFn: async () => {
            if (!userId) return [];
            const endpoint =
                role === "volunteer"
                    ? endpoints.session.getVolunteerSessions(userId)
                    : endpoints.session.getLearnerSessions(userId);
            const res: any = await GET_API(`${endpoint}?status=accepted`);
            return (res?.data?.items || []) as AcceptedSession[];
        },
        enabled: Boolean(userId),
    });

    const { upcoming, past } = useMemo(() => {
        const now = dayjs();
        const normalized: NormalizedSession[] = (data || []).map((raw) => {
            const date = role === "volunteer" ? raw.volunteer_start_date : raw.learner_start_date;
            const startTime = role === "volunteer" ? raw.volunteer_start_time : raw.learner_start_time;
            const endTime = role === "volunteer" ? raw.volunteer_end_time : raw.learner_end_time;
            const counterpartName =
                role === "volunteer"
                    ? `${raw.learner_first_name || ""} ${raw.learner_last_name || ""}`.trim()
                    : raw.volunteer_full_name;
            return {
                raw,
                start: parseDateTime(date, startTime),
                end: parseDateTime(date, endTime),
                date,
                startTime,
                endTime,
                counterpartName,
            };
        });

        const up: NormalizedSession[] = [];
        const pa: NormalizedSession[] = [];
        normalized.forEach((s) => {
            const boundary = s.end || s.start;
            if (boundary && boundary.isBefore(now)) pa.push(s);
            else up.push(s);
        });

        up.sort((a, b) => (a.start?.valueOf() || 0) - (b.start?.valueOf() || 0));
        pa.sort((a, b) => (b.start?.valueOf() || 0) - (a.start?.valueOf() || 0));
        return { upcoming: up, past: pa };
    }, [data, role]);

    const renderRow = (s: NormalizedSession, isUpcoming: boolean) => {
        const dateLabel = s.start ? s.start.format("ddd, MMM D") : s.date || "";
        const timeLabel = [
            s.startTime ? formatTime(s.startTime) : "",
            s.endTime ? formatTime(s.endTime) : "",
        ]
            .filter(Boolean)
            .join(" - ");

        return (
            <div
                key={s.raw.session_id}
                className="flex items-center justify-between border-b border-gray-100 py-2.5 last:border-0"
            >
                <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.raw.session_title}</p>
                    {s.counterpartName && (
                        <p className="text-xs text-gray-light truncate">with {s.counterpartName}</p>
                    )}
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0 pl-3">
                    <p className="text-xs font-medium whitespace-nowrap">{dateLabel}</p>
                    <p className="text-xs text-gray-light whitespace-nowrap">
                        {timeLabel}
                        {timeLabel && tzLabel ? ` ${tzLabel}` : ""}
                    </p>
                    {isUpcoming && s.raw.meet_link && (
                        <a
                            href={s.raw.meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-primary hover:underline"
                        >
                            Join
                        </a>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl p-4 mb-6">
            <p className="font-medium mb-3">My Accepted Sessions</p>
            {isFetching ? (
                <p className="text-sm text-gray-light">Loading...</p>
            ) : upcoming.length === 0 && past.length === 0 ? (
                <p className="text-sm text-gray-light">No accepted sessions yet.</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {upcoming.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-light mb-1">
                                Upcoming
                            </p>
                            <div className="flex flex-col">
                                {upcoming.map((s) => renderRow(s, true))}
                            </div>
                        </div>
                    )}
                    {past.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-light mb-1">
                                Past
                            </p>
                            <div className="flex flex-col opacity-70">
                                {past.map((s) => renderRow(s, false))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AcceptedSessionsList;
