import SideModal from "@/components/common/Modals/SideModal";
import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GET_API, PUT_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import dayjs from "dayjs";
import InnerWidth from "@/utils/innerWidth";
import type { ApprovalModalProps } from "./index.type.d";

// Same set as backend controllers/v1/session.py's SESSION_NOTIFICATION_TYPES - keeps this
// panel scoped to session events (booked/accepted/rejected/cancelled), matching what the
// header bell's badge count represents, rather than every unread notification (likes/comments/etc).
const SESSION_NOTIFICATION_TYPES = ["session_booked", "session_accepted", "session_rejected", "session_cancelled"];

type NotificationItem = {
    notification_id: string;
    notification_type: string;
    title?: string;
    created_at?: string;
};

// Learners don't approve sessions (that's a volunteer-only action), so this is a read-only
// list of recent session status updates rather than ApprovalModal's approve/reject flow.
const LearnerNotificationsModal: React.FC<ApprovalModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const isMobileScreen = InnerWidth() < 768;

    const { data, isFetching, isError } = useQuery({
        queryKey: ["learner-session-notifications", isOpen],
        queryFn: async () => {
            const res: any = await GET_API(`${endpoints.post.getNotifications}?page=1&size=50`);
            const items: NotificationItem[] = res?.data?.items || [];
            return items.filter((item) => SESSION_NOTIFICATION_TYPES.includes(item.notification_type));
        },
        enabled: isOpen,
    });

    useEffect(() => {
        if (!data || data.length === 0) return;
        const notificationIds = data.map((item) => item.notification_id);
        PUT_API(endpoints.post.readNotifications, notificationIds)
            .then(() => {
                queryClient.invalidateQueries({ queryKey: ["unread-count"] });
            })
            .catch(() => { });
    }, [data]);

    return (
        <SideModal
            title="Notifications"
            onClose={onClose}
            isOpen={isOpen}
            isNeedButton={false}
            modalWidth={isMobileScreen ? "100%" : 400}
        >
            <div className="flex flex-col gap-3 px-5 mt-5">
                {isFetching ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                ) : isError ? (
                    <p className="text-sm text-red-500">Error loading notifications</p>
                ) : data && data.length > 0 ? (
                    data.map((item) => (
                        <div key={item.notification_id} className="border border-[#E0E0E0] rounded-xl p-3">
                            <p className="text-sm font-medium">{item.title}</p>
                            {item.created_at && (
                                <p className="text-xs text-gray-light mt-1">
                                    {dayjs(item.created_at).format("D MMM YYYY, h:mm A")}
                                </p>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col gap-4 border rounded-xl p-4 border-[#E0E0E0] h-fit items-center justify-center">
                        <p className="text-gray-light text-sm font-medium">No Notifications Available</p>
                    </div>
                )}
            </div>
        </SideModal>
    );
};

export default LearnerNotificationsModal;
