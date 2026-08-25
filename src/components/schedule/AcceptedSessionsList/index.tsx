"use client";
import { useQuery } from "@tanstack/react-query";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getCookie } from "@/utils/auth";
import { formatDateSuffix, formatTime } from "@/utils/calender";

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
}

interface AcceptedSessionsListProps {
    role: "volunteer" | "learner";
}

// All-time (past + future) list of accepted sessions - reuses the existing session/volunteer/{id}
// and session/learner/{id} list routes with status=accepted, no new backend endpoint needed.
const AcceptedSessionsList: React.FC<AcceptedSessionsListProps> = ({ role }) => {
    const userId = getCookie(role === "volunteer" ? "volunteer_id" : "learner_id");

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

    const sessions = data || [];

    return (
        <div className="bg-white rounded-xl p-4 mb-6">
            <p className="font-medium mb-3">My Accepted Sessions</p>
            {isFetching ? (
                <p className="text-sm text-gray-light">Loading...</p>
            ) : sessions.length === 0 ? (
                <p className="text-sm text-gray-light">No accepted sessions yet.</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {sessions.map((session) => {
                        const date = role === "volunteer" ? session.volunteer_start_date : session.learner_start_date;
                        const startTime = role === "volunteer" ? session.volunteer_start_time : session.learner_start_time;
                        const endTime = role === "volunteer" ? session.volunteer_end_time : session.learner_end_time;
                        const counterpartName =
                            role === "volunteer"
                                ? `${session.learner_first_name || ""} ${session.learner_last_name || ""}`.trim()
                                : session.volunteer_full_name;

                        return (
                            <div key={session.session_id} className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0">
                                <div>
                                    <p className="text-sm font-medium">{session.session_title}</p>
                                    {counterpartName && <p className="text-xs text-gray-light">{counterpartName}</p>}
                                </div>
                                <p className="text-xs text-gray-light whitespace-nowrap">
                                    {date ? formatDateSuffix(date) : ""}
                                    {startTime ? `, ${formatTime(startTime)}` : ""}
                                    {endTime ? `-${formatTime(endTime)}` : ""}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AcceptedSessionsList;
