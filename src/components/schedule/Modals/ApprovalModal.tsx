import SideModal from "@/components/common/Modals/SideModal";
import React, { useState, useEffect } from "react";
import NotificationCard from "@/components/schedule/NotificationCard";
import { NotificationCardSkeleton } from "@/components/schedule/NotificationCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GET_API, POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getCookie } from "@/utils/auth";
import InnerWidth from "@/utils/innerWidth";
import { ApprovalModalProps } from "./index.type.d";
import QueryErrorNotice from "@/components/common/QueryErrorNotice";
import { formatSessionDate } from "@/utils/sessionDisplay";

type SessionsData = {
    learner_first_name: string;
    learner_last_name: string;
    learner_picture: {
        image_url: string;
    };
    volunteer_full_name?: string;
    volunteer_picture?: {
        image_url: string;
    };
    session_date: string;
    session_start_time: string;
    session_end_time: string;
    session_title: string;
    session_id: string;
    overlapped_slot: boolean;
    volunteer_start_time: string;
    volunteer_end_time: string;
    volunteer_start_date: string;
    learner_start_time: string;
    learner_end_time: string;
    learner_start_date: string;
    is_read?: boolean;
};

interface NotificationData {
    date: string;
    sessions: SessionsData[];
}

// An accepted / declined / cancelled notice (GET session/notifications/recent). The title is
// ready-to-display text, e.g. "Val Completed declined your session request".
type OutcomeNotice = {
    notification_id: string;
    notification_type: "session_accepted" | "session_rejected" | "session_cancelled" | string;
    title: string;
    created_at: string | null;
};

const OUTCOME_DOT: Record<string, string> = {
    session_accepted: "bg-green-500",
    session_rejected: "bg-red-500",
    session_cancelled: "bg-amber-500",
};

const ApprovalModal: React.FC<ApprovalModalProps> = ({ isOpen, onClose, role = "volunteer" }) => {
    const [notificationsData, setNotificationsData] = useState<NotificationData[]>([]);
    const isLearner = role === "learner";
    const volunteerId = getCookie("volunteer_id");
    const learnerId = getCookie("learner_id");
    const queryClient = useQueryClient();

    const getNotifications = async () => {
        const response: any = await GET_API(
            isLearner
                ? endpoints.session.getPendingInvitesForLearner(learnerId as string)
                : endpoints.session.getApprovalNotifications(volunteerId as string)
        );
        return response?.data;
    };

    // isPending (first load only), not isFetching: the skeleton used to replace the list on
    // every background refetch (e.g. after accepting one request).
    const { data, isPending, isError, refetch } = useQuery({
        queryKey: [isLearner ? "learner-approval-notifications" : "approval-notifications", isOpen],
        queryFn: () => getNotifications(),
        enabled: isOpen,
    });

    // What happened to the user's own sessions. The bell badge counts these, so they are listed
    // here too; before, opening the panel marked them read without ever showing them.
    const outcomes = useQuery({
        queryKey: ["session-outcome-notifications", role, isOpen],
        queryFn: async (): Promise<OutcomeNotice[]> => {
            const res: any = await GET_API(endpoints.session.getRecentSessionOutcomes);
            return res?.data?.items ?? [];
        },
        enabled: isOpen,
    });
    const outcomeItems = outcomes.data ?? [];

    const handleUpdateReadsNotifications = async () => {
        // Opening the bell = "seen". Clear every unread session notification for this user,
        // not just the pending invites listed here - otherwise session_accepted /
        // session_rejected / session_cancelled notices never get marked read and the badge
        // count stays > 0 with nothing left to act on.
        try {
            await POST_API(endpoints.session.markAllNotificationsRead, {});
            queryClient.invalidateQueries({ queryKey: ["unread-count"] });
        } catch (error) {
            console.error("Error updating unread sessions:", error);
        }
    };

    useEffect(() => {
        if (data) {
            setNotificationsData(data?.items || []);
            handleUpdateReadsNotifications();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh the list and mark notifications read only when new data arrives
    }, [data]);

    const isMobileScreen = InnerWidth() < 768;

    return (
        <SideModal
            title="Approval Notifications"
            onClose={onClose}
            isOpen={isOpen}
            isNeedButton={false}
            modalWidth={isMobileScreen ? "100%" : 400}
        >
            <div className="flex flex-col gap-4 px-5 mt-5">
                {isPending ? (
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <NotificationCardSkeleton key={index} />
                        ))}
                    </div>
                ) : isError && !data ? (
                    <QueryErrorNotice message="Couldn't load your notifications." onRetry={() => refetch()} />
                ) : notificationsData.length > 0 ? (
                    notificationsData.map((notification) => (
                        <div key={notification?.date}>
                            <div className="relative inline-flex items-center justify-center w-full">
                                <hr className="w-full h-px my-6 bg-gray-light border-0" />
                                <span className="absolute -translate-x-1/2 left-1/2 px-3 font-semibold !text-sm !text-gray-light !bg-white">
                                    {formatSessionDate(notification?.date) || notification?.date}
                                </span>
                            </div>
                            <div className="flex flex-col gap-3">
                                {notification?.sessions?.map((session) => (
                                    <NotificationCard
                                        key={session?.session_id}
                                        data={session}
                                        viewerRole={role}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                ) : !outcomes.isPending && outcomeItems.length === 0 && !outcomes.isError ? (
                    <div className="flex flex-col gap-4 border rounded-xl p-4 border-[#E0E0E0] h-fit lg:w-[360px] items-center justify-center">
                        <p className="text-gray-light text-sm font-medium">
                            No Notifications Available
                        </p>
                    </div>
                ) : null}

                {outcomes.isError && !outcomes.data ? (
                    <QueryErrorNotice message="Couldn't load your recent updates." onRetry={() => outcomes.refetch()} />
                ) : outcomeItems.length > 0 ? (
                    <section aria-labelledby="recent-updates-heading">
                        <h3 id="recent-updates-heading" className="text-sm font-semibold mb-2">
                            Recent updates
                        </h3>
                        <ul className="flex flex-col gap-2">
                            {outcomeItems.map((n) => (
                                <li
                                    key={n.notification_id}
                                    className="flex items-start gap-3 border rounded-xl p-3 border-[#E0E0E0] text-sm"
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${OUTCOME_DOT[n.notification_type] ?? "bg-gray-400"}`}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-gray-900">{n.title}</p>
                                        {n.created_at && (
                                            <p className="text-xs text-gray-600">
                                                {new Date(n.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                            </p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}
            </div>
        </SideModal>
    );
};

export default ApprovalModal;
